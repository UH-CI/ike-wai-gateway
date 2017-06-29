angular.module('AgaveToGo').controller('MetadataSchemasController', function ($scope, $state, $translate, MetaController, FilesController, ActionsService, MessageService) {
    $scope._COLLECTION_NAME = 'metadataschemas';
    $scope._RESOURCE_NAME = 'metadataschema';

    $scope.sortType = 'name';
    $scope.sortReverse  = true;
    $scope.query = '';//"{'owner':'seanbc'}";

    $scope.refresh = function() {
      $scope.requesting = true;

      MetaController.listMetadataSchema(
        $scope.query,100,0
      )
        .then(
          function (response) {
            $scope.totalItems = response.result.length;
            $scope.pagesTotal = Math.ceil(response.result.length / $scope.limit);
            $scope[$scope._COLLECTION_NAME] = response.result;
            $scope.requesting = false;
          },
          function(response){
            MessageService.handle(response, $translate.instant('error_metadataschemas_list'));
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

});
