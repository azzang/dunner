angular.module('dunner').controller('helpController', ['$scope', 'authService',
  'alertService', ($scope, authService, alertService) => {
    angular.extend($scope, authService, alertService);

    $scope.navbarLinks = [
      'logout.html',
    ];
  },
]);
