const User = require('../models/user');
const jwtDecode = require('jwt-decode');
const { validate } = require('deep-email-validator');
const { body, validationResult } = require('express-validator');

const { createToken, hashPassword, verifyPassword } = require('../utils/authentication');

exports.signup = async (req, res) => {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    const errors = result.array({ onlyFirstError: true });
    return res.status(422).json({ message: errors[0].param + ' ' + errors[0].msg });
  }

  try {
    const { username, email } = req.body;
    if (process.env.TEST_SUITE === undefined) {
      //Skip this strong email check (smtp...) if testing
      const { valid, reason, validators } = await validate(email);
      if (!valid) return res.status(422).json({ message: `email is not valid (${reason})` });
    }
    const hashedPassword = await hashPassword(req.body.password);

    const userData = {
      email: email.toLowerCase(),
      username: username,
      password: hashedPassword
    };

    const existingUsername = await User.findOne({
      username: userData.username
    }).exec();

    if (existingUsername) {
      return res.status(422).json({
        message: 'Username already exists.'
      });
    }

    const existingEmail = await User.findOne({
      email: userData.email
    }).exec();

    if (existingEmail) {
      return res.status(422).json({
        message: 'Email already exists.'
      });
    }

    const newUser = new User(userData);
    const savedUser = await newUser.save();

    if (savedUser) {
      const token = createToken(savedUser);
      const decodedToken = jwtDecode(token);
      const expiresAt = decodedToken.exp;

      const { email, username, role, isPromotedToDiamond, id, created, profilePhoto } = savedUser;
      const userInfo = {
        email,
        username,
        role,
        isPromotedToDiamond,
        id,
        created,
        profilePhoto
      };

      return res.status(201).json({
        message: 'User created!',
        token,
        userInfo,
        expiresAt
      });
    } else {
      return res.status(400).json({
        message: 'There was a problem creating your account.'
      });
    }
  } catch (error) {
    return res.status(400).json({
      message: 'There was a problem creating your account.'
    });
  }
};

exports.authenticate = async (req, res) => {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    const errors = result.array({ onlyFirstError: true });
    return res.status(422).json({ message: errors[0].param + ' ' + errors[0].msg });
  }

  try {
    const { email, password } = req.body;
    const user = await User.findOne({
      email: email
    });

    if (!user) {
      return res.status(403).json({
        message: 'Wrong email or password.'
      });
    }

    const passwordValid = await verifyPassword(password, user.password);

    if (passwordValid) {
      const token = createToken(user);
      const decodedToken = jwtDecode(token);
      const expiresAt = decodedToken.exp;
      const { email, username, role, isPromotedToDiamond, id, created, profilePhoto } = user;
      const userInfo = { email, username, role, isPromotedToDiamond, id, created, profilePhoto };

      res.json({
        message: 'Authentication successful!',
        token,
        userInfo,
        expiresAt
      });
    } else {
      res.status(403).json({
        message: 'Wrong email or password.'
      });
    }
  } catch (error) {
    return res.status(400).json({
      message: 'Something went wrong.'
    });
  }
};

exports.listUsers = async (req, res, next) => {
  try {
    const { sortType = '-created' } = req.body;
    const users = await User.find().sort(sortType);
    res.json(users);
  } catch (error) {
    next(error);
  }
};

exports.search = async (req, res, next) => {
  try {
    const users = await User.find({ username: { $regex: req.params.search, $options: 'i' } });
    res.json(users);
  } catch (error) {
    next(error);
  }
};

exports.find = async (req, res, next) => {
  try {
    const users = await User.findById(req.params.id);
    res.json(users);
  } catch (error) {
    next(error);
  }
};

exports.promoteToDiamond = async (req, res, next) => {
  try {
    var user = await User.findById(req.params.id);
    user.promoteToDiamond();
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

exports.validateSignUp = [

  body('email')
    .exists()
    .trim()
    .withMessage('is required')

    .notEmpty()
    .withMessage('cannot be blank')
    
    .isEmail()
    .withMessage('is in wrong format'),

  body('username')
    .exists()
    .trim()
    .withMessage('is required')

    .notEmpty()
    .withMessage('cannot be blank')

    .isLength({ max: 16 })
    .withMessage('must be at most 16 characters long')

    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage('contains invalid characters'),

  body('password')
    .exists()
    .trim()
    .withMessage('is required')

    .notEmpty()
    .withMessage('cannot be blank')

    .isLength({ min: 6 })
    .withMessage('must be at least 6 characters long')

    .isLength({ max: 50 })
    .withMessage('must be at most 50 characters long')
];

exports.validateAuthenticate = [

  body('email')
    .exists()
    .trim()
    .withMessage('is required')

    .notEmpty()
    .withMessage('cannot be blank')
    
    .isEmail()
    .withMessage('is in wrong format'),

  body('password')
    .exists()
    .trim()
    .withMessage('is required')

    .notEmpty()
    .withMessage('cannot be blank')

    .isLength({ min: 6 })
    .withMessage('must be at least 6 characters long')

    .isLength({ max: 50 })
    .withMessage('must be at most 50 characters long')
];
