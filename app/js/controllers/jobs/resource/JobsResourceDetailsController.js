angular.module('AgaveToGo').controller('JobsResourceDetailsController', function($scope, $stateParams, $state, $translate, JobsController, ActionsService, MessageService) {

  $scope.job = null;

  $scope.getJob = function(){
    $scope.requesting = true;
    if ($stateParams.id !== ''){
      JobsController.getJobDetails($stateParams.id)
        .then(
          function(response){
            $scope.job = response.result;
            $scope.requesting = false;
          },
          function(response){
            MessageService.handle(response, $translate.instant('error_jobs_details'));
            $scope.requesting = false;
          }
        );
    } else {
      MessageService.handle(response, $translate.instant('error_jobs_details'));
      $scope.requesting = false;
    }
  };

  $scope.browse = function(id){
    JobsController.getJobDetails(id)
      .then(
        function(data){
          $state.go('data-explorer', {'systemId': data.result.archiveSystem, path: data.result.archivePath});
        },
        function(data){
          MessageService.handle(response, $translate.instant('error_jobs_details'));
          $scope.requesting = false;
        }
      );
  }

  $scope.getJob();

});
