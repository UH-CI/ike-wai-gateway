angular.module('AgaveToGo').controller('SystemsResourceQueuesController', function($scope, $stateParams, $translate, SystemsController, MessageService) {

  $scope.requesting = true;

  SystemsController.getSystemDetails($stateParams.systemId)
    .then(
      function(response){
        $scope.queues = response.result.queues;
        $scope.$parent.systemId = $stateParams.systemId;
        $scope.requesting = false;
      },
      function(response){
        $scope.$parent.error = true;
        MessageService.handle(response, $translate.instant('error_systems_list'));
        $scope.requesting = false;
      }
    );
});
