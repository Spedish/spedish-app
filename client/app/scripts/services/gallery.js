function clearUser() {
  g_config.user = {
    authenticated: false,
    isSeller: false
  };
}

angular.module('clientApp')
  .service('GalleryService', function($q, $timeout, $http) {

    this.createGID = function() {
      return $http.put(g_config.baseUrl + '/gallery');
    };

    this.saveOrder = function(gid, images) {
      return $http.put(g_config.baseUrl + '/gallery/' + gid, {order: images});
    }

    this.deleteImage = function(gid, file) {
      return $http.delete(g_config.baseUrl + '/gallery/' + gid + '/' + file);
    }
  });
