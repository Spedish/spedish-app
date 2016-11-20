function clearUser() {
  g_config.user = {
    authenticated: false,
    isSeller: false,
    isFacebookUser: false
  };
}

angular.module('clientApp')
  .service('AuthService', function($q, $timeout, $http) {

    this.login = function(user, pass) {
      var deferred = $q.defer();

      $http.post(g_config.baseUrl + '/login', {
          username: user,
          password: pass
        })
        .success(function(data) {
          g_config.user = {
            authenticated: true,
            isSeller: data.isSeller,
            isFacebookUser: false
          };
          deferred.resolve();
        })
        .error(function(data) {
          clearUser();
          deferred.reject(data.message);
        });

      return deferred.promise;
    };

    this.facebookLogin = function(id, name, email, token) {
      var deferred = $q.defer();

      $http.post(g_config.baseUrl + '/facebookLogin', {
          thirdParty_source: "Facebook",
          thirdParty_id: id,
          thirdParty_name: name,
          thirdParty_email: email,
          thirdParty_token: token
        })
        .success(function(data) {
          g_config.user = {
            authenticated: true,
            isSeller: data.isSeller,
            isFacebookUser: true
          };
          deferred.resolve();
        })
        .error(function(data) {
          clearUser();
          deferred.reject();
        });

      return deferred.promise;
    };

    this.isLoggedIn = function() {
      if (g_config.user)
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
              isSeller: data.isSeller,
              isFacebookUser: data.isFacebookUser
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
  .run(function($rootScope, $window, $location, $route, AuthService) {
    $rootScope.$on('$routeChangeStart',
      function(event, next, current) {
        AuthService.userSync();

        if (next.$$route.requireAuth && (!g_config.user || g_config.user &&
            !g_config.user.authenticated))
          $location.path('/login');
      });

    $window.fbAsyncInit = function() {
      // Executed when the SDK is loaded
      FB.init({
        appId: '254674478245315',
        status: true,
        cookie: true,
        xfbml: true,
        version: 'v2.8'
      });
    };

    (function(d) {
      // load the Facebook javascript SDK
      var js,
        id = 'facebook-jssdk',
        ref = d.getElementsByTagName('script')[0];

      if (d.getElementById(id)) {
        return;
      }

      js = d.createElement('script');
      js.id = id;
      js.async = true;
      js.src = "https://connect.facebook.net/en_US/sdk.js";

      ref.parentNode.insertBefore(js, ref);

    }(document));

  });
