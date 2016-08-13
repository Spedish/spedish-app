angular.module('clientApp')
  .service('AuthService', function($q, $timeout, $http) {

    this.login = function(user, pass) {
      var deferred = $q.defer();

      $http.post(g_config.baseUrl + '/login', {username: user, password: pass})
        .success(function(data, status) {
          if (status === 200) {
            g_config.user = true;
            deferred.resolve();
          } else {
            g_config.user = false;
            deferred.reject();
          }
        })
        .error(function(data) {
          g_config.user = false;
          deferred.reject();
        });

      return deferred.promise;
    };

    this.isLoggedIn = function() {
      if(g_config.user)
        return true;
      else
        return false;
    };

    this.logout = function() {
      var deferred = $q.defer();

      $http.get(g_config.baseUrl + '/logout')
        .success(function(data, status) {
          g_config.user = false;
          deferred.resolve();
        })
        .error(function(data) {
          g_config.user = false;
          deferred.reject();
        });

      return deferred.promise;
    };

    this.userSync = function() {
      return $http.get(g_config.baseUrl + '/user_status')
        .success(function(data) {
          if (data.status)
            g_config.user = true;
          else
            g_config.user = false;
        })
        .error(function() {
          g_config.user = false;
        });
    };

    this.getProfile = function() {
      return $http.get(g_config.baseUrl + '/profile');
    };

    this.saveProfile = function(profile) {
      return $http.post(g_config.baseUrl + '/profile', profile);
    };
  });

angular.module('clientApp')
  .run(function($rootScope, $location, $route, AuthService) {
    $rootScope.$on('$routeChangeStart',
      function(event, next, current) {
        AuthService.userSync();

        if (next.$$route.requireAuth && !g_config.user)
          $location.path('/login');
      });
  });

