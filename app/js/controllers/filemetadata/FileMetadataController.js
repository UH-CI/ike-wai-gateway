angular.module('AgaveToGo').controller('FileMetadataController', function ($scope, $state, $stateParams, $translate, MetaController, FilesController, ActionsService, MessageService) {
    $scope._COLLECTION_NAME = 'filemetadata';
    $scope._RESOURCE_NAME = 'filemetadatum';

    $scope.sortType = 'name';
    $scope.sortReverse  = true;

    $scope.query = '{"associationIds":"' +  $stateParams.uuid + '"}';
    $scope.schemaQuery ='';//"{'owner':'seanbc'}";
    //$scope.query ="{'associationIds':'673572511630299622-242ac113-0001-002'}";
  //  $scope.query["associationIds"] = $stateParams.uuid;

    $scope.filemetadatumUuid = $stateParams.uuid;

    $scope.refresh = function() {
      $scope.requesting = true;

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

    $scope.unAssociateMetadata = function(associated_metadata_uuid){
      if (associated_metadata_uuid){
    		$scope.requesting = true;
    	  MetaController.getMetadata(associated_metadata_uuid)
          .then(function(response){
            $scope.metadatum = response.result;
            var body = {};
            body.associationIds = $scope.metadatum.associationIds;
            body.associationIds.splice(body.associationIds.indexOf($scope.fileUuid), 1);
            body.name = $scope.metadatum.name;
            body.value = $scope.metadatum.value;
            body.schemaId = $scope.metadatum.schemaId;
            MetaController.updateMetadata(body,associated_metadata_uuid)
            .then(
              function(response){
                App.alert({message: $translate.instant('success_metadata_assocation_removed') + ' ' + $scope.metadataUuid });
                $scope.requesting = false;
                $scope.refresh();
                //$state.go('metadata',{id: $scope.metadataUuid});
              },
              function(response){
                MessageService.handle(response, $translate.instant('error_metadata_update_assocation'));
                $scope.requesting = false;
              }
            )
          })
         }
      else{
           MessageService.handle(schema_response, $translate.instant('error_metadataschemas_get'));
      }
         $scope.requesting = false;
    }


});
