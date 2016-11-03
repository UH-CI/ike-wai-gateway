angular.module('AgaveToGo').controller("FileMetadataResourceController", function($scope, $state, $stateParams) {

		$scope.filemetadatumUuid = $stateParams.id;

		$scope.go = function(route){
			$state.go(route);
		};

		$scope.active = function(route){
			// default to details tab
			if ($state.current.name === "filemetadata"){
				$state.go("filemetadata-add", {uuid: $stateParams.id})
			}

			return $state.is(route);
		};

		$scope.tabs = [
			{ heading: "Add", route:"filemetadata-add", active:true },
			//{ heading: "History", route:"metadata.history", active:false },
			// { heading: "Stats", route:"jobs.stats", active:false },
		];

		$scope.$on("$stateChangeSuccess", function() {
			$scope.tabs.forEach(function(tab) {
				tab.active = $scope.active(tab.route);
			});
		});
	});
