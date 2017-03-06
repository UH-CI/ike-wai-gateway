angular.module('AgaveToGo').controller('FileMetadataController', function ($scope, $state, $stateParams, $translate, $timeout, $window, MetaController, FilesController, FilesMetadataService, ActionsService, MessageService,MetadataService) {
    $scope._COLLECTION_NAME = 'filemetadata';
    $scope._RESOURCE_NAME = 'filemetadatum';

    $scope.sortType = 'name';
    $scope.sortReverse  = true;

    //Don't display metadata of these types
    $scope.ignoreMetadataType = ['published','stagged','PublishedFile','rejected'];
    //Don't display metadata schema types as options
    $scope.ignoreSchemaType = ['PublishedFile'];

    $scope.query = ''//'{"associationIds":"' +  $stateParams.uuid + '"}';
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
      //check if default filemetadata object exists
      MetaController.listMetadata("{$and:[{'name':'File'},{'associationIds':['"+$stateParams.uuid+"']}]}").then(

        function (response) {
          $scope.fileMetadataObject = response.result;
          $scope.filename = $scope.fileMetadataObject[0]._links.associationIds[0].href.split('system')[1];
          if ($scope.fileMetadataObject == ""){
            //we have no object so create a new on
            $scope.createFileObject($stateParams.uuid);
          }
          else{
            //we have an object to modify our query for gettting metadata
            $scope.fetchMetadata('{"associationIds":"' +  $scope.fileMetadataObject[0].uuid + '"}')
          }
        },
        function(response){
          MessageService.handle(response, $translate.instant('error_filemetadata_list'));
          $scope.requesting = false;
        }
      )

      MetaController.listMetadataSchema(
        $scope.schemaQuery
      ).then(function(response){$scope.metadataschema = response.result;})

    };

    $scope.fetchMetadata = function(metadata_query){
      MetaController.listMetadata(metadata_query,100,0).then(
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

    $scope.createFileObject = function(fileUuid){
      var body={};
      //associate system file with this metadata File object
      body.associationIds = [fileUuid];
      body.name = 'File';
      body.value = {};
      //File Schema uuid
      body.schemaId = '3557207775540866585-242ac1110-0001-013';
      MetaController.addMetadata(body)
        .then(
          function(response){
            $scope.metadataUuid = response.result.uuid;
            App.alert({message: $translate.instant('File is ready for adding metadata') });
            //add the default permissions for the system in addition to the owners
            MetadataService.addDefaultPermissions($scope.metadataUuid);
            $scope.requesting = false;
            $scope.refresh();
          },
          function(response){
            MessageService.handle(response, $translate.instant('error_metadata_add'));
            $scope.requesting = false;
          }
        );
      }




});
