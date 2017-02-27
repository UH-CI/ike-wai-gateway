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
        MessageService.handle(response, $translate.instant('error_jobs_details'));
        $scope.requesting = false;
      }
    );

});
