const mongoose = require('mongoose');
const { connect } = require('../index');
const config = require('../config');

const clearDb = (done) => {
  mongoose.connection.dropDatabase();
  return done();
};

beforeEach(async (done) => {
  if (mongoose.connection.readyState === 0) {
    //await connect(`${config.db.test}-${process.env.DB_URL_TEST}`);
    await connect(config.db.test);
  }
  return clearDb(done);
});

afterEach(async (done) => {
  await mongoose.connection.close();
  return done();
});
