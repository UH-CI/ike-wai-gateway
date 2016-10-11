angular.module('AgaveToGo').controller('MonitorsChecksDirectoryController', function ($scope, $stateParams, $translate, MonitorsController, ActionsService, MessageService) {

    $scope._COLLECTION_NAME = 'monitors';
    $scope._RESOURCE_NAME = 'monitor';

    $scope[$scope._COLLECTION_NAME] = [];

    $scope.query = '';

    $scope.sortType = 'created';
    $scope.sortReverse  = true;

    $scope.monitorId = $stateParams.monitorId;

    $scope.refresh = function() {
      $scope.requesting = true;
      if ($scope.monitorId) {
        MonitorsController.searchMonitoringTaskChecks($scope.monitorId, $scope.query)
          .then(
            function (response) {
              $scope.totalItems = response.result.length;
              $scope[$scope._COLLECTION_NAME] = response.result;
              $scope.requesting = false;
            },
            function(response){
              MessageService.handle(response, $translate.instant('error_monitors_checks_search'));
              $scope.requesting = false;
            }
        );
      } else {
        $scope.requesting = false;
        App.alert(
          {
            type: 'danger',
            message: $translate.instant('error_monitors_checks_id')
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
