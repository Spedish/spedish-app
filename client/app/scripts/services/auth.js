function clearUser() {
  g_config.user = {
    authenticated: false,
    isSeller: false
  };
}

angular.module('clientApp')
  .service('AuthService', function($q, $timeout, $http) {

    this.login = function(user, pass) {
      var deferred = $q.defer();

      $http.post(g_config.baseUrl + '/login', {username: user, password: pass})
        .success(function(data, status) {
          if (status === 200) {
            g_config.user = {
              authenticated: true,
              isSeller: data.isSeller
            };
            deferred.resolve();
          } else {
            clearUser();
            deferred.reject();
          }
        })
        .error(function(data) {
          clearUser();
          deferred.reject();
        });

      return deferred.promise;
    };

    this.isLoggedIn = function() {
      if(g_config.user)
        return g_config.user.authenticated;
      else
        return false;
    };

    this.logout = function() {
      var deferred = $q.defer();

      $http.get(g_config.baseUrl + '/logout')
        .success(function(data, status) {
          clearUser();
          deferred.resolve();
        })
        .error(function(data) {
          clearUser();
          deferred.reject();
        });

      return deferred.promise;
    };

    this.userSync = function() {
      return $http.get(g_config.baseUrl + '/user_status')
        .success(function(data) {
          if (data.status) {
            g_config.user = {
              authenticated: true,
              isSeller: data.isSeller
            };
          } else
            clearUser();
        })
        .error(function() {
          clearUser();
        });
    };

    this.getProfile = function(username) {
      if (!username || username == undefined)
        return $http.get(g_config.baseUrl + '/profile');
      else
        return $http.get(g_config.baseUrl + '/profile/' + username);
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

        if (next.$$route.requireAuth && (!g_config.user || g_config.user && !g_config.user.authenticated))
          $location.path('/login');
      });
  });

