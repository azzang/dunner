const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');

const Schema = mongoose.Schema;

const directionSchema = new Schema({
  description: String,
  duration: Number,
}, { _id: false });

const ingredientSchema = new Schema({
  name: String,
  number: Number,
  units: String,
}, { _id: false });

const recipeSchema = new Schema({
  name: String,
  ingredients: [ingredientSchema],
  directions: [directionSchema],
});

const userSchema = new Schema({
  username: String,
  password: String,
  recipes: [recipeSchema],
});

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', userSchema);
