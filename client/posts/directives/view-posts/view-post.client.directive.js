(() => {
	'use strict';
	
	angular
		.module('posts')
		.directive('viewPost', viewPost);


	function viewPost () {

		const directive = {
			restrict: 'E',
			templateUrl: '/posts/views/view-posts/view-post.client.view.html',
			controller: 'PostController'
		}

		return directive;
	}

})();

