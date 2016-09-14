angular.module('AgaveToGo').controller('SystemsResourceQueuesController', function($scope, $stateParams, $translate, SystemsController, MessageService) {
  SystemsController.getSystemDetails($stateParams.systemId)
    .then(
      function(response){
        $scope.queues = response.queues;
        $scope.$parent.systemId = $stateParams.systemId;
      },
      function(response){
        $scope.$parent.error = true;
        MessageService.handle(response, $translate.instant('error_systems_list'));
      }
    );
});
