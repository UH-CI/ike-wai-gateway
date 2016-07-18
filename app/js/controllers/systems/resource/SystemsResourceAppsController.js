angular.module('AgaveToGo').controller('SystemsResourceAppsController', function($scope, $stateParams, SystemsController, AppsController) {

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
                var message = '';
                if (response.errorResponse.message) {
                  message = 'Error: Could not retrieve apps - ' + response.errorResponse.message
                } else if (response.errorResponse.fault){
                  message = 'Error: Could not retrieve apps - ' + response.errorResponse.fault.message;
                } else {
                  message = 'Error: Could not retrieve apps';
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
        },
        function(response){
          var message = '';
          if (response.errorResponse.message) {
            message = 'Error: Could not retrieve apps - ' + response.errorResponse.message
          } else if (response.errorResponse.fault){
            message = 'Error: Could not retrieve apps - ' + response.errorResponse.fault.message;
          } else {
            message = 'Error: Could not retrieve apps';
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
    var message = '';
    if (response.errorResponse.message) {
      message = 'Error: Could not retrieve apps - ' + response.errorResponse.message
    } else if (response.errorResponse.fault){
      message = 'Error: Could not retrieve apps - ' + response.errorResponse.fault.message;
    } else {
      message = 'Error: Could not retrieve apps';
    }
    App.alert(
      {
        type: 'danger',
        message: message
      }
    );
      $scope.requesting = false;
  }


});
