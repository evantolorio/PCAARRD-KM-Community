import moment from 'moment';
import _ from 'lodash/lodash.min';
import piwikConfig from './../assets/js/piwikConfig';

(() => {
	'use strict';

	angular
		.module('groups')
		.controller('GroupController', GroupController);

	GroupController.$inject = ['$scope', '$state', '$q', '$timeout', 'ngToast', '$stateParams', 'GroupClassificationService', 'ViewGroupsCategoriesService', 'GroupService', 'SharedPaginationService', 'UserAuthenticationService', 'UserService', '$filter', 'CommentService'];

	function GroupController ($scope, $state, $q, $timeout, ngToast, $stateParams, GroupClassificationService, ViewGroupsCategoriesService, GroupService, SharedPaginationService, UserAuthenticationService, UserService, $filter, CommentService) {

		/* for View One Group */

		piwikConfig();

		$scope.fullGroupDescription = false;
		$scope.readGroupDescription = "Read More";
		$scope.DESCRIPTION_LIMIT = 1000;
		$scope.descriptionSize = $scope.DESCRIPTION_LIMIT;

		$scope.toggleGroupDescription = () => {
			$scope.fullGroupDescription = !$scope.fullGroupDescription;
			$scope.readGroupDescription = $scope.readGroupDescription == "Read Less"? "Read More" : "Read Less";
			$scope.descriptionSize = $scope.descriptionSize === $scope.DESCRIPTION_LIMIT? undefined : $scope.DESCRIPTION_LIMIT;
		}

		$scope.loadPostsAnalysis = () => {
			$scope.postsAnalysisChart = Highcharts.chart('group-posts-distribution-container', {
			    chart: {
			        type: 'bar'
			    },
			    title: {
			        text: `No Group`
			    },
			    subtitle: {
			        text: `PCAARRD KM Community`
			    },
			    xAxis: {
			        categories: ['Total', 'Question', 'Incident Report', 'Media or URL', 'News', 'Event', 'Advertisement', 'Others'],
			        title: {
			            text: null
			        }
			    },
			    yAxis: {
			        min: 0,
			        title: {
			            text: 'Number of Posts',
			            align: 'high'
			        },
			        labels: {
			            overflow: 'justify'
			        },
			        allowDecimals: false
			    },
			    plotOptions: {
			        bar: {
			            dataLabels: {
			                enabled: true
			            }
			        }
			    },
			    legend: {
			        enabled: false
			    },
			    credits: {
			        enabled: false
			    },
			    series: [{
			        name: 'Number of Posts',
			        data: [0, 0, 0, 0, 0, 0, 0, 0, 0]
			    }]
			});
		}

		$scope.updatePostsAnalysis = () => {
			$scope.postsAnalysisChart.setTitle({text: `${$scope.selectedGroup.name} Posts`}, {text: 'Source: PCAARRD KM Community'});
			$scope.postsAnalysisChart.series[0].setData([
				$scope.selectedGroup.postsCount.total,
				$scope.selectedGroup.postsCount.question,
				$scope.selectedGroup.postsCount.report,
				$scope.selectedGroup.postsCount.media,
				$scope.selectedGroup.postsCount.news,
				$scope.selectedGroup.postsCount.event,
				$scope.selectedGroup.postsCount.advertisement,
				$scope.selectedGroup.postsCount.others
			], true);
		}

		$scope.loadGroupAdmins = (groupAdminsID) => {	// load all info of group admins
			UserService.getAllGroupAdminstrators(groupAdminsID)
				.then((admins) => {
					$scope.groupAdmins = admins;
				});
		}

		$scope.loadGroupMembers = (groupHandle) => {	// load all info of group members
			UserService.getAllUsersByGroup(groupHandle)
				.then((members) => {
					$scope.groupMembers = members;
				});
		}

		$scope.loadGroupPendingMembers = (groupPendingMembersID) => {	// load all info of pending group members
			UserService.getAllGroupPendingMembers(groupPendingMembersID)
				.then((pendingMembers) => {
					$scope.groupPendingMembers = pendingMembers;
				});
		}

		$scope.loadGroupCommentsCount = (groupHandle) => {
			CommentService.getCommentsLengthByGroupBelonged(groupHandle)
				.then((commentsCount) => {
					$scope.groupCommentsCount = commentsCount;
				});
		}

		$scope.joinThisGroup = (userID, groupHandle) => {
			UserService.joinGroup(userID, groupHandle)
				.then(() => {
					return GroupService.updateGroup($scope.selectedGroup.handle, {membersCount: ++$scope.selectedGroup.membersCount});
				}, () => {
					ngToast.create({
			    		className: 'danger',
			    		content: `Failed to join the group.`
			    	});
				})
				.then(()=> {
					ngToast.create({
			    		className: 'success',
			    		content: `Group was successfully joined.`
			    	});

					return UserService.getOneUser(userID)
				})
				.then((user) => {
					if (user._id == $scope.user.currentUser._id){
						$scope.user.currentUser.groupsJoined.push($scope.selectedGroup.handle);
					}
					$scope.groupMembers.push(user);
					$scope.userMembership = true;
				});

		}

		$scope.onJoinThisGroup = (userID, groupHandle) => {
			if (!UserAuthenticationService.isLoggedIn()){
				UserAuthenticationService.loginFirst();
				return;
			}

			if ($scope.selectedGroup.membership === "No Approval") {
				$scope.joinThisGroup(userID, groupHandle);
			} else {
				$scope.addToPendingList(userID, groupHandle);
			}
		}

		$scope.addToPendingList = (userID, groupHandle) => {
			GroupService.addToGroupPendingMembersList(userID, groupHandle)
				.then(() => {
					ngToast.create({
			    		className: 'success',
			    		content: `Group Join Request was successfully sent.`
			    	});

					$scope.groupPendingMembers.push(userID);
					$scope.selectedGroup.pendingMembers.push(userID);
				}, () => {
					ngToast.create({
			    		className: 'danger',
			    		content: `Failed to send group join request.`
			    	});
				});
		}

		$scope.removeFromPendingList = (userID, groupHandle) => {
			if (!UserAuthenticationService.isLoggedIn()){
				UserAuthenticationService.loginFirst();
				return;
			}

			GroupService.removeFromGroupPendingMembersList(userID, groupHandle)
				.then(() => {
					ngToast.create({
			    		className: 'success',
			    		content: `Group Join Request was successfully removed.`
			    	});

					const groupIndexInSelectedGroup = $scope.selectedGroup.pendingMembers.indexOf(userID);
					if (groupIndexInSelectedGroup > -1){
						$scope.selectedGroup.pendingMembers.splice(groupIndexInSelectedGroup, 1);
					}
			    	const groupIndexInGroup = $scope.groupPendingMembers.map((user) => user._id).indexOf(userID);
					if (groupIndexInGroup > -1){
						$scope.groupPendingMembers.splice(groupIndexInGroup, 1);
					}
				}, () => {
					ngToast.create({
			    		className: 'danger',
			    		content: `Failed to remove group join request.`
			    	});
				});
		}

		$scope.leaveThisGroup = (userID, groupHandle) => {
			if (!UserAuthenticationService.isLoggedIn()){
				UserAuthenticationService.loginFirst();
				return;
			}

			if ($scope.selectedGroup.admin.indexOf(userID) > -1){
				if ($scope.selectedGroup.admin.length > 1){
					$scope.removeGroupAdmin(userID, groupHandle);
				} else {
					ngToast.create({
			    		className: 'warning',
			    		content: `The group should have at least one Group Admin.`
			    	});

					return;
				}
			}

			UserService.leaveGroup(userID, groupHandle)
				.then(() => {
					return GroupService.updateGroup($scope.selectedGroup.handle, {membersCount: --$scope.selectedGroup.membersCount});
				}, () => {
					ngToast.create({
			    		className: 'danger',
			    		content: `Failed to leave the group.`
			    	});
				})
				.then(()=> {
					ngToast.create({
			    		className: 'success',
			    		content: `Group was successfully left.`
			    	});

					const groupIndexInUser = $scope.user.currentUser.groupsJoined.indexOf($scope.selectedGroup.handle);
			    	const groupIndexInGroup = $scope.groupMembers.map((user) => user._id).indexOf(userID);
					if (groupIndexInUser > -1){
						$scope.user.currentUser.groupsJoined.splice(groupIndexInUser, 1);
					}
					if (groupIndexInGroup > -1){
						$scope.groupMembers.splice(groupIndexInGroup, 1);
					}

					$scope.userMembership = false;
				});

		}

		$scope.acceptPendingMember = (pendingMemberID, groupHandle) => {
			if (!UserAuthenticationService.isLoggedIn()){
				UserAuthenticationService.loginFirst();
				return;
			}

			$scope.removeFromPendingList(pendingMemberID, groupHandle);
			$scope.joinThisGroup(pendingMemberID, groupHandle);
		}

		$scope.rejectPendingMember = (pendingMemberID, groupHandle) => {
			if (!UserAuthenticationService.isLoggedIn()){
				UserAuthenticationService.loginFirst();
				return;
			}

			$scope.removeFromPendingList(pendingMemberID, groupHandle);
		}

		$scope.removeGroupAdmin = (userID, groupHandle) => {
			GroupService.removeAdmin(userID, groupHandle)
				.then(() => {
					ngToast.create({
			    		className: 'success',
			    		content: `Group Admin was successfully removed.`
			    	});

					const groupIndexInSelectedGroup = $scope.selectedGroup.admin.indexOf(userID);
					if (groupIndexInSelectedGroup > -1){
						$scope.selectedGroup.admin.splice(groupIndexInSelectedGroup, 1);
					}
			    	const groupIndexInGroup = $scope.groupAdmins.map((user) => user._id).indexOf(userID);
					if (groupIndexInGroup > -1){
						$scope.groupAdmins.splice(groupIndexInGroup, 1);
					}
				}, () => {
					ngToast.create({
			    		className: 'danger',
			    		content: `Failed to remove Group Admin.`
			    	});
				});
		}

		$scope.removeMember = (memberID, groupHandle) => {
			if (!UserAuthenticationService.isLoggedIn()){
				UserAuthenticationService.loginFirst();
				return;
			}

			if ($scope.selectedGroup.admin.indexOf(memberID) > -1){
				if ($scope.selectedGroup.admin.length > 1){
					$scope.removeGroupAdmin(memberID, groupHandle);
				} else {
					ngToast.create({
			    		className: 'warning',
			    		content: `The group should have at least one Group Admin.`
			    	});

					return;
				}
			}

			UserService.leaveGroup(memberID, groupHandle)
				.then(() => {
					return GroupService.updateGroup($scope.selectedGroup.handle, {membersCount: --$scope.selectedGroup.membersCount});
				}, () => {
					ngToast.create({
			    		className: 'danger',
			    		content: `Failed to remove group member.`
			    	});
				})
				.then(()=> {
					ngToast.create({
			    		className: 'success',
			    		content: `Group member was successfully removed.`
			    	});

					if (memberID === $scope.user.currentUser._id){
						const groupIndexInUser = $scope.user.currentUser.groupsJoined.indexOf($scope.selectedGroup.handle);
				    	if (groupIndexInUser > -1){
							$scope.user.currentUser.groupsJoined.splice(groupIndexInUser, 1);
							$scope.userMembership = false;
						}
					}

			    	const groupIndexInGroup = $scope.groupMembers.map((user) => user._id).indexOf(memberID);

					if (groupIndexInGroup > -1){
						$scope.groupMembers.splice(groupIndexInGroup, 1);
					}
				});
		}

		$scope.onRemoveAdmin = (adminID, groupHandle) => {
			if (!UserAuthenticationService.isLoggedIn()){
				UserAuthenticationService.loginFirst();
				return;
			}

			if ($scope.selectedGroup.admin.length > 1){
				$scope.removeGroupAdmin(adminID, groupHandle);
			} else {
				ngToast.create({
		    		className: 'warning',
		    		content: `The group should have at least one Group Admin.`
		    	});

				return;
			}
		}




		/* for View One and View All Groups */

		$scope.setGroupsData = () => {
			const currentViewGroupsCategory = ViewGroupsCategoriesService.getCurrentViewGroupsCategory().category;
			ViewGroupsCategoriesService.retrieveGroupsByCategory(currentViewGroupsCategory);
			$scope.groups = GroupService.getGroupList();
			$scope.groupsCopy = GroupService.getGroupListCopy();

			$scope.paginate = _.cloneDeep(SharedPaginationService);
			$scope.paginate.currentPage = 1;
			$scope.paginate.groupsPerPage = 10;
		}

		$scope.getGroupData = () => {
			$scope.user = {};
			$scope.user.isLoggedIn = UserAuthenticationService.isLoggedIn();

			if ($stateParams.handle) {	// if viewing one group

				GroupService.getOneGroup($stateParams.handle)	// load the group
					.then((result) => {
						$scope.selectedGroup = result;
						$scope.loadGroupAdmins($scope.selectedGroup.admin);
						$scope.loadGroupMembers($scope.selectedGroup.handle);
						$scope.loadGroupPendingMembers($scope.selectedGroup.pendingMembers);
						$scope.loadGroupCommentsCount($scope.selectedGroup.handle);

						$timeout(() => {
							$scope.loadPostsAnalysis();
							$scope.updatePostsAnalysis();
						}, 1000);

						return UserAuthenticationService.getCurrentUser();
					}, (error) => {
						// show 404 not found page
					})
					.then((currentUser)=> {	// load the current user
			    		$scope.user.currentUser = currentUser;
			    		if ($scope.user.currentUser){
			    			$scope.userMembership = $scope.user.currentUser.groupsJoined.indexOf($scope.selectedGroup.handle) > -1? true: false;
			    		}
			    	});


			} else if ($state.$current.name === "groups") {
				ViewGroupsCategoriesService.setUserID(null);
		    	if ($scope.user.isLoggedIn){
		    		UserAuthenticationService.getCurrentUser()
				    	.then((result)=> {
				    		ViewGroupsCategoriesService.setUserID(result._id);
				    		$scope.setGroupsData();
				    	});
		    	} else {	// for those not logged in
		    		ViewGroupsCategoriesService.setUserID("none");
		    		$scope.setGroupsData();
		    	}
			}
		}

		$scope.$watch('searchGroupsValue', function(value){
			if ($scope.groups){
				$scope.groups.contents = $filter('filter')($scope.groupsCopy.contents, value);
				$scope.paginate.currentPage = 1;
			}
    	});

    	$scope.resetSearchGroup = () => {
    		$scope.searchGroupsValue = "";
    	}

    	$scope.resetGroupsCurrentPage = () => {
			$scope.paginate.currentPage = 1;
		}

		$scope.getGroupData();






		/* for Create Group */

		if ($state.$current.name === "createGroup"){
			UserService.getAllUsers();
			$scope.users = UserService.getUserList();
		}

		$scope.addGroupFormData = { classification: "" };

		$scope.multipleFields = {
			admins: [''],
		};

		$scope.MIN_ADMIN = 1;

		$scope.addField = (fieldArray) => {
			fieldArray.push('');
		}

		$scope.removeField = (fieldArray, minField) => {
			if (fieldArray.length > minField){
				fieldArray.pop();
			}
		}

		$scope.clearMultipleFields = () => {
			_.forOwn($scope.multipleFields, (fieldArray) => {
				fieldArray.length = 0;
				fieldArray.push('');
			});
		}

		$scope.generateGroupNameAndHandle = (classification) => {
			$scope.addGroupFormData.name = (classification && (classification.specificCommodity || classification.isp)) || "";
			$scope.addGroupFormData.handle = $scope.addGroupFormData.name.replace(/\s/g, "").toLowerCase();
		}

		$scope.validateAdminEmailAddress = (adminEmails) => {
			for (let adminEmail of adminEmails){
				if ($scope.users.contents.map((user) => user.email).indexOf(adminEmail) < 0){
					return adminEmail;
				}
			}

			return true;
		}

		$scope.convertEmailToUserID = (adminEmails) => {
			const userList = $scope.users.contents;
			return adminEmails.map((adminEmail) => {
					return userList[userList.map((user) => user.email).indexOf(adminEmail)]._id;
				}
			);
		}

		$scope.onProcessGroupData = () => {
			const classificationID = $scope.addGroupFormData.classification._id;
			const groupHandle = $scope.addGroupFormData.handle;

			if (!UserAuthenticationService.isLoggedIn()){
				UserAuthenticationService.loginFirst();
				return;
			}

			UserAuthenticationService.getCurrentUser()
				.then((result)=> {
		    		$scope.addGroupFormData.createdBy = result._id;

		    		const validatedEmails = $scope.validateAdminEmailAddress($scope.multipleFields.admins);
					if (validatedEmails !== true){
						ngToast.create({
				    		className: 'warning',
				    		content: `User ${validatedEmails} does not exist!`
				    	});

				    	return $q.reject(`User ${validatedEmails} does not exist!`);
					}

					$scope.addGroupFormData.admin = $scope.convertEmailToUserID($scope.multipleFields.admins);
					$scope.addGroupFormData.postsCount = {
						advertisement: 0,
						question: 0,
						others: 0,
						news: 0,
						report: 0,
						event: 0,
						media: 0,
						total: 0
					};

					$scope.addGroupFormData.membersCount = $scope.addGroupFormData.admin.length;
					$scope.addGroupFormData.dateCreated = moment().format('MMMM Do YYYY, h:mm:ss a');
					$scope.addGroupFormData.photo = null;
					$scope.addGroupFormData.coverPhoto = null;
					delete $scope.addGroupFormData.classification.isUsed;
					delete $scope.addGroupFormData.classification.__v;

					return GroupService.submitGroup($scope.addGroupFormData);
		    	})
		    	.then(()=> {
		    		GroupClassificationService.updateGroupClassification(classificationID, {isUsed: true});

					_.forEach($scope.addGroupFormData.admin, (admin) => {
						UserService.joinGroup(admin, groupHandle);
					});

					$scope.clearGroupForm();
		    	});
		}

		$scope.clearGroupForm = () => {
			$scope.addGroupFormData = null;
			$scope.clearMultipleFields();
		}

		GroupClassificationService.getAllGroupClassifications();
		$scope.groupClassifications = GroupClassificationService.getGroupClassificationList();

	}

})();
