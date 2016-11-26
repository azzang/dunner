angular.module('dunner').controller('hubController', ['$scope', 'authService',
  '$http', 'alertService', '$uibModal', 'recipeService', '$location',
  ($scope, authService, $http, alertService, $uibModal, recipeService, $location) => {
    angular.extend($scope, authService, alertService);

    $scope.navbarButtons = 'delete.html';

    $scope.navbarLinks = [
      'to-create-edit.html',
      'to-prep.html',
      'to-cook.html',
      'to-help.html',
      'logout.html',
    ];

    $scope.recipes = recipeService.getHubRecipes();

    $scope.checkedRecipeCount = 0;

    $scope.noRecipesSelected = () => $scope.checkedRecipeCount === 0;

    $scope.moreThanOneRecipeSelected = () => $scope.checkedRecipeCount > 1;

    $scope.go = path => $location.path(path);

    $scope.updateCheckedRecipeCount = (recipe) => {
      if (recipe.checked) $scope.checkedRecipeCount += 1;
      else $scope.checkedRecipeCount -= 1;
    };

    $scope.openCookPlanModal = () => {
      $uibModal.open({
        templateUrl: 'cook-plan.html',
        controller: 'cookPlanController',
      });
    };

    $scope.$on('deleteConfirmed', () => {
      $scope.requestInProgress = true;
      const checked = _.groupBy($scope.recipes, 'checked');
      $http.delete('/user/recipes', {
        params: { id: _.map(checked.true, recipe => recipe._id) },
      }).success(() => {
        $scope.addAlert('success', 'Recipes Deleted.');
        $scope.recipes = checked.false || [];
        $scope.checkedRecipeCount = 0;
        recipeService.setRecipes($scope.recipes);
        $scope.requestInProgress = false;
      }).error($scope.getResponseHandler('danger', 'Something Went Wrong.'));
    });
  },
]);
