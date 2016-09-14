angular.module('AgaveToGo').controller('MonitorsResourceDetailsController', function($scope, $stateParams, $state, $translate, MonitorsController, ActionsService, MessageService) {
  $scope.monitor = null;

  $scope.getMonitor = function(){
    $scope.requesting = true;
    if ($stateParams.id !== ''){
      MonitorsController.getMonitoringTask($stateParams.id)
        .then(
          function(response){
            $scope.monitor = response.result;
            $scope.requesting = false;
          },
          function(response){
            MessageService.handle(response, $translate.instant('error_monitors_list'));
            $scope.requesting = false;
          }
        );
    } else {
      MessageService.handle(response, $translate.instant('error_monitors_list'));
      $scope.requesting = false;
    }
  };

  $scope.confirmAction = function(resourceType, resource, resourceAction){
    ActionsService.confirmAction(resourceType, resource, resourceAction);
  }

  $scope.getNotifications = function(resourceType, resource){
    ActionsService.getNotifications(resourceType, resource);
  };

  $scope.edit = function(resourceType, resource){
    ActionsService.edit(resourceType, resource);
  };

  $scope.getMonitor();

});
