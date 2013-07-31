'use strict';

require(['jQuery', 'angular', 'bootstrap', 'angularUiRouter', 'js/controllers', 'flatuiCheckbox', 'flatuiRadio'], function ($, angular) {
	// Declare app level module which depends on filters, and services
	angular.module('attendee', ['ui.state', 'attendee.controllers']).
		config(['$routeProvider', '$locationProvider', '$stateProvider', function ($routeProvider, $locationProvider, $stateProvider) {
			$stateProvider
				.state('index', {
					url: "/", // root route
					views: {
						"header": {
							templateUrl: "/app/partials/header.html"
						},
						"content": {
							templateUrl: "/app/partials/choose-user.html",
							controller: 'users'
						},
						"footer": {
							templateUrl: "/app/partials/footer.html"
						}
					}
				})
				.state('vote', {
					url: "/vote",
					views: {
						"header": {
							templateUrl: "/app/partials/header.html"
						},
						"content": {
							templateUrl: "/app/partials/vote.html",
							controller: 'vote'
						},
						"footer": {
							templateUrl: "/app/partials/footer.html"
						}
					}
				})
			// configure html5 to get links working on jsfiddle
			$locationProvider.html5Mode(true);
		}]);

	$(document).ready(function () {
		var $html = $('html');
		angular.bootstrap($html, ['attendee']);
		$html.addClass('ng-app');
	});
});
