angular.module('AgaveToGo').controller("MetadataSchemasResourceController", function($scope, $state, $stateParams) {

		$scope.metadataschemaUuid = $stateParams.id;

		$scope.go = function(route){
			$state.go(route);
		};

		$scope.active = function(route){
			// default to details tab
			if ($state.current.name === "metadataschemas"){
				$state.go("metadataschemas.details")
			}

			return $state.is(route);
		};

		$scope.tabs = [
			{ heading: "Details", route:"metadataschemas.details", active:false },
			//{ heading: "History", route:"metadata.history", active:false },
			// { heading: "Stats", route:"jobs.stats", active:false },
		];

		$scope.$on("$stateChangeSuccess", function() {
			$scope.tabs.forEach(function(tab) {
				tab.active = $scope.active(tab.route);
			});
		});
	});
