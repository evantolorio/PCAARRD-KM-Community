(() => {
	'use strict';
	
	angular
		.module('posts')
		.directive('addMediaPost', addMediaPost);


	function addMediaPost () {

		const directive = {
			restrict: 'E',
			templateUrl: '/posts/views/add-post/add-media-post.client.view.html',
			controller: 'AddPostController'
		}

		return directive;
	}

})();