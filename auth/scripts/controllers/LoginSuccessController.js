angular.module('AgaveAuth').controller('LoginSuccessController', function ($injector, $timeout, $rootScope, $scope, $state, moment, settings, $localStorage, AccessToken, $location, Alerts, ProfilesController, Configuration) {
    settings.layout.tenantPage = true;
    settings.layout.loginPage = false;

    $timeout(function () {

        $scope.authToken = $localStorage.token;

        $scope.loggedIn = (!!$scope.authToken) && (moment($scope.authToken.expires_at).diff(moment()) > 0);

        if ($scope.loggedIn) {
            $scope.profile = $localStorage.activeProfile;
            if (!$scope.profile) {
                $scope.requesting = true;
                ProfilesController.getProfile('me').then(
                    function(profile) {
                        $rootScope.$broadcast('oauth:profile', profile);
                        $scope.requesting = false;
                    },
                    function(message) {
                        Alerts.danger({message:"Failed to fetch user profile."});
                        $scope.requesting = false;
                    }
                );
            }

            $scope.tenant = $localStorage.tenant;

            var tokenEndsAt = moment($scope.authToken.expires_at).toDate();
            $('#tokenCountdown').countdown({
                until: tokenEndsAt
            });
        } else {
            $scope.requesting = false;
            $location.path("/logout");
            $location.replace();
        }
    }, 50);

    $rootScope.$on('oauth:profile', function(event, profile) {
        $localStorage.activeProfile = profile;
        $timeout(function () {
            $scope.profile = profile;
        },0);
    });

});
