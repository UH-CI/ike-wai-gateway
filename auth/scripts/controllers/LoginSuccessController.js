angular.module('AgaveAuth').controller('LoginSuccessController', function ($injector, $timeout, $rootScope, $scope, $state, $window, moment, settings, $localStorage, AccessToken, $location, Alerts, ProfilesController, Configuration) {
    settings.layout.tenantPage = true;
    settings.layout.loginPage = false;

    // explicitely set oAuthAccessToken and BASEURI Configuration for SDK
    Configuration.oAuthAccessToken = $localStorage.token ? $localStorage.token.access_token : '';
    Configuration.BASEURI = $localStorage.tenant ? $localStorage.tenant.baseUrl : '';

    $scope.authToken = $localStorage.token;
    $scope.loggedIn = (!!$scope.authToken) && (moment($scope.authToken.expires_at).diff(moment()) > 0);

    if ($scope.loggedIn) {
        $scope.profile = $localStorage.activeProfile;
        if (!$scope.profile) {
            $scope.requesting = true;
            ProfilesController.getProfile('me').then(
                function(response) {
                    $rootScope.$broadcast('oauth:profile', response);
                    $scope.requesting = false;

                    $scope.tenant = $localStorage.tenant;

                    var tokenEndsAt = moment($scope.authToken.expires_at).toDate();
                    $('#tokenCountdown').countdown({
                        until: tokenEndsAt
                    });
                    $window.location.href = '/app';
                },
                function(message) {
                    Alerts.danger({message:"Failed to fetch user profile."});
                    $scope.requesting = false;
                }
            );
        }
    } else {
        $scope.requesting = false;
        $location.path("/logout");
        $location.replace();
    }


    $rootScope.$on('oauth:profile', function(event, profile) {
        $localStorage.activeProfile = profile;
        $timeout(function () {
            $scope.profile = profile;
        },0);
    });

});
