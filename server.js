const express = require('express');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const expressSession = require('express-session');
const mongoose = require('mongoose');
const path = require('path');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('./models/user');
const userRouter = require('./api/user');

const app = express();

mongoose.connect('mongodb://localhost/dunner');

app.use(logger('dev'));
app.use(express.static('src'));
app.use('/bower_components', express.static('bower_components'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(expressSession({
  secret: 'insert cutesyness',
  resave: false,
  saveUninitialized: false,
}));
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use('/user', userRouter); // api

app.use((req, res) => { // fallback
  res.sendFile(path.join(__dirname, 'src', 'index.html'));
});

app.use((req, res, next) => { // error handlers
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

app.use((err, req, res) => {
  res.status(err.status || 500);
  res.end(JSON.stringify({
    message: err.message,
    error: {},
  }));
});

app.listen(3000);

module.exports = app;
