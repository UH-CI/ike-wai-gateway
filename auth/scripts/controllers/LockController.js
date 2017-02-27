angular.module('AgaveAuth').controller('LoginController', function ($injector, $timeout, $rootScope, $scope, $state, $stateParams, settings, $localStorage, AccessToken, TenantsController, Commons, Alerts) {

    settings.layout.tenantPage = false;
    settings.layout.loginPage = true;
    $scope.useImplicit = true;


    if (!$localStorage.activeProfile) {
        $scope.go('tenants')
    } else {
        $scope.profile = $localStorage.activeProfile;
    }

    $scope.user = ($localStorage.client && angular.copy($localStorage.client)) || {
            username: '',
            password: '',
            client_key: '',
            client_secret: '',
            remember: 0
        };

    if ($stateParams.tenantId) {
        $scope.tenantId = $stateParams.tenantId;
    } else {
        $state.go('tenants');
    }

    $scope.getTenantByCode = function (tenantId) {
        var namedTenant = false;
        angular.forEach(settings.tenants, function (tenant, key) {
            if (tenant.code === tenantId) {
                namedTenant = tenant;
                return false;
            }
        });

        if (namedTenant) {
            return namedTenant;
        } else {
            Alerts.danger({message: 'No tenant found matching ' + tenantId});
        }
    };


    var updateCurrentTenant = function () {
        $timeout(function () {

            $scope.tenant = $scope.getTenantByCode($scope.tenantId);

            $rootScope.$broadcast('oauth:template:update', '/auth/views/templates/oauth-ng-button.html');

        }, 500);
    };

    $scope.$watch('settings.tenants', function(value){
        updateCurrentTenant();
    }, true);


    updateCurrentTenant();


    var getAccessToken = function(user, options) {
        // Check if `user` has required properties.
        if (!user || !user.username || !user.password) {
            Alerts.danger({message: 'Please supply a valid username and password'});
        }

        var data = {
            grant_type: 'password',
            username: $scope.user.username,
            password: $scope.user.password
        };

        data = queryString.stringify(data);

        options = angular.extend({
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': btoa($scope.user.client_key + ':' + $scope.user.client_secret)
            }
        },  options);

        return $http.post($scope.tenant.baseUrl + '/token', data, options).then(
            function(response) {
                $localStorage.token = response;
                $localStorage.client = $scope.user;
                $localStorage.tenant = $scope.tenant;
                $rootScope.broadcast('oauth:login', token);
                return response;
            },
            function(response) {
                $rootScope.broadcast('oauth:denied');
            });
    }

    /**
     * Retrieves the `refresh_token` and stores the `response.data` on cookies
     * using the `OAuthToken`.
     *
     * @return {promise} A response promise.
     */
    var getRefreshToken = function() {
        var data = {
            grant_type: 'refresh_token',
            refresh_token: $localStorage.token.refresh_token,
            scope: 'PRODUCTION'
        };

        if (null !== config.clientSecret) {
            data.client_secret = config.clientSecret;
        }

        data = queryString.stringify(data);

        var options = {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': btoa($scope.user.client_key + ':' + $scope.user.client_secret)
            }
        };

        return $http.post($scope.tenant.baseUrl + '/token', data, options).then(
            function (response) {
                $localStorage.token = response;
                $rootScope.broadcast('oauth:refresh', token);
                $localStorage.tenant = $scope.tenant;
                return response;
            },
            function(response) {
                $rootScope.broadcast('oauth:denied');
            });
    };

});
