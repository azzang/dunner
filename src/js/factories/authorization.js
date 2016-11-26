angular.module('dunner').factory('authService', ['$q', '$timeout', '$http',
  'recipeService', '$location', ($q, $timeout, $http, recipeService, $location) => {
    let loggedIn = false;

    return {

      isLoggedIn() {
        return loggedIn;
      },

      getLoginPromise(username, password) {
        const deferred = $q.defer();
        $http.post('/user/login', { username, password })
          .success((data, status) => {
            if (status === 200) {
              loggedIn = true;
              recipeService.setRecipes(data.recipes);
              deferred.resolve();
            } else deferred.reject();
          }).error(() => {
            deferred.reject();
          });
        return deferred.promise;
      },

      getLogoutPromise() {
        const deferred = $q.defer();
        $http.get('/user/logout')
          .success(() => {
            loggedIn = false;
            deferred.resolve();
          }).error(() => {
            deferred.reject();
          });
        return deferred.promise;
      },

      logout() {
        this.requestInProgress = true;
        this.getLogoutPromise().then(() => {
          $location.path('/');
        }).catch(this.getResponseHandler('danger', 'Something Went Wrong.'));
      },

      getRegistrationPromise(username, password) {
        const deferred = $q.defer();
        $http.post('/user/register', { username, password })
          .success((data, status) => {
            if (status === 200) deferred.resolve();
            else deferred.reject();
          }).error(() => {
            deferred.reject();
          });
        return deferred.promise;
      },

    };
  },
]);
