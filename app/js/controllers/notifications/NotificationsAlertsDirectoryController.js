angular.module('AgaveToGo').controller('NotificationsAlertsDirectoryController', function ($scope, MetaController, ActionsService) {

    $scope._COLLECTION_NAME = 'notifications';
    $scope._RESOURCE_NAME = 'notification';

    $scope[$scope._COLLECTION_NAME] = [];

    $scope.query = "{'name':'notifications'}";
    $scope.queryLimit = 99999;

    $scope.offset = 0;
    $scope.limit = 10;

    $scope.sortType = 'event';
    $scope.sortReverse  = true;

    $scope.refresh = function() {
      $scope.requesting = true;

      MetaController.listMetadata($scope.query, null, $scope.offset)
        .then(
          function (response) {
            $scope.totalItems = response.result.length;
            $scope.pagesTotal = Math.ceil(response.result.length / $scope.limit);
            $scope[$scope._COLLECTION_NAME] = response.result;
            $scope.requesting = false;
          },
          function(response){
            MessageService.handle(response, $translate.instant('error_notifications_alerts'));
            $scope.requesting = false;
          }
      );
    };

    $scope.refresh();

    $scope.confirmAction = function(resourceType, resource, resourceAction, resourceList, resourceIndex){
      resource.id = resource.uuid;
      ActionsService.confirmAction(resourceType, resource, resourceAction, resourceList, resourceIndex);
    }
});
