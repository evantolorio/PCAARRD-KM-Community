'use strict';

(function () {
	'use strict';

	angular.module('shared').config(sharedTitle);

	sharedTitle.$inject = ['$titleProvider'];

	function sharedTitle($titleProvider) {
		$titleProvider.documentTitle(function ($rootScope) {
			return $rootScope.$title ? $rootScope.$title + " | PCAARRD KM Community" : "PCAARRD KM Community";
		});
	}
})();