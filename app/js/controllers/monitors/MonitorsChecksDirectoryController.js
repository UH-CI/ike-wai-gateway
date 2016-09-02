angular.module('AgaveToGo').controller('MonitorsChecksDirectoryController', function ($scope, $stateParams, MonitorsController, ActionsService) {

    $scope._COLLECTION_NAME = 'monitors';
    $scope._RESOURCE_NAME = 'monitor';

    $scope[$scope._COLLECTION_NAME] = [];

    $scope.query = '';

    $scope.sortType = 'id';
    $scope.sortReverse  = true;

    $scope.monitorId = $stateParams.monitorId;

    $scope.refresh = function() {
      $scope.requesting = true;

      if ($scope.monitorId) {
        MonitorsController.searchMonitoringTaskChecks($scope.monitorId, $scope.query)
          .then(
            function (response) {
              $scope.totalItems = response.result.length;
              $scope.pagesTotal = Math.ceil(response.result.length / $scope.limit);
              $scope[$scope._COLLECTION_NAME] = response.result;
              $scope.requesting = false;
            },
            function(response){
              var message = '';
              if (response.errorResponse.message) {
                message = 'Error: Could not retrieve monitors - ' + response.errorResponse.message
              } else if (response.errorResponse.fault){
                message = 'Error: Could not retrieve monitors - ' + response.errorResponse.fault.message;
              } else {
                message = 'Error: Could not retrieve monitors';
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
        $scope.requesting = false;
        App.alert(
          {
            type: 'danger',
            message: 'Error: Please provide a monitor id'
          }
        );
      }
    };

    $scope.refresh();

    $scope.searchTools = function(query){
      $scope.query = query;
      $scope.refresh();
    }

    $scope.confirmAction = function(resourceType, resource, resourceAction, resourceList, resourceIndex){
      resource.id = resource.uuid;
      ActionsService.confirmAction(resourceType, resource, resourceAction, resourceList, resourceIndex);
    }
});
