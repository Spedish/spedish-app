/*
	This factory contains some common config and function for date time
 */
angular.module('clientApp').factory('itemUtil', function(){
	'use strict';
	//time picker config
	function getTimePickerConfig() {
		var config = {
	    	hstep: 1,
	      	mstep: 10,
	     	ismeridian: true,
	     	mousewheel: false
    	}
    	return config;
	};

	//common function to update mealtype status 
	//both item-add and item-edit controller use this fn
	function updateMealTypeStatus(pickup_window) {
		if(pickup_window.free_sell) {
        for(var key in pickup_window) {
          // Reset mealtype status (checkbox)
          if(key != 'free_sell' && key !="_id")
            pickup_window[key].status = false;
        }
      }
	}
	
	//Return a public API
	return {
		getTimePickerConfig: getTimePickerConfig,
		updateMealTypeStatus: updateMealTypeStatus
	}
});