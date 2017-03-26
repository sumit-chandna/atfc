var rootApp = angular.module('rootApp');
rootApp.controller('orderSearchController', function($scope, $window, $http,
		$location) {

	$scope.orderSearch = function(searchData) {
		$scope.resetError();
		if (searchData.ndcFramework == null || searchData.ndcFramework == "") {
			$scope.setError('Please select ndc Framework');
		} else {
			$http.post('orderSearch', searchData).success(function(search) {
				if (search.orderFound) {
					$window.location.href = 'orderSearch';
				} else {
					$scope.setError("No Order Found");
					return;
				}
			}).error(function() {
				$scope.setError('Invalid Pnr Number');
			});
		}
	}

	$scope.resetError = function() {
		$scope.error = false;
		$scope.errorMessage = '';
	}

	$scope.setError = function(message) {
		$scope.error = true;
		$scope.errorMessage = message;
	}

});