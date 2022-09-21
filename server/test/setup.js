const mongoose = require('mongoose');
const { connect } = require('../index');
const config = require('../config');

const clearDb = async () => {
  await mongoose.connection.dropDatabase();
  //return done();
};

beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    //await connect(`${config.db.test}-${process.env.DB_URL_TEST}`);
    await connect(config.db.test);
  }

  await mongoose.connection.dropDatabase();
});

beforeEach(async () => {
  if (mongoose.connection.readyState === 0) {
    //await connect(`${config.db.test}-${process.env.DB_URL_TEST}`);
    await connect(config.db.test);
  }
  //return clearDb(done);
  // return done();
});

afterAll(async () => {
  await mongoose.connection.close();
  // return done();
});

/*afterEach(async (done) => {
//  await mongoose.connection.close();
  return done();
});
*/


