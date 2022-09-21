const faker = require('faker');

exports.validUser = () => ({
  email: faker.internet.email().toLowerCase(),
  username: faker.name.firstName(),
  password: 'password',
  role: 'user',
  isPromotedToDiamond: false
});

exports.validQuestion = () => ({
  title: 'Gremo mi po svoje?',
  tags: 'movie,test',
  text: 'Young scouts lost in nature. How fast I delete line?'
});

exports.validAnswer = () => ({
  text: 'You always have last word.'
});