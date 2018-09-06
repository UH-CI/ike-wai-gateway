angular.module('AgaveToGo').controller('ImpersonateController', function ($scope, $state, $translate, $localStorage, ActionsService, MessageService, Configuration) {

    $scope.profile = $localStorage.activeProfile;
    $scope.token = $localStorage.token;
    $scope.client = $localStorage.client;
    $scope.storage = $localStorage;

    $scope.refresh = function() {
      $scope.requesting = true;

    };
    $scope.refresh();

    $scope.update = function(user) {
        $localStorage.activeProfile.username = user.name;
        $localStorage.token.access_token = user.token;
        Configuration.oAuthAccessToken = $localStorage.token.access_token
        $scope.refresh();
    };
});
