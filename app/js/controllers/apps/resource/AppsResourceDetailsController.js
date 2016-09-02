angular.module('AgaveToGo').controller('AppsResourceDetailsController', function($scope, $stateParams, AppsController, ActionsService, PermissionsService) {

  $scope.app = null;

  $scope.getApp = function(){
    if ($stateParams.appId !== ''){
      AppsController.getAppDetails($stateParams.appId)
        .then(
          function(response){
            $scope.app = response.result;
          },
          function(response){
            var message = '';
            if (response.errorResponse.message) {
              message = 'Error: Could not retrieve app - ' + response.errorResponse.message
            } else if (response.errorResponse.fault){
              message = 'Error: Could not retrieve app - ' + response.errorResponse.fault.message;
            } else {
              message = 'Error: Could not retrieve app';
            }
            App.alert(
              {
                type: 'danger',
                message: message
              }
            );
          }
        );
    } else {
      var message = '';
      if (response.errorResponse.message) {
        message = 'Error: Could not retrieve app - ' + response.errorResponse.message
      } else if (response.errorResponse.fault){
        message = 'Error: Could not retrieve app - ' + response.errorResponse.fault.message;
      } else {
        message = 'Error: Could not retrieve app';
      }
      App.alert(
        {
          type: 'danger',
          message: message
        }
      );
    }
  };

  $scope.confirmAction = function(resourceType, resource, resourceAction, resourceIndex){
    ActionsService.confirmAction(resourceType, resource, resourceAction, resourceIndex);
  };

  $scope.editPermissions = function(resource) {
    PermissionsService.editPermissions(resource);
  }

  $scope.edit = function(resourceType, resource){
    ActionsService.edit(resourceType, resource);
  };

  $scope.getNotifications = function(resourceType, resource){
    ActionsService.getNotifications(resourceType, resource);
  };

  $scope.getApp();

});
