angular.module('AgaveToGo').controller('FileMetadataController', function ($scope, $state, $stateParams, $translate, $timeout, $window, MetaController, FilesController, FilesMetadataService, ActionsService, MessageService) {
    $scope._COLLECTION_NAME = 'filemetadata';
    $scope._RESOURCE_NAME = 'filemetadatum';

    $scope.sortType = 'name';
    $scope.sortReverse  = true;

    //Don't display metadata of these types
    $scope.ignoreMetadataType = ['published','stagged','PublishedFile','rejected'];
    //Don't display metadata schema types as options
    $scope.ignoreSchemaType = ['PublishedFile'];
    
    $scope.query = '{"associationIds":"' +  $stateParams.uuid + '"}';
    $scope.schemaQuery ='';//"{'owner':'seanbc'}";
    //$scope.query ="{'associationIds':'673572511630299622-242ac113-0001-002'}";
  //  $scope.query["associationIds"] = $stateParams.uuid;

    $scope.filemetadatumUuid = $stateParams.uuid;

    $scope.refresh = function() {
      $scope.requesting = true;

      MetaController.listMetadataSchema(
				$scope.schemaQuery
			).then(function(response){
				$scope.metadataschema = response.result;
				$scope.requesting = false;
			})

      MetaController.listMetadata($scope.query,null,0).then(
          function (response) {
            $scope.totalItems = response.result.length;
            $scope.pagesTotal = Math.ceil(response.result.length / $scope.limit);
            $scope[$scope._COLLECTION_NAME] = response.result;
            $scope.requesting = false;
          },
          function(response){
            MessageService.handle(response, $translate.instant('error_filemetadata_list'));
            $scope.requesting = false;
          }
      );

      MetaController.listMetadataSchema(
        $scope.schemaQuery
      ).then(function(response){$scope.metadataschema = response.result;})

    };

    $scope.searchTools = function(query){
      $scope.query = query;
      $scope.refresh();
    }


    $scope.refresh();

    $scope.confirmAction = function(resourceType, resource, resourceAction, resourceList, resourceIndex){
      ActionsService.confirmAction(resourceType, resource, resourceAction, resourceList, resourceIndex);
    }

    $scope.unAssociateMetadata = function(metadatumUuid){
      $scope.requesting = true;
      var unAssociate = $window.confirm('Are you absolutely sure you want to remove the association?');

    if (unAssociate) {
      FilesMetadataService.removeAssociation(metadatumUuid, $scope.filemetadatumUuid).then(function(result){
        $scope.metadatum = null;
        //pause to let model update
        $timeout(function(){$scope.refresh()}, 300);
        $scope.requesting = false;
      });
    }
    }



});
