angular.module('AgaveToGo').controller("FileMetadataResourceEditController", function($scope, $state, $stateParams, $translate, WizardHandler, MetaController, FilesController, ActionsService, MessageService) {

	$scope.metadataUuid = $stateParams.filemetadatauuid;

  if ($scope.metadataUuid){
		$scope.requesting = true;
	  MetaController.getMetadata($scope.metadataUuid)
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
                "*",
                {
                  type: "submit",
                  title: "Save"
                }
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
        MessageService.handle(response, $translate.instant('error_filemetadata_get'));
    }

/*	$scope.delete = function(){
		//ActionsService.confirmAction('metadata', $scope.metadata, 'delete');
	};

	$scope.update = function(){
		/*$scope.requesting = true;
		MonitorsController.updateMonitoringTask($scope.model, $scope.model.id)
				.then(
						function(response){
							App.alert({message: $translate.instant('success_monitors_update') + $scope.monitorId});
							$scope.requesting = false;
						},
						function(response){
							$scope.requesting = false;
							MessageService.handle(response, $translate.instant('error_monitors_list'));
						}
				);*/
	//};



});
