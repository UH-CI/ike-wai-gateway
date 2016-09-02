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
      var message = response.errorResponse.message ? 'Error: Could not retrieve notification - ' + response.errorResponse.message : 'Error: Could not retrieve notification';
      App.alert(
        {
          type: 'danger',
          message: message
        }
      );
      $scope.requesting = false;
    }
  };

  $scope.edit = function(resourceType, resource){
    ActionsService.edit(resourceType, resource);
  };

  $scope.getNotification();

});
