/*
	This factory contains some common used function for user
 */
angular.module('clientApp').factory('userUtil', function(){
	'use strict';
	
    function _canSell() {
        return g_config.user && g_config.user.isSeller
    }
	
	//Return a public API
	return {
		canSell: _canSell
	}
});