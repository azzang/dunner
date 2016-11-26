/* eslint-env node, mocha */
const User = require('../models/user');
const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../server');

const should = chai.should();

chai.use(chaiHttp);

describe('User API', () => {
  const agent = chai.request.agent(app);

  const toyRecipe = {
    name: 'Fried Egg',
    ingredients: [{ name: 'egg' }],
    directions: [{ description: 'Fry the egg?' }],
  };

  var secondRecipeID; // eslint-disable-line no-var

  var thirdRecipeID; // eslint-disable-line no-var

  before((done) => {
    User.remove({ username: 'stuff@blah.com' }, () => {
      done();
    });
  });

  describe('Register', () => {
    it('should be able to register new users', (done) => {
      chai.request(app)
        .post('/user/register')
        .send({
          username: 'stuff@blah.com',
          password: 'password',
        }).end((err, res) => {
          res.should.have.status(200);
          done();
        });
    });
  });

  describe('Login', () => {
    it('should be able to login registered users, and return their recipe collections', (done) => {
      agent.post('/user/login')
        .send({
          username: 'stuff@blah.com',
          password: 'password',
        }).end((err, res) => {
          res.should.have.status(200);
          res.should.be.json; // eslint-disable-line no-unused-expressions
          res.body.should.have.property('recipes');
          res.body.recipes.should.be.a('array');
          res.body.recipes.should.have.lengthOf(2);
          res.body.recipes[0].name.should.contain('Steak');
          done();
        });
    });
  });

  describe('Create', () => {
    it('should be able to create a recipe, and return a new recipe id', (done) => {
      agent.post('/user/recipes')
        .send({ recipe: toyRecipe })
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('string');
          res.body.should.match(/^[0-9a-fA-F]{24}$/); // should match mongoose id
          toyRecipe._id = res.body;
          done();
        });
    });
  });

  describe('Copy', () => {
    it('should be able to copy a recipe, and return a new recipe id', (done) => {
      const oldId = toyRecipe._id;
      agent.post('/user/recipes')
        .send({ recipe: toyRecipe })
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('string');
          res.body.should.not.equal(oldId);
          res.body.should.match(/^[0-9a-fA-F]{24}$/);
          secondRecipeID = res.body;
        });
      agent.post('/user/recipes') // copy a second time for delete tests
        .send({ recipe: toyRecipe })
        .end((err, res) => {
          thirdRecipeID = res.body;
          done();
        });
    });
  });

  describe('Edit', () => {
    it('should be able to edit recipes', (done) => {
      toyRecipe.ingredients.push({ name: 'salt' });
      agent.put('/user/recipes')
        .send({ recipe: toyRecipe })
        .end((putErr, res) => {
          res.should.have.status(200);
          User.findOne({ username: 'stuff@blah.com' }, (findOneErr, user) => {
            const ingredientNames = user.recipes.id(toyRecipe._id).ingredients
              .map(ingredient => ingredient.name);
            ingredientNames.should.have.lengthOf(2);
            ingredientNames.should.include('salt');
            ingredientNames.should.include('egg');
            done();
          });
        });
    });
  });

  describe('Delete One', () => {
    it('should be able to delete one recipe', (done) => {
      agent.delete(`/user/recipes?id=${toyRecipe._id}`)
        .end((deleteErr, res) => {
          res.should.have.status(200);
          User.findOne({ username: 'stuff@blah.com' }, (findOneErr, user) => {
            user.recipes.should.have.lengthOf(4);
            should.equal(user.recipes.id(toyRecipe._id), null);
            done();
          });
        });
    });
  });

  describe('Delete Many', () => {
    it('should be able to delete more than one recipe', (done) => {
      agent.delete(`/user/recipes?id=${secondRecipeID}&id=${thirdRecipeID}`)
        .end((deleteErr, res) => {
          res.should.have.status(200);
          User.findOne({ username: 'stuff@blah.com' }, (findOneErr, user) => {
            user.recipes.should.have.lengthOf(2);
            should.equal(user.recipes.id(secondRecipeID), null);
            should.equal(user.recipes.id(thirdRecipeID), null);
            done();
          });
        });
    });
  });
});
