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
            var message = '';
            if (response.errorResponse.message) {
              message = 'Error: Could not retrieve notifications - ' + response.errorResponse.message
            } else if (response.errorResponse.fault){
              message = 'Error: Could not retrieve notifications - ' + response.errorResponse.fault.message;
            } else {
              message = 'Error: Could not retrieve notifications';
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

    };

    $scope.refresh();

    $scope.getPage = function(newPageNumber, oldPageNumber){
      $scope.requesting = true;
      $scope.offset = (newPageNumber - 1) * $scope.limit;

      MetaController.listMetadata($scope.query, $scope.limit, $scope.offset)
        .then(
          function (response) {
            $scope.pagesTotal = Math.ceil(response.result.length / $scope.limit);
            $scope[$scope._COLLECTION_NAME] = response.result;
            $scope.requesting = false;
          },
          function(response){
            var message = '';
            if (response.errorResponse.message) {
              message = 'Error: Could not retrieve notifications - ' + response.errorResponse.message
            } else if (response.errorResponse.fault){
              message = 'Error: Could not retrieve notifications - ' + response.errorResponse.fault.message;
            } else {
              message = 'Error: Could not retrieve notifications';
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
    }

    $scope.confirmAction = function(resourceType, resource, resourceAction, resourceList, resourceIndex){
      resource.id = resource.uuid;
      ActionsService.confirmAction(resourceType, resource, resourceAction, resourceList, resourceIndex);
    }
});
