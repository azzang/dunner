angular.module('dunner').controller('cookPlanController', ['$scope', '$uibModalInstance',
  '$timeout', 'alertService', '$http', '$location', 'recipeService', 'emailService',
  ($scope, $uibModalInstance, $timeout, alertService, $http, $location, recipeService,
  emailService) => {
    angular.extend($scope, alertService, emailService);

    $scope.recipes = recipeService.getCookPlanRecipes();

    $scope.generalMealTime = 'asap';

    $scope.mealIsDelayed = () => $scope.generalMealTime === 'delay';

    $scope.prepareRecipesForCook = () => {
      let timeDelta;
      const maxTimeDelta = parseFloat($scope.earliestPossibleMealTime);
      const recipes = _.map($scope.recipes, (recipe) => {
        timeDelta = recipe.totalDuration - recipe.relativeFinishTime.value;
        recipe.secondsTillNextStep = Math.round((maxTimeDelta - timeDelta) * 60) + 10;
        recipe.secondsInNextSteps = Math.round(recipe.totalDuration * 60);
        recipe.nextStepIndex = 0;
        recipe.state = recipe.secondsTillNextStep <= 30 ? 'urgent' : 'normal';
        _.each(recipe.directions, (direction) => {
          direction.duration = Math.round(direction.duration * 60);
        });
        recipe.directions.push({ description: 'This recipe should be done.' });
        return _.pick(recipe, 'name', 'directions', 'state', 'secondsTillNextStep',
        'secondsInNextSteps', 'nextStepIndex', 'getTotalTimeRemaining');
      });
      recipeService.setNextCollection(recipes);
      $location.path('/cook');
    };

    $scope.emailCookPlan = () => {
      const mealTime = $scope.mealTime.format('ddd MMM D YYYY [at] h:mm A');
      const namesAndRelativeFinishTimes = _.chain($scope.recipes)
        .map(recipe => `${recipe.name} (RFT = ${recipe.relativeFinishTime.value})`)
        .sortBy(name => name.toLowerCase()).value()
        .join(' + ');
      $scope.sendEmail(`Cook Plan for ${namesAndRelativeFinishTimes}`,
      `Meal Time: ${mealTime}\nCook Start Time: ${$scope.startCookTime}`,
      'Cook Plan Sent!');
    };

    function processRelativeFinishTimeChanges() {
      let relativeFinishTime;
      let timeDelta;
      let maxTimeDelta = -Infinity;
      let maxRelativeFinishTime = -Infinity;
      let lastZeroLocation;
      let zeroCount = 0;
      _.each($scope.recipes, (recipe, i) => {
        relativeFinishTime = recipe.relativeFinishTime.value;
        timeDelta = recipe.totalDuration - relativeFinishTime;
        if (timeDelta > maxTimeDelta) maxTimeDelta = timeDelta;
        if (relativeFinishTime > maxRelativeFinishTime) {
          maxRelativeFinishTime = relativeFinishTime;
        }
        if (recipe.relativeFinishTime.max === 0) {
          recipe.relativeFinishTime.max = '';
        }
        if (relativeFinishTime === 0) {
          lastZeroLocation = i;
          zeroCount += 1;
        }
      });
      if (zeroCount === 1) {
        $scope.recipes[lastZeroLocation].relativeFinishTime.max = 0;
      }
      $scope.earliestPossibleMealTime = maxTimeDelta;
      $scope.totalCookTime = maxTimeDelta + maxRelativeFinishTime;
    }

    function setMealTime() {
      if ($scope.mealIsDelayed()) {
        $scope.mealTime = moment().add(parseFloat($scope.earliestPossibleMealTime) + 10, 'minutes');
      }
    }

    function setStartCookTime() {
      if ($scope.mealIsDelayed()) {
        $scope.startCookTime = moment(new Date($scope.mealTime))
          .subtract(parseFloat($scope.earliestPossibleMealTime), 'minutes')
          .format('ddd MMM D YYYY [at] h:mm A');
      }
    }

    $scope.$watch('recipes', processRelativeFinishTimeChanges, true);

    $scope.$watch('generalMealTime', setMealTime, true);

    $scope.$watchGroup(['earliestPossibleMealTime', 'mealTime'], setStartCookTime, true);
  },
]);
