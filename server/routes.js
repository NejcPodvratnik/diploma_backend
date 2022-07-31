const {
  validateSignUp,
  validateAuthenticate,
  signup,
  authenticate,
  listUsers,
  search,
  find,
  promoteToDiamond
} = require('./controllers/users');
const {
  loadQuestions,
  questionValidate,
  createQuestion,
  show,
  listQuestions,
  removeQuestion,
  favoriteQuestion,
  profile
} = require('./controllers/questions');
const {
  loadAnswers,
  answerValidate,
  createAnswer,
  removeAnswer,
  helpfulAnswer,
  updateAnswer
} = require('./controllers/answers');
const { 
  upvote,
  downvote,
  unvote
} = require('./controllers/votes');

const requireAuth = require('./middlewares/requireAuth');
const questionAuth = require('./middlewares/questionAuth');
const answerAuth = require('./middlewares/answerAuth');
const cannotVoteSelf = require('./middlewares/cannotVoteSelf');
const requireAdmin = require('./middlewares/requireAdmin');

const router = require('express').Router();

//authentication
router.post('/signup', validateSignUp, signup);
router.post('/authenticate', validateAuthenticate, authenticate);

//users
router.get('/users', listUsers);
router.get('/users/:search', search);
router.get('/user/:id', find);
router.get('/user/profile/:id', profile);
router.get('/user/promoteToDiamond/:id', [requireAuth, requireAdmin], promoteToDiamond);

//questions
router.param('question', loadQuestions);
router.post('/questions', [requireAuth, questionValidate], createQuestion);
router.post('/question', listQuestions);
router.get('/question/:question', show);
router.get('/question/favorite/:question', [requireAuth], favoriteQuestion);
router.delete('/question/:question', [requireAuth, questionAuth], removeQuestion);

//answers
router.param('answer', loadAnswers);
router.post('/answer/:question', [requireAuth, answerValidate], createAnswer);
router.get('/answer/helpful/:question/:answer', [requireAuth, questionAuth], helpfulAnswer);
router.put('/answer/:question/:answer', [requireAuth,answerAuth, answerValidate], updateAnswer);
router.delete('/answer/:question/:answer', [requireAuth, answerAuth], removeAnswer);

//votes
router.get('/votes/upvote/:question/:answer?', [requireAuth, cannotVoteSelf], upvote);
router.get('/votes/downvote/:question/:answer?', [requireAuth, cannotVoteSelf], downvote);
router.get('/votes/unvote/:question/:answer?', [requireAuth, cannotVoteSelf], unvote);

module.exports = (app) => {
  app.use('/api', router);

  app.use((req, res, next) => {
    const error = new Error('Not found');
    error.status = 404;
    next(error);
  });

  app.use((error, req, res, next) => {
    res.status(error.status || 500).json({
      message: error.message
    });
  });
};
