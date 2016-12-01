angular.module('AgaveToGo').controller("MetadataResourceAddAssociationController", function($scope, $state, $stateParams, $translate, WizardHandler, MetaController, FilesController, ActionsService, MessageService) {

  $scope.fileUuid = $stateParams.uuid;
	$scope.metadataUuid = $stateParams.filemetadatauuid;

  $scope._COLLECTION_NAME = 'metadata';
  $scope._RESOURCE_NAME = 'metadatum';


  $scope.queryLimit = 99999;

  $scope.offset = 0;
  $scope.limit = 100;

  $scope.sortType = 'name';
  $scope.sortReverse  = true;
  $scope.status = 'active';
  $scope.available = true;
  $scope.query = '';

  $scope.refresh = function() {
    App.alert({type:'info',message: '<small>Choosing "Associate" will link the file with an existing Metadata Object. </br>"Clone" will copy an existing Metadata Objects attributes, create a new Metadata Object with those attributes and then link the new object to the file.</small>'})
    $scope.requesting = true;
    MetaController.listMetadata(
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
          MessageService.handle(response, $translate.instant('error_metadata_list'));
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





//	$scope.delete = function(){
//		//ActionsService.confirmAction('metadata', $scope.metadata, 'delete');
//	};

  $scope.addAssociation = function(metadatumUuid) {
    if (metadatumUuid){
  		$scope.requesting = true;
  	  MetaController.getMetadata(metadatumUuid)
        .then(function(response){
          $scope.metadatum = response.result;
          var body = {};
          body.associationIds = $scope.metadatum.associationIds;
          //check if fileUuid is already associated
          if (body.associationIds.indexOf($scope.fileUuid) < 0) {
            body.associationIds.push($scope.fileUuid);
            body.name = $scope.metadatum.name;
            body.value = $scope.metadatum.value;
            body.schemaId = $scope.metadatum.schemaId;
            MetaController.updateMetadata(body,metadatumUuid)
            .then(
              function(response){
                App.alert({message: $translate.instant('success_metadata_update_assocation') + ' ' + metadatumUuid });
                $scope.requesting = false;
                //$state.go('metadata',{id: $scope.metadataUuid});
              },
              function(response){
                MessageService.handle(response, $translate.instant('error_metadata_update_assocation'));
                $scope.requesting = false;
              }
            )
          }
          else {
            App.alert({type: 'danger',message: $translate.instant('error_metadata_update_assocation_exists') + ' ' + metadatumUuid });
            return
          }
        })
       }
    else{
         MessageService.handle(schema_response, $translate.instant('error_metadataschemas_get'));
       }
       $scope.requesting = false;
    }

    $scope.addClone = function(metadatumUuid) {
      if (metadatumUuid){
        $scope.requesting = true;
        MetaController.getMetadata(metadatumUuid)
          .then(function(response){
            $scope.metadatum = response.result;
            var body = {};
            body.associationIds = $scope.fileUuid;
            body.name = $scope.metadatum.name;
            body.value = $scope.metadatum.value;
            body.schemaId = $scope.metadatum.schemaId;
            MetaController.addMetadata(body)
              .then(
                function(response){
                  $scope.new_metadataUuid = response.result.uuid;
                  App.alert({message: $translate.instant('success_metadata_add') + ' ' + $scope.new_metadataUuid });
                  $scope.requesting = false;
                  //$state.go('metadata',{id: $scope.metadataUuid});
                },
                function(response){
                  MessageService.handle(response, $translate.instant('error_metadata_add'));
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
