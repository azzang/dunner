angular.module('dunner').controller('postMortemController', ['$scope', 'authService',
  'alertService', '$http', 'recipeService', 'emailService',
  ($scope, authService, alertService, $http, recipeService, emailService) => {
    angular.extend($scope, authService, alertService, emailService);

    $scope.navbarButtons = 'email-time-corrections.html';

    $scope.navbarLinks = [
      'to-help.html',
      'logout.html',
    ];

    $scope.correctedSteps = recipeService.getNextCollection();

    $scope.emailTable = () => {
      const recipeNames = _.chain($scope.correctedSteps)
        .pluck('recipeName').uniq()
        .sortBy(recipeName => recipeName.toLowerCase())
        .value()
        .join(' + ');
      const correctedSteps = _.chain($scope.correctedSteps)
        .map(step =>
          [`Recipe: ${step.recipeName}`, `Step: ${step.description}`,
            `Estimated Duration (min): ${step.estimatedDuration}`,
            `Actual Duration (min): ${step.actualDuration}`,
          ].join('\n'))
        .sortBy(step => step.toLowerCase())
        .value()
        .join('\n\n');
      $scope.sendEmail(`Time Corrections for ${recipeNames}`,
        correctedSteps, 'Table Sent!');
    };
  },
]);
