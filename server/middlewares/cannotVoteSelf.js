const cannotVoteSelf = (req, res, next) => {
    const { id } = req.user;
    if (req.answer && req.answer.author.id == id) 
        return res.status(400).json({ message: 'Cannot vote your own answer.' });
    if (!req.answer && req.question.author.id == id) 
        return res.status(400).json({ message: 'Cannot vote your own question.' });
    return next();
  };
  
  module.exports = cannotVoteSelf;