const request = require('supertest');
const mongoose = require('mongoose');
const jwtDecode = require('jwt-decode');
const app = require('../app');
const { validUser, validQuestion, validAnswer } = require('./factories');
const User = mongoose.model('user');
const { hashPassword } = require('../utils/authentication');
const faker = require('faker');

process.env.TEST_SUITE = 'question';

describe.only('answer endpoints', () => {
  let user;
  let userVoter;
  let question;

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
    if (userVoter == undefined) {
      userVoter = validUser();
      const hashedPassword = await hashPassword(userVoter.password);
      await new User({ ...userVoter, password: hashedPassword }).save();
      const res = await request(app).post('/api/authenticate').send(userVoter);
      const { token } = res.body;
      userVoter.token = token;
    }
    if (question == undefined) {
      question = validQuestion();
      const res = await request(app)
        .post('/api/questions')
        .set('Authorization', 'Bearer ' + user.token)
        .send(validQuestion());
      question.id = res.body.id;
    }
  });
  describe('/question vote', () => {
    it('vote for question', async () => {
      const res = await request(app)
        .get('/api/votes/upvote/' + question.id)
        .set('Authorization', 'Bearer ' + userVoter.token)
        .send();
      expect(res.statusCode).toEqual(200);
    });
    it('vote for own question', async () => {
      const res = await request(app)
        .get('/api/votes/upvote/' + question.id)
        .set('Authorization', 'Bearer ' + user.token)
        .send();
      expect(res.statusCode).toEqual(400);
    });
  });

  describe('/answer', () => {
    let answer = validAnswer();
    //naming 1.. it ordes test by name
    it('1inserts valid answer', async () => {
      const res = await request(app)
        .post('/api/answer/' + question.id)
        .set('Authorization', 'Bearer ' + user.token)
        .send(validAnswer());
      expect(res.statusCode).toEqual(201);
      answer.id = res.body.answers[0]._id;
    });
    it('2vote inserts valid answer', async () => {
      expect(answer.id).toBeDefined();
      const res = await request(app)
        .get('/api/votes/upvote/' + question.id + '/' + answer.id)
        .set('Authorization', 'Bearer ' + userVoter.token)
        .send();
      expect(res.statusCode).toEqual(200);
    });
    it('3vote for own answer', async () => {
      expect(answer.id).toBeDefined();
      const res = await request(app)
        .get('/api/votes/upvote/' + question.id + '/' + answer.id)
        .set('Authorization', 'Bearer ' + user.token)
        .send();
      expect(res.statusCode).toEqual(400);
    });
  });
});
