const faker = require('faker');

exports.validUser = () => ({
  email: faker.internet.email().toLowerCase(),
  username: faker.name.firstName(),
  password: 'password',
  role: 'user',
  isPromotedToDiamond: false
});