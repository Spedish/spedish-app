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

	function getDays() {
		var days = [{id:1, day: 'Monday'},{id:2, day: 'Tuesday'},{id:3, day: 'Wednesday'},{id:4, day: 'Thursday'}, {id:5, day: 'Friday'}, {id:6, day:'Saturday'}, {id:0, day:'Sunday'}];
		return days;
	}

	function formatDate(dateObject) {
		var dateString = dateObject.toISOString();
      	var formattedDate = dateString.substring(dateString.indexOf("T") + 1);
     	return formattedDate;
	}
	
	//Return a public API
	return {
		getTimePickerConfig: getTimePickerConfig,
		updateMealTypeStatus: updateMealTypeStatus,
		getDays: getDays,
		formatDate: formatDate
	}
});