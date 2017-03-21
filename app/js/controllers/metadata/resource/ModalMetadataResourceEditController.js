angular.module('AgaveToGo').controller("ModalMetadataResourceEditController", function($scope, $modalInstance, $state, $translate, $window, WizardHandler, MetaController, MetadataService, ActionsService, MessageService) {

  $scope.close = function () {
    $modalInstance.close();
  };

  $scope.metadatum = null;
  
  $scope.getModalMetadatum = function(){
	$scope.requesting = true;
	var uuid = this.$parent.metadataUuid;
    if (uuid){
	  $scope.requesting = true;
	  MetaController.getMetadata(uuid)
      .then(function(response){
        $scope.metadatum = response.result;
        if($scope.metadatum){
          MetaController.getMetadataSchema($scope.metadatum.schemaId)
            .then(function(schema_response){
              $scope.metadataschema = schema_response.result;
              var formschema = {};
              formschema["type"]="object";
              formschema["properties"] = $scope.metadataschema.schema.properties;
              $scope.schema = formschema;
              $scope.model ={};
              angular.forEach($scope.metadataschema.schema.properties, function(value, key) {
                $scope.model[key] = $scope.metadatum.value[key];
              });
              $scope.form = [
                "*"/*,
                { type: "submit", title: "Save" },
                { type: "button", title: 'Cancel', onClick: "close()" }*/
              ];
            }
          )
        }
        else{
          MessageService.handle(schema_response, $translate.instant('error_metadataschemas_get'));
        }
        $scope.requesting = false;
      }
      );
    }
    else{
      //  MessageService.handle($translate.instant('error_filemetadata_get'));
    }
  }

  $scope.onSubmit = function(form) {
    $scope.requesting = true;
    $scope.$broadcast('schemaFormValidate');
    // Then we check if the form is valid
    if (form.$valid) {
      var body = {};
      body.associationIds = $scope.metadatum.associationIds;
      body.name = $scope.metadatum.name;
      body.value = $scope.model;
      body.schemaId = $scope.metadatum.schemaId;
      MetaController.updateMetadata(body,$scope.metadataUuid)
        .then(
          function(response){
            //App.alert({message: $translate.instant('success_metadata_update') });
			//make sure default permissions are set
			MetadataService.addDefaultPermissions($scope.metadataUuid);
            $scope.requesting = false;
			//$window.history.back();
            //  $state.go('metadata',{id: $scope.metadataUuid});
          },
          function(response){
            MessageService.handle(response, $translate.instant('error_metadata_update'));
            $scope.requesting = false;
          }
        )
      }
    $scope.close();
  };


  $scope.getModalMetadatum();
});
