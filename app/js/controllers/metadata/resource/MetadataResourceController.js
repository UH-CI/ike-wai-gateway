angular.module('AgaveToGo').controller("MetadataResourceController", function($scope, $state, $stateParams) {

		$scope.metadatumUuid = $stateParams.id;

		$scope.go = function(route){
			$state.go(route);
		};

		$scope.active = function(route){
			// default to details tab
			if ($state.current.name === "metadata"){
				$state.go("metadata.details")
			}

			return $state.is(route);
		};

		$scope.tabs = [
			{ heading: "Details", route:"metadata.details", active:false },
			//{ heading: "History", route:"metadata.history", active:false },
			// { heading: "Stats", route:"jobs.stats", active:false },
		];

		$scope.$on("$stateChangeSuccess", function() {
			$scope.tabs.forEach(function(tab) {
				tab.active = $scope.active(tab.route);
			});
		});
	});
