const Question = require('../models/question');
const User = require('../models/user');
const { body, validationResult } = require('express-validator');

exports.loadQuestions = async (req, res, next, id) => {
  try {
    const question = await Question.findById(id);
    if (!question) return res.status(404).json({ message: 'Question not found.' });
    req.question = question;
  } catch (error) {
    if (error.name === 'CastError')
      return res.status(400).json({ message: 'Invalid question id.' });
    return next(error);
  }
  next();
};

exports.createQuestion = async (req, res, next) => {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    const errors = result.array({ onlyFirstError: true });
    return res.status(422).json({ message: errors[0].param + " " + errors[0].msg });
  }
  try {
    var { title, tags, text } = req.body;
    const author = req.user.id;
    if(tags == "[]")
      return res.status(422).json({ message: "choose at least one tag" });
    tags = tags.slice(1, -1).split(", ");
    const question = await Question.create({
      title,
      author,
      tags,
      text
    });
    res.status(201).json(question);
  } catch (error) {
    next(error);
  }
};

exports.show = async (req, res, next) => {
  try {
    const { id } = req.question;
    const question = await Question.findByIdAndUpdate(
      id,
      { $inc: { views: 1 } },
      { new: true }
    ).populate('answers');
    res.json(question);
  } catch (error) {
    next(error);
  }
};

exports.listQuestions = async (req, res, next) => {
  try {
    var { sortType = '-score', tags, search, favorite = false} = req.body;
    var filters = {title: { $regex: search, $options: 'i' }};

    if(tags != undefined && tags != "[]") {
      tags = tags.slice(1, -1).split(", ");
      filters = {  ...filters, tags: { $all: tags } };
    }
    if(favorite != "") 
      filters = { ...filters, favorites: favorite};

    const questions = await Question.find(filters).sort(sortType);
    res.json(questions);
  } catch (error) {
    next(error);
  }
};

exports.removeQuestion = async (req, res, next) => {
  try {
    await req.question.remove();
    res.status(200).json({ message: 'Your question is successfully deleted.' });
  } catch (error) {
    next(error);
  }
};

exports.favoriteQuestion = async (req, res, next) => {
  try {
    req.question.favorite(req.user.id);
    res.status(200).json(req.question);
  } catch (error) {
    next(error);
  }
};

exports.profile = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found.' });
    const questions = await Question.find();

    var questionsAsked = 0, answersGiven = 0;
    var helpfulAnswers = 0, answerScore = 0, questionScore = 0;

    questions.forEach(question => {
      if(question.author.id == userId)
      {
        questionsAsked++;
        questionScore += question.score;
      }
      question.answers.forEach(answer => {
        if(answer.author.id == userId)
        {
          answersGiven++;
          answerScore += answer.score;
          if(answer.helpful)
            helpfulAnswers++;
        }
      });
    });
    res.json({
      id: user._id,
      username: user.username,
      isPromotedToDiamond: user.isPromotedToDiamond,
      questionsAsked,
      answersGiven,
      helpfulAnswers,
      answerScore,
      questionScore
    });
  } catch (error) {
    next(error);
  }
};

exports.updateQuestion = async (req, res, next) => {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    const errors = result.array({ onlyFirstError: true });
    return res.status(422).json({ message: errors[0].param + " " + errors[0].msg });
  }

  if(req.question.answers.length != 0)
    return res.status(422).json({ message: "Cannot update question when answer has already been provided." });

  try {
    var { title, text, tags } = req.body;
    if(tags == "[]")
      return res.status(422).json({ message: "Choose at least one tag" });
    tags = tags.slice(1, -1).split(", ");
    const question = await req.question.updateQuestion(text,title,tags);
    res.json(question);
  } catch (error) {
    next(error);
  }
};

exports.questionValidate = [
  body('title')
    .exists()
    .trim()
    .withMessage('is required')

    .notEmpty()
    .withMessage('cannot be blank')

    .isLength({ min: 10 })
    .withMessage('must be at least 10 characters long')

    .isLength({ max: 60 })
    .withMessage('must be at most 180 characters long'),

  body('text')
    .exists()
    .trim()
    .withMessage('is required')

    .isLength({ min: 10 })
    .withMessage('must be at least 10 characters long')

    .isLength({ max: 280 })
    .withMessage('must be at most 280 characters long'),

  body('tags').exists().withMessage('is required')
];
