angular.module('AgaveToGo').controller("ModalRejectDataDescriptorStagingRequestController", function($scope, $modalInstance, $state, $translate, $window, $rootScope, $timeout, $filter) {


	$scope.close = function () {
	  $modalInstance.close();
	};

	$scope.model = {};

	$scope.initialize = function() {
		$scope.requesting = true;
		var formschema = {};
		$scope.schema = formschema;
		$scope.model ={};
		$scope.model.reason = "";
		$scope.form = [
			"*"
		];
		$scope.requesting = false;
	}


	$scope.onSubmit = function(form) {
		$scope.requesting = true;
		var body = {};
		body.value = $scope.model;
		//var reason = form.reason.$modelValue;
		var reason = $scope.model.reason;
		$scope.requesting = false;
		$scope.close();
		$rootScope.$broadcast('dd.staging.request.rejected', reason);
	};

	$scope.initialize();
});
