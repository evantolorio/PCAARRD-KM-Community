(() => {
	'use strict';
	
	angular
		.module('groups')
		.directive('viewGroupJoinInvitation', viewGroupJoinInvitation);


	function viewGroupJoinInvitation () {

		const directive = {
			restrict: 'E',
			templateUrl: '/groups/views/view-group-join-invitation.client.view.html'
		}

		return directive;
	}

})();

