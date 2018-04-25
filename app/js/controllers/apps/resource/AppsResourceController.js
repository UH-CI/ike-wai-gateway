angular.module('AgaveToGo').controller("AppsResourceController", function($scope, $state, $stateParams) {

		$scope.appId = $stateParams.appId;

		$scope.go = function(route){
			$state.go(route);
		};
 
		$scope.active = function(route){
			// default to details tab
			if ($state.current.name === "apps"){
<<<<<<< HEAD
				$state.go("apps.details")
=======
				$state.go("apps.run")
>>>>>>> af89ee085147d01acce5bcb1574348d3a55a15d4
			}

			return $state.is(route);
		};

		$scope.tabs = [
<<<<<<< HEAD
			{ heading: "Details", route:"apps.details", active:false },
			{ heading: "Run", route:"apps.run", active:false }
=======
			//{ heading: "Details", route:"apps.details", active:false },
			{ heading: "Run Application", route:"apps.run", active:true }
>>>>>>> af89ee085147d01acce5bcb1574348d3a55a15d4
			// { heading: "Stats", route:"apps.stats", active:false },
		];

		$scope.$on("$stateChangeSuccess", function() {
			$scope.tabs.forEach(function(tab) {
				tab.active = $scope.active(tab.route);
			});
		});


	});
