angular.module('dunner').controller('cookController', ['$scope', '$location',
  'authService', 'alertService', '$interval', 'recipeService',
  ($scope, $location, authService, alertService, $interval, recipeService) => {
    angular.extend($scope, authService, alertService);

    $scope.navbarButtons = 'monitor-cook.html';

    $scope.navbarLinks = [
      'to-help.html',
      'logout.html',
    ];

    $scope.recipes = recipeService.getNextCollection();

    $scope.cook = {
      correctionsMade: false,
      doneCount: 0,
      id: undefined,
      secondsSinceStart: 0,
      state: 'ready',
    };

    const alarm = new Audio('sounds/warning.wav');

    $scope.is = (thing, state) => thing.state === state;

    $scope.getTotalRemainingTime = recipe =>
      recipe.secondsTillNextStep + recipe.secondsInNextSteps;

    $scope.pause = (recipe) => {
      recipe.state = 'paused';
      if (recipe.nextStepIndex > 0) {
        const currentStep = recipe.directions[recipe.nextStepIndex - 1];
        currentStep.correction = $scope.cook.secondsSinceStart + recipe.secondsTillNextStep;
        $scope.cook.correctionsMade = true;
      }
    };

    $scope.skipToNextStep = (recipe) => {
      recipe.state = 'skipped';
      if (recipe.nextStepIndex > 0) {
        const currentStep = recipe.directions[recipe.nextStepIndex - 1];
        const correction = currentStep.correction;
        currentStep.correction = correction ? $scope.cook.secondsSinceStart - correction :
        -recipe.secondsTillNextStep;
        $scope.cook.correctionsMade = true;
      }
    };

    $scope.prepareCorrectedStepsForPostMortem = () => {
      const correctedSteps = _.chain($scope.recipes).map(recipe =>
          _.chain(recipe.directions)
          .filter(direction => direction.correction)
          .map(direction => ({
            recipeName: recipe.name,
            description: direction.description,
            estimatedDuration: direction.duration / 60,
            actualDuration: ((direction.duration + direction.correction) / 60).toFixed(2),
          })).value())
        .flatten().value();
      recipeService.setNextCollection(correctedSteps);
      $location.path('/post-mortem');
    };

    function processActiveRecipes() {
      $scope.cook.secondsSinceStart += 1;
      _.each($scope.recipes, (recipe) => {
        if (recipe.state !== 'paused' && recipe.state !== 'done') {
          if (recipe.secondsTillNextStep === 1 || recipe.state === 'skipped') {
            if (recipe.nextStepIndex === recipe.directions.length - 1) { // recipe done
              $scope.cook.doneCount += 1;
              recipe.state = 'done';
              recipe.secondsTillNextStep = Infinity;
              if ($scope.cook.doneCount === $scope.recipes.length) { // all recipes done
                $interval.cancel($scope.cook.id);
                if ($scope.cook.correctionsMade) {
                  $scope.cook.state = 'corrected';
                } else {
                  $scope.cook.state = 'uncorrected';
                  $scope.addAlert('success', 'Good Times!');
                }
              }
            } else { // recipe not done, current step done
              recipe.secondsTillNextStep = recipe.directions[recipe.nextStepIndex].duration;
              recipe.secondsInNextSteps -= recipe.secondsTillNextStep;
              recipe.nextStepIndex += 1;
              if (recipe.secondsTillNextStep <= 30) {
                alarm.play();
                recipe.state = 'urgent';
              } else {
                recipe.state = 'normal';
              }
            }
          } else { // current step not done
            recipe.secondsTillNextStep -= 1;
            if (recipe.secondsTillNextStep <= 30 && recipe.state === 'normal') {
              alarm.play();
              recipe.state = 'urgent';
            }
          }
        }
      });
    }

    $scope.startCooking = () => {
      $scope.cook.id = $interval(processActiveRecipes, 1000);
      $scope.cook.state = 'active';
    };

    $scope.$on('$destroy', () => {
      $interval.cancel($scope.cook.id);
    });
  },
]);
