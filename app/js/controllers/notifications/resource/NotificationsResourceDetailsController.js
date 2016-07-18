angular.module('AgaveToGo').controller('NotificationsResourceDetailsController', function($scope, $stateParams, $state, NotificationsController, ActionsService) {
  $scope.notification = null;

  $scope.getNotification = function(){
    $scope.requesting = true;
    if ($stateParams.id !== ''){
      NotificationsController.getNotification($stateParams.id)
        .then(
          function(response){
            $scope.notification = response.result;
            $scope.$parent.name = response.result.name;
            $scope.requesting = false;
          },
          function(response){
            var message = '';
            if (response.errorResponse.message) {
              message = 'Error: Could not retrieve notification - ' + response.errorResponse.message
            } else if (response.errorResponse.fault){
              message = 'Error: Could not retrieve notification - ' + response.errorResponse.fault.message;
            } else {
              message = 'Error: Could not retrieve notification';
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
      var message = response.errorResponse.message ? 'Error: Could not retrieve notification - ' + response.errorResponse.message : 'Error: Could not retrieve job';
      App.alert(
        {
          type: 'danger',
          message: message
        }
      );
      $scope.requesting = false;
    }
  };

  // $scope.browse = function(id){
  //   JobsController.getJobDetails(id)
  //     .then(
  //       function(data){
  //         $state.go('data-explorer', {'systemId': data.archiveSystem, path: data.archivePath});
  //       },
  //       function(data){
  //         var message = response.errorResponse.message ? 'Error: Could not retrieve notification - ' + response.errorResponse.message : 'Error: Could not retrieve job';
  //         App.alert(
  //           {
  //             type: 'danger',
  //             message: message
  //           }
  //         );
  //         $scope.requesting = false;
  //         $scope.requesting = false;
  //       }
  //     );
  // }

  // $scope.confirmAction = function(resourceType, resource, resourceAction, resourceIndex){
  //   ActionsService.confirmAction(resourceType, resource, resourceAction, resourceIndex);
  // };
  //
  // $scope.editPermissions = function(resource) {
  //   PermissionsService.editPermissions(resource);
  // }
  //
  $scope.edit = function(resourceType, resource){
    ActionsService.edit(resourceType, resource);
  };

  $scope.getNotification();

});
