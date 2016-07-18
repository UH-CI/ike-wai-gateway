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
    $scope.associatedUuid = $stateParams.associatedUuid ? $stateParams.associatedUuid : null;
    $scope.resourceType = $stateParams.resourceType ? $stateParams.resourceType : null;

    $scope.refresh = function() {
      $scope.requesting = true;
      $scope[$scope._COLLECTION_NAME] = [];

      $scope.associatedUuid = $scope.associatedUuid === '' ? null : $scope.associatedUuid;
      $scope.available = $scope.available === '' ? null : $scope.available;
      $scope.created = $scope.created === '' ? null : $scope.created;
      $scope.associatedUuid = $scope.associatedUuid === '' ? null : $scope.associatedUuid;
      $scope.event = $scope.event === '' ? null : $scope.event;
      $scope.id = $scope.id === '' ? null : $scope.id;
      $scope.lastsent = $scope.lastsent === '' ? null : $scope.lastsent;
      $scope.lastupdated = $scope.lastupdated === '' ? null : $scope.lastupdated;
      $scope.limit = $scope.limit === '' ? null : $scope.limit;
      $scope.offset = $scope.offset === '' ? null : $scope.offset;
      $scope.owner = $scope.owner === '' ? null : $scope.owner;
      $scope.persistent =   $scope.persistent === '' ? null : $scope.persistent;
      $scope.status = $scope.status === '' ? null : $scope.status;

      $scope.success = $scope.success === '' ? null : $scope.success;
      $scope.url = $scope.url === '' ? null : $scope.url;

      NotificationsController.searchNotifications(
        $scope.associatedUuid,
        $scope.available,
        $scope.created,
        $scope.event,
        $scope.id,
        $scope.lastsent,
        $scope.lastupdated,
        null, // $scope.limit
        $scope.offset,
        $scope.owner,
        $scope.persistent,
        $scope.status,
        $scope.success,
        $scope.url
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

    $scope.search = function(){
      $scope.offset = 0;
      $scope.refresh();
    }

    $scope.refresh();

    $scope.getPage = function(newPageNumber, oldPageNumber){
      $scope.requesting = true;
      $scope.offset = (newPageNumber - 1) * $scope.limit;

      NotificationsController.searchNotifications(
        $scope.associatedUuid,
        $scope.available,
        $scope.created,
        $scope.event,
        $scope.id,
        $scope.lastsent,
        $scope.lastupdated,
        $scope.limit,
        $scope.offset,
        $scope.owner,
        $scope.persistent,
        $scope.status,
        $scope.success,
        $scope.url
      )
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
      ActionsService.confirmAction(resourceType, resource, resourceAction, resourceList, resourceIndex);
    }
    //
    $scope.edit = function(resourceType, resource){
      ActionsService.edit(resourceType, resource);
    };
    //
    // $scope.editPermissions = function(resource) {
    //     PermissionsService.editPermissions(resource);
    // }


});
