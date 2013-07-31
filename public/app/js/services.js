'use strict';

/* Services */
define(['angular', 'angularResource'], function (angular) {
	angular.module('attendee.services', ['ngResource'])
		.factory('users', ['$resource', function ($resource) {
			return $resource('/users', {}, {
				get: {method: 'GET', isArray: true}
			});
		}])
		.factory('userDays', ['$resource', function ($resource) {
			return $resource('/user-days', {}, {
				get: {method: 'GET', isArray: true},
				save: {method: 'POST', isArray: false}
			});
		}])
		.factory('session', ['$resource', function ($resource) {
			return $resource('/session', {}, {
				get: {method: 'GET', isArray: false},
				save: {method: 'POST', isArray: false}
			});
		}])
		.value('weekdays', [
			{"name": "monday", "chinese": "星期一"},
			{"name": "tuesday", "chinese": "星期二"},
			{"name": "wednesday", "chinese": "星期三"},
			{"name": "thursday", "chinese": "星期四"},
			{"name": "friday", "chinese": "星期五"},
			{"name": "saturday", "chinese": "星期六"},
			{"name": "sunday", "chinese": "星期天"}
		])
		.value('weekdaysStatistic', {
			"monday": {"attendees": [], "cars": []},
			"tuesday": {"attendees": [], "cars": []},
			"wednesday": {"attendees": [], "cars": []},
			"thursday": {"attendees": [], "cars": []},
			"friday": {"attendees": [], "cars": []},
			"saturday": {"attendees": [], "cars": []},
			"sunday": {"attendees": [], "cars": []}
		});
});
