const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const voteSchema = require('./vote');
const answerSchema = require('./answer');

const questionSchema = new Schema({
  author: {
    type: Schema.Types.ObjectId,
    ref: 'user',
    required: true
  },
  title: { type: String, required: true },
  text: { type: String, required: true },
  tags: [{ type: String, required: true }],
  score: { type: Number, default: 0 },
  votes: [voteSchema],
  favorites: [{
    type: Schema.Types.ObjectId,
  }],
  answers: [answerSchema],
  created: { type: Date, default: Date.now },
  views: { type: Number, default: 0 }
});

questionSchema.set('toJSON', { getters: true });

questionSchema.options.toJSON.transform = (doc, ret) => {
  const obj = { ...ret };
  delete obj._id;
  delete obj.__v;
  return obj;
};

questionSchema.methods = {
  vote: function (user, vote) {
    const existingVote = this.votes.find((v) => v.user._id.equals(user));

    if (existingVote) {
      // reset score
      this.score -= existingVote.vote;
      if (vote == 0) {
        // remove vote
        this.votes.pull(existingVote);
      } else {
        //change vote
        this.score += vote;
        existingVote.vote = vote;
      }
    } else if (vote !== 0) {
      // new vote
      this.score += vote;
      this.votes.push({ user, vote });
    }

    return this.save();
  },

  addAnswer: function (author, text) {
    this.answers.push({ author, text });
    return this.save();
  },

  updateAnswer: function (id, text) {
    const answer = this.answers.id(id);
    const index = this.answers.indexOf(answer);
    this.answers[index].text = text;
    this.answers[index].created = Date.now();
    //console.log(Date.now());
    return this.save();
  },

  removeAnswer: function (id) {
    const answer = this.answers.id(id);
    if (!answer) throw new Error('Answer not found');
    answer.remove();
    return this.save();
  },

  favorite: function (id) {
    const existingId = this.favorites.find((v) => v.equals(id));
    if (existingId) 
      this.favorites.pull(existingId);
    else
      this.favorites.push(id);    
    return this.save();
  },

  toggleHelpful: function (id) {
    const answer = this.answers.id(id);
    answer.helpful = !answer.helpful; 
    return this.save();
  },

  updateQuestion: function (text, title, tags) {
    this.title = title;
    this.text = text;
    this.tags = tags;
    this.created = Date.now();
    return this.save();
  },
};
/*
questionSchema.pre(/^find/, function () {
  this.populate('author')
    .populate('comments.author', '-role')
    .populate('answers.author', '-role')
    .populate('answers.comments.author', '-role');
});

questionSchema.post('save', function (doc, next) {
  //if (this.wasNew) this.vote(this.author._id, 1);
  doc
    .populate('author')
    .populate('answers.author', '-role')
    .populate('answers.comments.author', '-role')
    .execPopulate()
    .then(() => next());
});
*/

questionSchema.pre(/^find/, function () {
  this.populate('author')
    .populate('answers.author')
});

questionSchema.post('save', function (doc, next) {
  doc
    .populate('author')
    .populate('answers.author')
    .execPopulate()
    .then(() => next());
});

module.exports = mongoose.model('Question', questionSchema);
