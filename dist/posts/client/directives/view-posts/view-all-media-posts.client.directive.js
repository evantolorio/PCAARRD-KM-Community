'use strict';

(function () {
	'use strict';

	angular.module('posts').directive('viewAllMediaPosts', viewAllMediaPosts);

	function viewAllMediaPosts() {

		var directive = {
			restrict: 'E',
			templateUrl: '/posts/client/views/view-posts/view-all-media-posts.client.view.html'
		};

		return directive;
	}
})();