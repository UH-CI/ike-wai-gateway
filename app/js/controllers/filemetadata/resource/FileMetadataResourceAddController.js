angular.module('AgaveToGo').controller("FileMetadataResourceAddController", function($scope, $state, $stateParams, $translate, WizardHandler, MetaController, FilesController, ActionsService, MessageService) {
	$scope.model = {};
		if ($stateParams.associatedUuid){
			$scope.model.associatedUuid = $stateParams.uuid;
		}
		$scope.uuid = $stateParams.uuid;
		$scope.schemauuid = $stateParams.schemauuid;
		/*if ($stateParams.metadataschemaUuid){
			$scope.model.resource = $stateParams.resourceType;
		}*/

    $scope.query="{'uuid': '"+$scope.schemauuid+"'}"//"{'uuid':'316750742996381210-242ac1110-0001-013'}";

    $scope.fetchMetadataSchema = MetaController.listMetadataSchema($scope.query)
        .then(
          function(response){
            $scope.metadataschema = response.result[0];
            //$scope.schema = $scope.metadataschema.schema;
            var schemaproperties ={};
            /*angular.forEach($scope.metadataschema.schema.properties, function(value, key) {
              schemaproperties[key] = {"type": value.type == 'array' ? "string" : value.type, "title": key};
            });
            $scope.schemaproperties = schemaproperties;
            //});*/
            formschema = {};
            formschema["type"]="object";
            formschema["properties"] = $scope.metadataschema.schema.properties;//schemaproperties
            $scope.schema = formschema;
            $scope.form = [
              "*",
              {
                type: "submit",
                title: "Save"
              }
            ];
          }
		);

	  $scope.fetchFile = FilesController.listFileItems("{'uuid':'"+$scope.uuid+"'}").then(
			function(response){
				$scope.file = response.result;
			}
		);
		//$scope.submit = function(){
		$scope.onSubmit = function(form) {
			$scope.requesting = true;
			$scope.$broadcast('schemaFormValidate');

    // Then we check if the form is valid
	    if (form.$valid) {
				var body = {};
				body.associationIds = $scope.uuid;//$scope.model.associatedUuid;
				body.name = $scope.metadataschema.schema.title;
				body.value = $scope.model;
				body.schemaId = $scope.metadataschema.uuid;
				MetaController.addMetadata(body)
					.then(
						function(response){
							$scope.metadataUuid = response.result.uuid;
							App.alert({message: $translate.instant('success_metadata_add') + $scope.metadataUuid });
							$scope.requesting = false;
							$state.go('metadata',{id: $scope.metadataUuid});
						},
						function(response){
							MessageService.handle(response, $translate.instant('error_metadata_add'));
							$scope.requesting = false;
						}
					);
				}
		};

	});
