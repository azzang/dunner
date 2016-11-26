angular.module('dunner').controller('loginController', ['$scope', '$location', 'authService',
  'alertService', '$http', ($scope, $location, authService, alertService, $http) => {
    angular.extend($scope, alertService);

    $scope.login = () => {
      if ($scope.form.$invalid) {
        $scope.addAlert('danger', 'Invalid Email Or Password.');
      } else {
        $scope.requestInProgress = true;
        authService.getLoginPromise($scope.username, $scope.password)
          .then(() => {
            $location.path('/hub');
          }).catch($scope.getResponseHandler('danger', 'Something Went Wrong.'));
      }
    };

    $scope.register = () => {
      if ($scope.form.$invalid) {
        $scope.addAlert('danger', 'Invalid Email Or Password.');
      } else {
        $scope.requestInProgress = true;
        authService.getRegistrationPromise($scope.username, $scope.password)
          .then($scope.getResponseHandler('success', 'Registration Successful!'))
          .catch($scope.getResponseHandler('danger', 'Something Went Wrong.'));
      }
    };

    $scope.requestPasswordReset = () => {
      if ($scope.form.email.$invalid) {
        $scope.addAlert('danger', 'Invalid Email.');
      } else {
        $scope.requestInProgress = true;
        $http.post('/user/reset-password', { username: $scope.username })
          .success($scope.getResponseHandler('success', 'Check Your Email For Instructions.'))
          .error($scope.getResponseHandler('danger', 'Something Went Wrong.'));
      }
    };
  },
]);
