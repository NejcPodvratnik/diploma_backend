const request = require('supertest');
const mongoose = require('mongoose');
const jwtDecode = require('jwt-decode');
const app = require('../app');
const { validUser } = require('./factories');
const User = mongoose.model('user');
const { hashPassword } = require('../utils/authentication');
const faker = require('faker');

process.env.TEST_SUITE = 'auth';

describe('auth endpoints', () => {
  let user;
  const username = {
    nonExisting: 'new',
    invalid: 'user!$@',
    long: 'a'.repeat(33),
    blank: ''
  };
  const email = {
    nonExisting: 'new@meni.si',
    invalid: 'user!$@',
    blank: ''
  };
  const password = {
    wrong: 'incorrect',
    short: 'aaa',
    long: 'a'.repeat(73),
    blank: ''
  };

  beforeEach(async () => {
    //clearDb();
    await mongoose.connection.dropDatabase();
    user = validUser();
    const hashedPassword = await hashPassword(user.password);
    await new User({ ...user, password: hashedPassword }).save();
  });

  describe('/authenticate', () => {
    it('rejects requests with no credentials', async () => {
      const res = await request(app).post('/api/authenticate');
      expect(res.body.message).toBeDefined();
      expect(res.body.message).toContain('required');
      expect(res.statusCode).toEqual(422);
    });

    it('reject requests with incorrect email', async () => {
      const res = await request(app)
        .post('/api/authenticate')
        .send({ ...user, email: email.nonExisting });
      expect(res.body.message).toContain('Wrong email or password.');

      expect(res.statusCode).toEqual(403);
    });

    it('reject requests with incorrect password', async () => {
      const res = await request(app)
        .post('/api/authenticate')
        .send({ ...user, password: password.wrong });
      expect(res.body.message).toContain('Wrong email or password.');

      expect(res.statusCode).toEqual(403);
    });

    it('returns a valid auth token', async () => {
      const res = await request(app).post('/api/authenticate').send(user);
      //.expect('Content-Type', /json/)
      const { token } = res.body;
      const decodedToken = jwtDecode(token);
      expect(decodedToken.email).toEqual(user.email);
      expect(res.statusCode).toEqual(200);
    });
  });

  describe('/signup', () => {
    it('rejects requests with missing fields', async () => {
      const res = await request(app).post('/api/signup');
      expect(res.body.message).toBeDefined();
      expect(res.body.message).toContain('required');

      expect(res.statusCode).toEqual(422);
    });

    it('rejects requests with blank name', async () => {
      const res = await request(app)
        .post('/api/signup')
        .send({ ...user, email: email.blank });
      expect(res.body.message).toBeDefined();
      expect(res.body.message).toContain('cannot be blank');

      expect(res.statusCode).toEqual(422);
    });

    it('rejects requests with blank password', async () => {
      const res = await request(app)
        .post('/api/signup')
        .send({ ...user, password: password.blank });
      expect(res.body.message).toBeDefined();
      expect(res.body.message).toContain('cannot be blank');

      expect(res.statusCode).toEqual(422);
    });

    it('rejects requests with invalid name', async () => {
      const res = await request(app)
        .post('/api/signup')
        .send({ ...user, email: email.invalid });
      expect(res.body.message).toBeDefined;
      expect(res.body.message).toContain('wrong');

      expect(res.statusCode).toEqual(422);
    });

    it('rejects request with password that is too long', async () => {
      const res = await request(app)
        .post('/api/signup')
        .send({ ...user, password: password.long });
      expect(res.body.message).toBeDefined();
      expect(res.body.message).toContain('at most 50 characters long');

      expect(res.statusCode).toEqual(422);
    });

    it('rejects requests with password that is too short', async () => {
      const res = await request(app)
        .post('/api/signup')
        .send({ ...user, password: password.short });
      expect(res.body.message).toBeDefined();
      expect(res.body.message).toContain('at least 6 characters long');

      expect(res.statusCode).toEqual(422);
    });

    it('rejects requests with existing email', async () => {
      const res = await request(app)
        .post('/api/signup')
        .send({ ...user, username: faker.name.firstName() });
      expect(res.body.message).toBeDefined();
      expect(res.body.message).toContain('already');
      expect(res.statusCode).toEqual(422);
    });
    it('rejects requests with existing username', async () => {
      const res = await request(app)
        .post('/api/signup')
        .send({ ...user, email: faker.internet.email().toLowerCase() });
      expect(res.body.message).toBeDefined();
      expect(res.body.message).toContain('already');
      expect(res.statusCode).toEqual(422);
    });

    it('creates a new user and returns a valid auth token', async () => {
      user.email = 'a' + user.email; //one user already in db
      user.username = 'a' + user.username;
      const res = await request(app).post('/api/signup').send(user);
      //  .expect('Content-Type', /json/)
      const { token } = res.body;
      const decodedToken = jwtDecode(token);
      expect(decodedToken.email.toLowerCase()).toEqual(user.email.toLowerCase());
      expect(res.statusCode).toEqual(201);
    });
  });
});
