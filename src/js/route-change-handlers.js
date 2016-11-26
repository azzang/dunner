angular.module('dunner').run(['$rootScope', '$location', 'authService', '$uibModalStack',
  ($rootScope, $location, authService, $uibModalStack) => {
    $rootScope.$on('$routeChangeStart', (event, next) => {
      if (next.access.restricted && !authService.isLoggedIn()) {
        $location.path('/');
      }
    });

    $rootScope.$on('$locationChangeStart', () => {
      $uibModalStack.dismissAll();
    });
  },
]);
