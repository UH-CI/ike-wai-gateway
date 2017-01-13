angular.module('AgaveAuth').controller('TenantSelectionController', function ($injector, $timeout, $rootScope, $scope, $state, $location, settings, $localStorage, TenantsController, Commons, Alerts) {

    settings.layout.tenantPage = true;
    settings.layout.loginPage = false;

    $scope.tenant = {selected: "agave.prod", code: "agave.prod", name: "Agave Science-as-a-Service Platform"};
    $scope.tenants = [];
    $scope.displayTenant = undefined;



    //TenantsController.listTenants().then(
    //    function (response) {
    //        console.log(response);
    //        var tenants = [];
    //        angular.forEach(response, function (tenant, key) {
    //            if (settings.debug
    //                || !(Commons.contains(tenant.name.toLowerCase(), 'staging')
    //                || Commons.contains(tenant.name.toLowerCase(), 'dev')))
    //            {
    //                tenants.push(tenant);
    //            }
    //        });
    //        $timeout(function() {
    //            $scope.tenants = tenants;
    //            console.log($scope.tenants);
    //        }, 50);
    //
    //        //$timeout(function () {
    //        //
    //        //}, 50);
    //    },
    //    function (message) {
    //        console.log("error: " + message);
    //        Alerts.danger({message: "Failed to retrieve tenant information."});
    //    }
    //);

    //$scope.$watch('$rootScope.settings.tenants', function(value){
    //    $timeout(function() {
    //        $scope.tenants = value;
    //    }, 500);
    //}, true);
    //TenantsController.listTenants().then(
    //    function (response) {
    //        $timeout(function () {
    //            console.log(response);
    //            $scope.tenants = response;
    //        }, 50);
    //    },
    //    function (message) {
    //        console.log("error: " + message);
    //        Alerts.danger({message: "Failed to retrieve tenant list."});
    //    }
    //);

    $scope.updateTenant = function(item, model) {
        $timeout(function() {
            $scope.displayTenant = item;
        }, 0);
    }

    $scope.loadTenant = function() {
        if ($scope.displayTenant && $scope.displayTenant.code) {
            $localStorage.tenant = $scope.displayTenant;
            $location.path('login/' + $scope.displayTenant.code);
            $location.replace();
        } else {
            Alerts.danger({container: ".lock-body .message", message: "Select an organization to login."});
        }
    };
});
