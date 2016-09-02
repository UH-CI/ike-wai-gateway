angular.module('AgaveToGo').controller('MonitorsManagerDirectoryController', function ($scope, $state, $stateParams, MonitorsController, ActionsService) {
    $scope._COLLECTION_NAME = 'monitors';
    $scope._RESOURCE_NAME = 'monitor';

    $scope[$scope._COLLECTION_NAME] = [];

    $scope.sortType = 'target';
    $scope.sortReverse  = false;

    $scope.systemId = $stateParams.systemId ? $stateParams.systemId : null;
    $scope.resourceType = $stateParams.resourceType ? $stateParams.resourceType : null;
    $scope.query = '';

    $scope.refresh = function() {
      $scope.requesting = true;
      $scope[$scope._COLLECTION_NAME] = [];

      MonitorsController.searchMonitors(
        $scope.query
      )
        .then(
          function (response) {
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

    };

    $scope.refresh();

    $scope.searchTools = function(query){
      $scope.query = query;
      $scope.refresh();
    }

    $scope.confirmAction = function(resourceType, resource, resourceAction, resourceList, resourceIndex){
      ActionsService.confirmAction(resourceType, resource, resourceAction, resourceList, resourceIndex);
    }

    $scope.getNotifications = function(resourceType, resource){
      ActionsService.getNotifications(resourceType, resource);
    };

    $scope.edit = function(resourceType, resource){
      ActionsService.edit(resourceType, resource);
    };

});
