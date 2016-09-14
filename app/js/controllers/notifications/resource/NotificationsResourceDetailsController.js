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
            MessageService.handle(response, $translate.instant('error_notifications_list'));
            $scope.requesting = false;
          }
        );
    } else {
      MessageService.handle(response, $translate.instant('error_notifications_list'));
      $scope.requesting = false;
    }
  };

  $scope.edit = function(resourceType, resource){
    ActionsService.edit(resourceType, resource);
  };

  $scope.getNotification();

});
