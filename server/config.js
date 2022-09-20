module.exports = {
  port: process.env.PORT || 8080,
  db: {
    prod: process.env.DB_URL || 'mongodb://localhost:27018/stackoverflow-clone',
    test: process.env.DB_URL_TEST || 'mongodb://localhost:27018/stackoverflow-test',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
      useCreateIndex: true
    }
  },
  jwt: {
    secret: process.env.TOKEN_SECRET || 'development_secret',
    expiry: '90d'
  }
};
