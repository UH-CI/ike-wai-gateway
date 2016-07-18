angular.module('AgaveToGo').controller('AppDetailsController', function($rootScope, $filter, $sce, $scope, Commons, $timeout, AppsController) {

    $scope.currentApp = {};

    $scope.runApp = function (appId) {

    };

    AppsController.getAppDetails(appId).then(
        function (data) {
            $timeout(function () {
                $scope.currentApp = data;
            }, 50);
        },
        function (data) {
            t.updateSinglePageInline("Error fetching app description.");
        });
});
