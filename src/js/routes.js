angular.module('dunner', ['ngRoute', 'ui.bootstrap', 'ngAnimate'])
.config(['$routeProvider', '$locationProvider', ($routeProvider, $locationProvider) => {
  $routeProvider
    .when('/', {
      templateUrl: 'login.html',
      controller: 'loginController',
      access: { restricted: false },
    })
    .when('/hub', {
      templateUrl: 'hub.html',
      controller: 'hubController',
      access: { restricted: true },
    })
    .when('/create/edit', {
      templateUrl: 'create-edit.html',
      controller: 'createEditController',
      access: { restricted: true },
    })
    .when('/prep', {
      templateUrl: 'prep.html',
      controller: 'prepController',
      access: { restricted: true },
    })
    .when('/cook', {
      templateUrl: 'cook.html',
      controller: 'cookController',
      access: { restricted: true },
    })
    .when('/post-mortem', {
      templateUrl: 'post-mortem.html',
      controller: 'postMortemController',
      access: { restricted: true },
    })
    .when('/help', {
      templateUrl: 'help.html',
      controller: 'helpController',
      access: { restricted: true },
    })
    .when('/reset-password/:id', {
      templateUrl: 'reset-password.html',
      controller: 'resetPasswordController',
      access: { restricted: false },
    })
    .otherwise({ redirectTo: '/' });

  $locationProvider.html5Mode(true);
},
]);
