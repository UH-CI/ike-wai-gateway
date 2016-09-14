angular.module('AgaveToGo').controller('SystemsResourceAppsController', function($scope, $stateParams, $translate, SystemsController, AppsController, MessageService) {

  $scope.limit = 99999;
  $scope.offset = 0;

  $scope.apps = null;

  if ($stateParams.systemId !== ''){
    SystemsController.getSystemDetails($stateParams.systemId)
      .then(
        function(response){
          AppsController.listApps($scope.limit, $scope.offset, { 'executionSystem.like': $stateParams.systemId })
            .then(
              function(response){
                $scope.apps = response.result;
              },
              function(response){
                MessageService.handle(response, $translate.instant('error_apps_search'));
                $scope.requesting = false;
              }
            );
        },
        function(response){
          MessageService.handle(response, $translate.instant('error_apps_search'));
          $scope.requesting = false;
        }
      );
  } else {
      MessageService.handle(response, $translate.instant('error_apps_search'));
      $scope.requesting = false;
  }


});
