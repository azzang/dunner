angular.module('dunner').controller('resetPasswordController', ['$scope',
  '$http', '$routeParams', 'alertService', ($scope, $http, $routeParams, alertService) => {
    angular.extend($scope, alertService);

    $scope.reset = () => {
      if ($scope.form.$invalid) {
        $scope.addAlert('danger', 'New Password Required.');
      } else {
        $scope.requestInProgress = true;
        $http.put('/user/reset-password', {
          _id: $routeParams.id,
          password: $scope.password,
        }).success($scope.getResponseHandler('success', 'Password Reset!'))
        .error($scope.getResponseHandler('danger', 'Something Went Wrong.'));
      }
    };
  },
]);
