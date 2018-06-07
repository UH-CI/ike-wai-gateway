angular.module('AgaveToGo').controller("AppsResourceController", function($scope, $state, $stateParams) {

		$scope.appId = $stateParams.appId;

		$scope.go = function(route){
			$state.go(route);
		};

		$scope.active = function(route){
			// default to details tab
			if ($state.current.name === "apps"){
<<<<<<< Updated upstream
<<<<<<< Updated upstream

				$state.go("apps.details")
	}
=======
				$state.go("apps.details")
			}
>>>>>>> Stashed changes
=======
				$state.go("apps.details")
			}
>>>>>>> Stashed changes

			return $state.is(route);
		};

		$scope.tabs = [
<<<<<<< Updated upstream
<<<<<<< Updated upstream

			{ heading: "Details", route:"apps.details", active:false },
			{ heading: "Run Application", route:"apps.run", active:false }

=======
			{ heading: "Details", route:"apps.details", active:false },
			{ heading: "Run", route:"apps.run", active:false }
>>>>>>> Stashed changes
=======
			{ heading: "Details", route:"apps.details", active:false },
			{ heading: "Run", route:"apps.run", active:false }
>>>>>>> Stashed changes
			// { heading: "Stats", route:"apps.stats", active:false },
		];

		$scope.$on("$stateChangeSuccess", function() {
			$scope.tabs.forEach(function(tab) {
				tab.active = $scope.active(tab.route);
			});
		});


	});
