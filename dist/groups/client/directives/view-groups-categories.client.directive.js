'use strict';

(function () {
	'use strict';

	angular.module('groups').directive('viewGroupsCategories', viewGroupsCategories);

	function viewGroupsCategories() {

		var directive = {
			restrict: 'E',
			templateUrl: '/groups/client/views/view-groups-categories.client.view.html',
			controller: 'ViewGroupsCategoriesController'
		};

		return directive;
	}
})();