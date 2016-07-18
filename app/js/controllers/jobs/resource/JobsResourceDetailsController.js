angular.module('AgaveToGo').controller('JobsResourceDetailsController', function($scope, $stateParams, $state, JobsController, ActionsService) {

  $scope.job = null;

  $scope.getJob = function(){
    $scope.requesting = true;
    if ($stateParams.id !== ''){
      JobsController.getJobDetails($stateParams.id)
        .then(
          function(response){
            $scope.job = response.result;
            $scope.$parent.name = response.result.name;
            $scope.requesting = false;
          },
          function(response){
            var message = '';
            if (response.errorResponse.message) {
              message = 'Error: Could not retrieve job - ' + response.errorResponse.message
            } else if (response.errorResponse.fault){
              message = 'Error: Could not retrieve job - ' + response.errorResponse.fault.message;
            } else {
              message = 'Error: Could not retrieve job';
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
      var message = response.errorResponse.message ? 'Error: Could not retrieve job - ' + response.errorResponse.message : 'Error: Could not retrieve job';
      App.alert(
        {
          type: 'danger',
          message: message
        }
      );
      $scope.requesting = false;
    }
  };

  $scope.browse = function(id){
    JobsController.getJobDetails(id)
      .then(
        function(data){
          $state.go('data-explorer', {'systemId': data.archiveSystem, path: data.archivePath});
        },
        function(data){
          var message = response.errorResponse.message ? 'Error: Could not retrieve job - ' + response.errorResponse.message : 'Error: Could not retrieve job';
          App.alert(
            {
              type: 'danger',
              message: message
            }
          );
          $scope.requesting = false;
          $scope.requesting = false;
        }
      );
  }

  $scope.getJob();

});
