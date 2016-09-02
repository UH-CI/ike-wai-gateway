angular.module('AgaveToGo').controller('SystemsResourceDetailsController', function($scope, $stateParams, SystemsController, ActionsService, RolesService) {

  $scope.$parent.error = false;

  $scope.system = null;

  $scope.getSystem = function(){
    if ($stateParams.systemId !== ''){
      SystemsController.getSystemDetails($stateParams.systemId)
        .then(
          function(response){
            $scope.system = response;
          },
          function(response){
            $scope.$parent.error = true;
            App.alert({type: 'danger',message: 'Error: Could not retrieve system'});
          }
        );
    } else {
      $scope.$parent.error = true;
      App.alert({type: 'danger',message: 'Error: Could not retrieve system'});
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
