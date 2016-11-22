/*
	This factory contains some common used function for user
 */
angular.module('clientApp').factory('userUtil', function(){
	'use strict';
	
    function _isSeller() {
        return g_config.user && g_config.user.isSeller
    }

    function _getUserId() {
        if(g_config.user)
            return g_config.user.id;
    }
	
	//Return a public API
	return {
		isSeller: _isSeller,
        getUserId: _getUserId
	}
});