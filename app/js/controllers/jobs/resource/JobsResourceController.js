angular.module('AgaveToGo').controller("JobsResourceController", function($scope, $state, $stateParams) {

		$scope.jobId = $stateParams.id;

		$scope.go = function(route){
			$state.go(route);
		};

		$scope.active = function(route){
			// default to details tab
			if ($state.current.name === "jobs"){
				$state.go("jobs.details")
			}

			return $state.is(route);
		};

		$scope.tabs = [
			{ heading: "Details", route:"jobs.details", active:false },
			{ heading: "History", route:"jobs.history", active:false },
			// { heading: "Stats", route:"jobs.stats", active:false },
		];

		$scope.$on("$stateChangeSuccess", function() {
			$scope.tabs.forEach(function(tab) {
				tab.active = $scope.active(tab.route);
			});
		});
	});
