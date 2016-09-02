angular.module('AgaveToGo').controller('MonitorsResourceDetailsController', function($scope, $stateParams, $state, MonitorsController, ActionsService) {
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
            var message = '';
            if (response.errorResponse.message) {
              message = 'Error: Could not retrieve monitor - ' + response.errorResponse.message
            } else if (response.errorResponse.fault){
              message = 'Error: Could not retrieve monitor - ' + response.errorResponse.fault.message;
            } else {
              message = 'Error: Could not retrieve monitor';
            }
            App.alert(
              {
                type: 'danger',
                message: message
              }
            );
            $scope.requesting = false;
          }
        );
    } else {
      var message = response.errorResponse.message ? 'Error: Could not retrieve monitor - ' + response.errorResponse.message : 'Error: Could not retrieve monitor';
      App.alert(
        {
          type: 'danger',
          message: message
        }
      );
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
