angular.module('AgaveToGo').controller('SystemDetailsController', function($rootScope, $filter, $sce, $scope, Commons, $timeout, SystemsController) {

    $scope.currentSystem = {};

    SystemsController.getSystemDetails(id).then(
        function (data) {
            $timeout(function () {
                $scope.currentSystem = data;
            }, 50);
        },
        function (data) {
            App.alert({
                type: 'danger',
                message: "There was an error contacting the systems service. If this " +
                "persists, please contact your system administrator."
            });
        });
});
