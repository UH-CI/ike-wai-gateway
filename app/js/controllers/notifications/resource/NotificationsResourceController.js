angular.module('AgaveToGo').controller("NotificationsResourceController", function($scope, $state, $stateParams) {

		$scope.notificationId = $stateParams.id;

		$scope.go = function(route){
			$state.go(route);
		};

		$scope.active = function(route){
			// default to details tab
			if ($state.current.name === "notifications"){
				$state.go("notifications.details")
			}

			return $state.is(route);
		};

		$scope.tabs = [
			{ heading: "Details", route:"notifications.details", active:false },
			// { heading: "Edit", route:"notifications.edit", active:false }
			// { heading: "Stats", route:"notifications.stats", active:false },
		];

		$scope.$on("$stateChangeSuccess", function() {
			$scope.tabs.forEach(function(tab) {
				tab.active = $scope.active(tab.route);
			});
		});
	});
