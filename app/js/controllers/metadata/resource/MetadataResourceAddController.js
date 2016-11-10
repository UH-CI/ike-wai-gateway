angular.module('AgaveToGo').controller("MetadataResourceAddController", function($scope, $state, $stateParams, $translate, MetaController, ActionsService, MessageService) {

		if ($stateParams.uuid){
			$scope.model.associatedUuid = $stateParams.uuid;
		}
		if ($stateParams.metadataschemaUuid){
			$scope.model.resource = $stateParams.resourceType;
		}
    $scope.fetchMetadataSchema() = function(){
      MetaController.getMetadataSchema($stateParams.id)
        .then(
          function(response){
            $scope.metadataschema = response.result;
            //$scope.schema = $scope.metadataschema.schema;
            var schemaproperties ={};
            angular.forEach($scope.metadataschema.schema.properties, function(value, key) {
              schemaproperties[key] = {"type": value.type == 'array' ? "string" : value.typ, "title": key};
            });
            $scope.schemaproperties = schemaproperties;
            //});
            formschema = {};
            formschema["type"]="object";
            formschema["properties"] = schemaproperties
            $scope.schema = formschema;//{"type":"object","properties":{"tag":{"type":"string","title":"tag"}}};//JSON.stringify(formschema);
            //{
            //  type: "object",
            //  properties:  JSON.stringify(schemaproperties)
            //};
            $scope.form = [
              "*",
              {
                type: "submit",
                title: "Save"
              }
            ];
          }
          );
    }
		$scope.submit = function(){
			$scope.requesting = true;
			var body = {};
			body.associatedUuid = $scope.model.associatedUuid;
			body.event = $scope.model.event;
			body.url = $scope.model.url;
			body.system = "SYSTEM";
			body.path = "PATH";
			body.filename = "FILENAME";
			body.persistent = $scope.model.persistent;

			MetaController.addMetadata(body)
				.then(
					function(response){
						$scope.metadataUuid = response.result.uuid;
						App.alert({message: $translate.instant('success_metadata_add') + $scope.notificationUuid });
						$scope.requesting = false;
					},
					function(response){
						MessageService.handle(response, $translate.instant('error_metadata_add'));
						$scope.requesting = false;
					}
				);
		};

    $scope.model = {};
	});
