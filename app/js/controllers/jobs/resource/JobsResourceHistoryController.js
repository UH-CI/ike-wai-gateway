angular.module('AgaveToGo').controller('JobsResourceHistoryController', function($scope, $stateParams, JobsController, ActionsService) {
  $scope.sortType = 'startTime';
  $scope.sortReverse  = true;

  JobsController.getJobHistory($stateParams.id)
    .then(
      function(response){
        $scope.jobHistory = response.result;
        $scope.requesting = false;
      },
      function(response){
        var message = response.errorResponse.message ? 'Error: Could not retrieve job - ' + response.errorResponse.message : 'Error: Could not retrieve job';
        App.alert(
          {
            type: 'danger',
            message: message
          }
        );
        $scope.requesting = false;
      }
    );

});
