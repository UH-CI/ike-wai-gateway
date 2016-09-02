angular.module('AgaveToGo').controller('NotificationsManagerDirectoryController', function ($scope, $stateParams, NotificationsController, ActionsService) {
    $scope._COLLECTION_NAME = 'notifications';
    $scope._RESOURCE_NAME = 'notification';

    $scope[$scope._COLLECTION_NAME] = [];

    $scope.associatedUuid = null;
    $scope.queryLimit = 99999;

    $scope.offset = 0;
    $scope.limit = 10;

    $scope.sortType = 'startTime';
    $scope.sortReverse  = true;
    $scope.status = 'active';
    $scope.available = true;
    $scope.resourceType = $stateParams.resourceType ? $stateParams.resourceType : null;
    $scope.query = '';

    $scope.refresh = function() {
      $scope.requesting = true;
      $scope[$scope._COLLECTION_NAME] = [];

      // clean refresh defaults
      if ($stateParams.associatedUuid !== null && typeof $stateParams.associatedUuid !== 'undefined'){
        $scope.associatedUuid = $stateParams.associatedUuid;
        $scope.query += '&associatedUuid.eq=' + $stateParams.associatedUuid;
      }

      NotificationsController.searchNotifications(
        $scope.query
      )
        .then(
          function (response) {
            $scope.totalItems = response.result.length;
            $scope.pagesTotal = Math.ceil(response.result.length / $scope.limit);
            $scope[$scope._COLLECTION_NAME] = response.result;
            $scope.requesting = false;
          },
          function(response){
            var message = '';
            if (typeof response.errorResponse !== 'undefined') {
              if (typeof response.errorResponse.message !== 'undefined'){
                message = 'Error: Could not retrieve notifications - ' + response.errorResponse.message;
              } else if (typeof response.errorResponse.fault !== 'undefined') {
                message = 'Error: Could not retrieve notifications- ' + response.errorResponse.fault.message;
              } else {
                message = 'Error: Could not retrieve notifications';
              }
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

    $scope.searchTools = function(query){
      $scope.query = query;
      $scope.refresh();
    }

    $scope.refresh();

    $scope.confirmAction = function(resourceType, resource, resourceAction, resourceList, resourceIndex){
      ActionsService.confirmAction(resourceType, resource, resourceAction, resourceList, resourceIndex);
    }

    $scope.edit = function(resourceType, resource){
      ActionsService.edit(resourceType, resource);
    };

});
