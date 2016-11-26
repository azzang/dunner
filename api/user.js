/* eslint-disable consistent-return */
const router = require('express').Router();
const User = require('../models/user');
const login = require('passport').authenticate('local');
const fs = require('fs');
const path = require('path');
const sendGridHelper = require('sendgrid').mail;
const sendGrid = require('sendgrid')(process.env.SENDGRID_API_KEY);

const fromEmail = new sendGridHelper.Email(process.env.FROM_EMAIL || 'test@example.com');

function getSendGridRequest(toEmailAddress, subject, contentText, contentType) {
  const toEmail = new sendGridHelper.Email(toEmailAddress);
  const content = new sendGridHelper.Content(`text/${contentType}`, contentText);
  const mail = new sendGridHelper.Mail(fromEmail, subject, toEmail, content);
  return sendGrid.emptyRequest({
    method: 'POST',
    path: '/v3/mail/send',
    body: mail.toJSON(),
  });
}

function register(req, res, next) {
  User.register(new User({ username: req.body.username }),
  req.body.password, (registerErr, user) => {
    if (registerErr) return next(registerErr);
    fs.readFile(path.join(__dirname, '../starter-recipes.json'), 'utf8', (readFileErr, recipes) => {
      if (readFileErr) return next(readFileErr);
      user.recipes = JSON.parse(recipes);
      user.save(next);
    });
  });
}

function sendRecipes(req, res) {
  res.json({ recipes: req.user.recipes });
}

function logout(req, res) {
  req.logout();
  res.sendStatus(200);
}

function removeRecipes(req, res, next) {
  const user = req.user;
  const recipeIds = req.query.id;
  if (Array.isArray(recipeIds)) {
    recipeIds.forEach(id => user.recipes.id(id).remove());
  } else {
    user.recipes.id(recipeIds).remove();
  }
  user.save(next);
}

function updateRecipe(req, res, next) {
  const user = req.user;
  const updatedRecipe = req.body.recipe;
  user.recipes.id(updatedRecipe._id).remove();
  user.recipes.push(updatedRecipe);
  user.save(next);
}

function createRecipe(req, res, next) {
  const user = req.user;
  delete req.body.recipe._id;
  user.recipes.push(req.body.recipe);
  user.save((err) => {
    if (err) return next(err);
    res.send(user.recipes[user.recipes.length - 1]._id);
  });
}

function emailResetLink(req, res, next) {
  User.findOne(req.body, (err, user) => {
    if (err) return next(err);
    if (user) {
      const resetUrl = `${req.protocol}://${req.headers.host}/reset-password/${user._id}`;
      const request = getSendGridRequest(req.body.username, 'Dunner Password Reset',
        `<a href="${resetUrl}">Click to reset password.</a>`, 'html');
      sendGrid.API(request, next);
    } else res.sendStatus(401);
  });
}

function resetPassword(req, res, next) {
  User.findById(req.body._id, (findByIdErr, user) => {
    if (findByIdErr) return next(findByIdErr);
    if (user) {
      user.setPassword(req.body.password, (setPasswordErr) => {
        if (setPasswordErr) return next(setPasswordErr);
        user.save(next);
      });
    } else res.sendStatus(401);
  });
}

function sendEmail(req, res, next) {
  const request = getSendGridRequest(req.user.username,
    req.body.mail.subject, req.body.mail.text, 'plain');
  sendGrid.API(request, next);
}

router.post('/register', register);
router.post('/login', login, sendRecipes);
router.get('/logout', logout);

router.route('/recipes')
  .delete(removeRecipes)
  .put(updateRecipe)
  .post(createRecipe);

router.post('/reset-password', emailResetLink);
router.put('/reset-password', resetPassword);

router.post('/mail', sendEmail);

module.exports = router;
