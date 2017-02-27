angular.module('AgaveToGo').controller("MetadataResourceAddController", function($scope, $state, $stateParams, $translate, MetaController, MetadataService, ActionsService, MessageService) {

		$scope.model = {};

		$scope.schemaQuery ='';

		$scope.fetchMetadataSchema = function(schemauuid) {
			$scope.requesting = true;
			MetaController.getMetadataSchema(schemauuid)
				.then(
					function(response){
						$scope.selectedmetadataschema = response.result;
						var formschema = {};
						formschema["type"]="object";
						formschema["properties"] = $scope.selectedmetadataschema.schema.properties;
						formschema["required"] = $scope.selectedmetadataschema.schema.required;
						$scope.schema = formschema;
						$scope.form = [
							"*",
							{
								type: "submit",
								title: "Save"
							}
						];
						$scope.schema_selected = true;
						$scope.requesting = false;
					}
			);
		}

		$scope.refresh = function() {
			$scope.requesting = true;

			MetaController.listMetadataSchema(
				$scope.schemaQuery
			).then(function(response){
				$scope.metadataschema = response.result;
				$scope.requesting = false;
			})
			if ($stateParams.schemauuid != null) {
					$scope.fetchMetadataSchema($stateParams.schemauuid);
			}
		};
		$scope.refresh();



		$scope.onSubmit = function(form) {

			$scope.$broadcast('schemaFormValidate');
			// Then we check if the form is valid
			if (form.$valid) {
				$scope.requesting = true;
				var body = {};
				body.name = $scope.selectedmetadataschema.schema.title;
				body.value = $scope.model;
				body.schemaId = $scope.selectedmetadataschema.uuid;
				//check for latitude - if there then store a geojson point
				if($scope.model.latitude){
						body.value["loc"] = {"type":"Point", "coordinates":[$scope.model.latitude,$scope.model.longitude]}
						body.geospatial= true;
				}

				//should be able to create metadata object with permissions set BUT not working at the moment
				//body.permissions = [{"username":"public","permission":"READ"},{"username":"seanbc","permission":"ALL"},{"username":"jgeis","permission":"ALL"},{"username":"ike-admin","permission":"ALL"}];
				MetaController.addMetadata(body)
					.then(
						function(response){
							$scope.metadataUuid = response.result.uuid;
							App.alert({message: $translate.instant('success_metadata_add') + $scope.metadataUuid });
							//add the default permissions for the system in addition to the owners
							MetadataService.addDefaultPermissions($scope.metadataUuid);
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
