angular.module('AgaveToGo').controller('MonitorsManagerDirectoryController',
  ['$scope', '$state', '$stateParams', '$translate', 'MonitorsController', 'ActionsService', 'MessageService',
  function ($scope, $state, $stateParams, $translate, MonitorsController, ActionsService, MessageService) {
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

      if ($stateParams.systemId){
        $scope.query += 'target=' + $stateParams.systemId;
      }

      MonitorsController.searchMonitors(
        $scope.query
      )
        .then(
          function (response) {
            $scope[$scope._COLLECTION_NAME] = response.result;
            $scope.requesting = false;
          },
          function(response){
            MessageService.handle(response, $translate.instant('error_monitors_search'));
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

}]);
