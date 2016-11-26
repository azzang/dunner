angular.module('dunner').controller('createEditController', ['$scope', '$location',
  'authService', 'alertService', 'recipeService', '$http',
  ($scope, $location, authService, alertService, recipeService, $http) => {
    angular.extend($scope, authService, alertService);

    $scope.navbarButtons = 'save.html';

    $scope.navbarLinks = [
      'to-help.html',
      'logout.html',
    ];

    $scope.recipe = recipeService.getEditRecipe();

    const { Ingredient, Direction } = recipeService;

    $scope.isLongerThanOne = subDocument => subDocument.length > 1;

    $scope.addIngredient = (index) => {
      $scope.recipe.ingredients.splice(index + 1, 0, new Ingredient());
    };

    $scope.removeIngredient = (index) => {
      $scope.recipe.ingredients.splice(index, 1);
    };

    $scope.addDirection = (index) => {
      $scope.recipe.directions.splice(index + 1, 0, new Direction());
    };

    $scope.removeDirection = (index) => {
      $scope.recipe.directions.splice(index, 1);
    };

    $scope.isInvalid = (inputName) => {
      if (!$scope.form.$submitted) return false;
      return $scope.form[inputName].$invalid;
    };

    $scope.save = () => {
      $scope.form.$submitted = true;
      if ($scope.form.$invalid) {
        $scope.addAlert('danger', 'Red Fields Are Invalid.');
      } else {
        $scope.requestInProgress = true;
        $http.put('/user/recipes', { recipe: $scope.recipe }).success(() => {
          $scope.addAlert('success', 'Changes Saved!');
          recipeService.save($scope.recipe);
          $scope.requestInProgress = false;
        }).error($scope.getResponseHandler('danger', 'Something Went Wrong.'));
        $scope.form.$submitted = false;
      }
    };

    $scope.saveAs = () => {
      $scope.form.$submitted = true;
      if ($scope.form.$invalid) {
        $scope.addAlert('danger', 'Red Fields Are Invalid.');
      } else {
        $scope.requestInProgress = true;
        $http.post('/user/recipes', { recipe: $scope.recipe }).success((recipeID) => {
          $scope.addAlert('success', 'New Recipe Created!');
          $scope.recipe._id = recipeID;
          recipeService.saveAs($scope.recipe);
          $scope.requestInProgress = false;
        }).error($scope.getResponseHandler('danger', 'Something Went Wrong.'));
        $scope.form.$submitted = false;
      }
    };
  },
]);
