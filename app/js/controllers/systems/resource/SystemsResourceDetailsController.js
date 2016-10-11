angular.module('AgaveToGo').controller('SystemsResourceDetailsController', function($scope, $stateParams, $translate, SystemsController, ActionsService, RolesService, MessageService) {
  $scope.system = null;

  $scope.getSystem = function(){
    $scope.requesting = true;
    if ($stateParams.systemId !== ''){
      SystemsController.getSystemDetails($stateParams.systemId)
        .then(
          function(response){
            $scope.system = response.result;
            $scope.requesting = false;
          },
          function(response){
            MessageService.handle(response, $translate.instant('error_systems_list'));
            $scope.requesting = false;
          }
        );
    } else {
      App.alert({type: 'danger',message: $translate.instant('error_systems_list')});
    }
  }

  $scope.editRoles = function(system){
    RolesService.editRoles(system);
  }

  $scope.confirmAction = function(resourceType, resource, resourceAction, resourceIndex){
    ActionsService.confirmAction(resourceType, resource, resourceAction, resourceIndex);
  };

  $scope.edit = function(resourceType, resource){
    ActionsService.edit(resourceType, resource);
  };

  $scope.getNotifications = function(resourceType, resource){
    ActionsService.getNotifications(resourceType, resource);
  };

  $scope.getSystem();

});
