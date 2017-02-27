angular.module('AgaveToGo').controller("MonitorsResourceController", function($scope, $state, $stateParams) {

		$scope.monitorId = $stateParams.id;

		$scope.go = function(route){
			$state.go(route);
		};

		$scope.active = function(route){
			// default to details tab
			if ($state.current.name === "monitors"){
				$state.go("monitors.details")
			}

			return $state.is(route);
		};

		$scope.tabs = [
			{ heading: "Details", route:"monitors.details", active:false },
			// { heading: "Edit", route:"monitors.edit", active:false }
			// { heading: "Stats", route:"monitors.stats", active:false },
		];

		$scope.$on("$stateChangeSuccess", function() {
			$scope.tabs.forEach(function(tab) {
				tab.active = $scope.active(tab.route);
			});
		});
	});
