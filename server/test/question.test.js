const request = require('supertest');
const mongoose = require('mongoose');
const jwtDecode = require('jwt-decode');
const app = require('../app');
const { validUser, validQuestion } = require('./factories');
const User = mongoose.model('user');
const { hashPassword } = require('../utils/authentication');
const faker = require('faker');

process.env.TEST_SUITE = 'question';

describe.only('question endpoints', () => {
  let user;

  beforeEach(async () => {
    //not clearing database
    if (user == undefined) {
      user = validUser();
      const hashedPassword = await hashPassword(user.password);
      await new User({ ...user, password: hashedPassword }).save();
      const res = await request(app).post('/api/authenticate').send(user);
      const { token } = res.body;
      user.token = token;
    }
  });

  describe('/question', () => {
    it('inserts valid question', async () => {
      const res = await request(app)
        .post('/api/questions')
        .set('Authorization', 'Bearer ' + user.token)
        .send(validQuestion());
      expect(res.statusCode).toEqual(201);
    });
    it('inserts question tag missing', async () => {
      let q = validQuestion();
      const res = await request(app)
        .post('/api/questions')
        .set('Authorization', 'Bearer ' + user.token)
        .send({ ...q, tags: '' });
      expect(res.body.message).toBeDefined();
      expect(res.body.message).toContain('tag');

      expect(res.statusCode).toEqual(422);
    });
    it('inserts question short title', async () => {
      let q = validQuestion();
      const res = await request(app)
        .post('/api/questions')
        .set('Authorization', 'Bearer ' + user.token)
        .send({ ...q, title: 'Short' });
      expect(res.body.message).toBeDefined();
      expect(res.body.message).toContain('title');

      expect(res.statusCode).toEqual(422);
    });
    it('inserts question long title', async () => {
      let q = validQuestion();
      const res = await request(app)
        .post('/api/questions')
        .set('Authorization', 'Bearer ' + user.token)
        .send({ ...q, title: 'L'.repeat(80) });
      expect(res.body.message).toBeDefined();
      expect(res.body.message).toContain('title');
      expect(res.statusCode).toEqual(422);
    });
    it('inserts question short text', async () => {
      let q = validQuestion();
      const res = await request(app)
        .post('/api/questions')
        .set('Authorization', 'Bearer ' + user.token)
        .send({ ...q, text: 'Short' });
      expect(res.body.message).toBeDefined();
      expect(res.body.message).toContain('text');
      expect(res.statusCode).toEqual(422);
    });
  });
});
