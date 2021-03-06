import moment from 'moment';
import _ from 'lodash/lodash.min';

(() => {
	'use strict';
	
	angular
		.module('users')
		.controller('UserAuthenticationController', UserAuthenticationController);

	UserAuthenticationController.$inject = ['$scope', '$state', 'UserAuthenticationService', 'UserService', 'ngToast'];

	function UserAuthenticationController ($scope, $state, UserAuthenticationService, UserService, ngToast) {
		$scope.addUserFormData = {};
		$scope.adminRegistration = {allow: false};	// for site admin registration
		UserService.getAllUsers();
		$scope.users = UserService.getUserList();	// contains all users info

		$scope.occupationList = [
			"Student", 
			"Farmer",
			"Researcher / Scientist",
			"Academician",
			"Policymaker",
			"Entrepreneur",
			"Extension worker",
			"Media",
			"Others"
		];		

		$scope.validateAdminRegistration = () => {	// validate admin registration access key entered
			UserAuthenticationService.allowAdminRegistration($scope.adminRegistration.enteredAccessKey)
				.then((response) =>{
					$scope.adminRegistration.allow = response;
				}, (response) => {
					ngToast.create({
			    		className: 'warning',
			    		content: `Invalid Access Key!`
			    	});

			    	$scope.adminRegistration.enteredAccessKey = "";
				});
		}

		$scope.getAllMonths = () => {	
			return moment.months();	// array of January, February, ...
		}

		$scope.getAllDays = () => {
			let days = [];
			for (let i = 1; i <= 31; i++){
				days.push(i);
			}
			return days;	// 31 days
		}

		$scope.getAllYears = () => {
			let years = [];
			for (let i = moment().get('year'); i >= 1900; i--){
				years.push(i);
			}
			return years;	// year 1900 - current year
		}

		$scope.clearUserFormData = () => {
			$scope.addUserFormData = null;
			$scope.addUserFormData =  { name: {} };
			$scope.selectedMonth = $scope.selectedDay = $scope.selectedYear = $scope.enteredPassword = $scope.reenteredPassword = "";
		}

		$scope.usedEmail = () => {	// checks if email entered into the form already exists
			return $scope.users.contents.map((user) => user.email).indexOf($scope.addUserFormData.email) > -1? true: false;
		} 

		$scope.onProcessUserData = () => {	// processing user data before registering the user
			if($scope.enteredPassword !== $scope.reenteredPassword){
				ngToast.create({
		    		className: 'warning',
		    		content: `Passwords do not match.`
		    	});
		    	return;
			}

			if ($scope.usedEmail()){
				ngToast.create({
		    		className: 'warning',
		    		content: `Email is already used.`
		    	});
		    	return;
			}

			$scope.addUserFormData.isAdmin = ($scope.adminRegistration.allow)? true : false;
			$scope.addUserFormData.dateJoined = moment().format('MMMM Do YYYY, h:mm:ss a');
			$scope.addUserFormData.birthdate = `${$scope.selectedMonth} ${$scope.selectedDay} ${$scope.selectedYear}`;
			$scope.addUserFormData.photo = null;

			$scope.addUserFormData.infoVisibility = {	// visibility of all personal info
				location: true,
				birthdate: true,
				occupation: true,
				affiliation: true,
				mailingAddress: true,
				contactNumber: true,
				about: true
			}
			// register the user
			UserAuthenticationService.register($scope.addUserFormData, $scope.reenteredPassword, $scope.adminRegistration.enteredAccessKey)
				.then(() => {
					ngToast.create({
			    		className: 'success',
			    		content: `User was successfully registered.`
			    	});

					$state.go("communityHome");
				}, (response) => {
					ngToast.create({
			    		className: 'danger',
			    		content: `Error: ${response.data.message}`
			    	});
				});
		}

		$scope.onProcessLoginData = () => {	// logging in
			UserAuthenticationService.login($scope.loginData)
				.then(() => {
					$state.go("communityHome");
				}, (response) => {
					ngToast.create({
			    		className: 'warning',
			    		content: `Incorrect email or password.`
			    	});
				});
		}
	}

})();