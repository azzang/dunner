angular.module('dunner').factory('recipeService', () => {
  let recipes;

  let nextCollection; // prepared in cook plan and cook controllers

  class Ingredient {
    constructor() {
      this.name = '';
      this.number = '';
      this.units = '';
    }
  }

  class Direction {
    constructor() {
      this.description = '';
      this.duration = '';
    }
  }

  class Recipe {
    constructor() {
      this.name = '';
      this.ingredients = [new Ingredient()];
      this.directions = [new Direction()];
    }
  }

  const getNextCollection = () => nextCollection;

  const getHubRecipes = () => _.each(recipes, recipe => (recipe.checked = false));

  const getSelectedRecipes = () => angular.copy(_.where(recipes, { checked: true }));

  const getEditRecipe = () => getSelectedRecipes()[0] || new Recipe();

  function setRecipes(newRecipes) {
    recipes = newRecipes;
  }

  function setNextCollection(collection) {
    nextCollection = collection;
  }

  /* repeatedly cloning results in duplicate hashKeys: angular will throw
     error if not omitted */

  function saveAs(newRecipe) {
    recipes.push(_.omit(newRecipe, '$$hashKey'));
  }

  function save(updatedRecipe) {
    recipes = _.reject(recipes, recipe => recipe._id === updatedRecipe._id);
    saveAs(updatedRecipe);
  }

  function getCookPlanRecipes() {
    const cookPlanRecipes = getSelectedRecipes();
    return _.map(cookPlanRecipes, (recipe) => {
      recipe.relativeFinishTime = { value: 0, max: '' };
      recipe.directions = _.filter(recipe.directions, direction => direction.duration);
      recipe.totalDuration = recipe.directions.reduce((total, direction) =>
      total + direction.duration, 0);
      return _.pick(recipe, 'name', 'directions', 'totalDuration', 'relativeFinishTime');
    });
  }

  function getPrepRecipes() {
    const prepRecipes = getSelectedRecipes();
    let durations;
    return _.map(prepRecipes, (recipe) => {
      recipe.isScalable = false;
      _.each(recipe.ingredients, (ingredient) => {
        if (ingredient.number) {
          recipe.isScalable = true;
          ingredient.scaledAmount = ingredient.number.toFixed(2);
        }
      });
      recipe.scaleFactor = 1;
      durations = _.groupBy(recipe.directions, direction => Boolean(direction.duration));
      recipe.prepSteps = durations.false || [];
      recipe.cookSteps = durations.true || [];
      return _.pick(recipe, 'name', 'ingredients', 'isScalable', 'scaleFactor',
      'prepSteps', 'cookSteps');
    });
  }

  return {
    setRecipes,
    save,
    saveAs,
    getHubRecipes,
    getEditRecipe,
    Ingredient,
    Direction,
    getPrepRecipes,
    getCookPlanRecipes,
    setNextCollection,
    getNextCollection,
  };
});
