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
    user = validUser();
    console.log('--------------------------------');
    console.log(user);
    console.log('--------------------------------');
    const hashedPassword = await hashPassword(user.password);
    await new User({ ...user, password: hashedPassword }).save();
  });

  describe('/authenticate', () => {
    it('rejects requests with no credentials', (done) => {
      request(app)
        .post('/api/authenticate')
        .expect((res) => {
          expect(res.body.message).toBeDefined();
          expect(res.body.message).toContain('required');
        })
        .expect(422, done);
    });

    it('reject requests with incorrect email', (done) => {
      request(app)
        .post('/api/authenticate')
        .send({ ...user, email: email.nonExisting })
        .expect((res) => {
          expect(res.body.message).toContain('Wrong email or password.');
        })
        .expect(403, done);
    });

    it('reject requests with incorrect password', (done) => {
      request(app)
        .post('/api/authenticate')
        .send({ ...user, password: password.wrong })
        .expect((res) => {
          expect(res.body.message).toContain('Wrong email or password.');
        })
        .expect(403, done);
    });

    it('returns a valid auth token', (done) => {
      request(app)
        .post('/api/authenticate')
        .send(user)
        .expect('Content-Type', /json/)
        .expect((res) => {
          const { token } = res.body;
          const decodedToken = jwtDecode(token);
          expect(decodedToken.email).toEqual(user.email);
        })
        .expect(200, done);
    });
  });

  describe('/signup', () => {
    it('rejects requests with missing fields', (done) => {
      request(app)
        .post('/api/signup')
        .expect((res) => {
          expect(res.body.message).toBeDefined();
          expect(res.body.message).toContain('required');
        })
        .expect(422, done);
    });

    it('rejects requests with blank name', (done) => {
      request(app)
        .post('/api/signup')
        .send({ ...user, email: email.blank })
        .expect((res) => {
          expect(res.body.message).toBeDefined();
          expect(res.body.message).toContain('cannot be blank');
        })
        .expect(422, done);
    });

    it('rejects requests with blank password', (done) => {
      request(app)
        .post('/api/signup')
        .send({ ...user, password: password.blank })
        .expect((res) => {
          expect(res.body.message).toBeDefined();
          expect(res.body.message).toContain('cannot be blank');
        })
        .expect(422, done);
    });

    it('rejects requests with invalid name', (done) => {
      request(app)
        .post('/api/signup')
        .send({ ...user, email: email.invalid })
        .expect((res) => {
          expect(res.body.message).toBeDefined;
          expect(res.body.message).toContain('wrong');
        })
        .expect(422, done);
    });

    it('rejects request with password that is too long', (done) => {
      request(app)
        .post('/api/signup')
        .send({ ...user, password: password.long })
        .expect((res) => {
          expect(res.body.message).toBeDefined();
          expect(res.body.message).toContain('at most 50 characters long');
        })
        .expect(422, done);
    });

    it('rejects requests with password that is too short', (done) => {
      request(app)
        .post('/api/signup')
        .send({ ...user, password: password.short })
        .expect((res) => {
          expect(res.body.message).toBeDefined();
          expect(res.body.message).toContain('at least 6 characters long');
        })
        .expect(422, done);
    });

    it('rejects requests with existing email', (done) => {
      request(app)
        .post('/api/signup')
        .send({ ...user, username: faker.name.firstName().toLowerCase() })
        .expect((res) => {
          expect(res.body.message).toBeDefined();
          expect(res.body.message).toContain('already');
        })
        .expect(422, done);
    });
    it('rejects requests with existing username', (done) => {
      request(app)
        .post('/api/signup')
        .send({ ...user, email: faker.internet.email() })
        .expect((res) => {
          expect(res.body.message).toBeDefined();
          expect(res.body.message).toContain('already');
        })
        .expect(422, done);
    });

    it('creates a new user and returns a valid auth token', (done) => {
      user.email = 'A' + user.email; //one user already in db
      user.username = 'A' + user.username;

      request(app)
        .post('/api/signup')
        .send(user)
        //  .expect('Content-Type', /json/)
        .expect((res) => {
          const { token } = res.body;
          const decodedToken = jwtDecode(token);
          expect(decodedToken.email.toLowerCase()).toEqual(user.email.toLowerCase());
        })
        .expect(201, done);
    });
  });
});
