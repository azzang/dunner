angular.module('dunner').controller('prepController', ['$scope', 'authService',
  'alertService', '$http', '$uibModal', 'recipeService', 'emailService',
  ($scope, authService, alertService, $http, $uibModal, recipeService, emailService) => {
    angular.extend($scope, authService, alertService, emailService);

    $scope.navbarButtons = 'email-ingredients.html';

    $scope.navbarLinks = [
      'to-cook.html',
      'to-help.html',
      'logout.html',
    ];

    $scope.recipes = recipeService.getPrepRecipes();

    $scope.toggleLineThrough = (prepStep) => {
      prepStep.done = !prepStep.done;
    };

    $scope.openCookPlanModal = () => {
      $uibModal.open({
        templateUrl: 'cook-plan.html',
        controller: 'cookPlanController',
      });
    };

    $scope.scaleIngredients = (recipe) => {
      _.each(recipe.ingredients, (ingredient) => {
        if (ingredient.number) {
          ingredient.scaledAmount = (recipe.scaleFactor * ingredient.number).toFixed(2);
        }
      });
    };

    $scope.emailIngredients = () => {
      const namesAndScaleFactors = _.chain($scope.recipes)
        .map(recipe => (recipe.scaleFactor === 1 ? recipe.name :
          `${recipe.name} × ${recipe.scaleFactor}`))
        .sortBy(name => name.toLowerCase()).value()
        .join(' + ');
      const scaledIngredients = _.chain($scope.recipes)
        .map(recipe =>
          _.map(recipe.ingredients, ingredient =>
            _.chain(ingredient).pick('name', 'scaledAmount', 'units')
            .values().filter(Boolean)
            .value()
            .join(' | ')))
        .flatten()
        .sortBy(ingredient => ingredient.toLowerCase())
        .value()
        .join('\n');
      $scope.sendEmail(`Ingredients for ${namesAndScaleFactors}`,
        scaledIngredients, 'Ingredient List Sent!');
    };
  },
]);
