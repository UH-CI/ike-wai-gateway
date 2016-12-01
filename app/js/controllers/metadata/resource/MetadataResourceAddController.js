angular.module('AgaveToGo').controller("MetadataResourceAddController", function($scope, $state, $stateParams, $translate, MetaController, ActionsService, MessageService) {

		$scope.model = {};

		$scope.schemaQuery ='';

		$scope.refresh = function() {
			$scope.requesting = true;

			MetaController.listMetadataSchema(
				$scope.schemaQuery
			).then(function(response){
				$scope.metadataschema = response.result;
				$scope.requesting = false;
			})

		};
		$scope.refresh();

		$scope.fetchMetadataSchema = function(schemauuid) {
			$scope.requesting = true;
			MetaController.getMetadataSchema(schemauuid)
				.then(
					function(response){
						$scope.selectedmetadataschema = response.result;
						var formschema = {};
						formschema["type"]="object";
						formschema["properties"] = $scope.selectedmetadataschema.schema.properties;
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

		$scope.onSubmit = function(form) {
			$scope.requesting = true;
			$scope.$broadcast('schemaFormValidate');
			// Then we check if the form is valid
			if (form.$valid) {
				var body = {};
				body.name = $scope.selectedmetadataschema.schema.title;
				body.value = $scope.model;
				body.schemaId = $scope.selectedmetadataschema.uuid;
				MetaController.addMetadata(body)
					.then(
						function(response){
							$scope.metadataUuid = response.result.uuid;
							App.alert({message: $translate.instant('success_metadata_add') + $scope.metadataUuid });
							var pem_body = {};
							pem_body["username"] = "public";
							pem_body["permission"] = "READ";
							//"{'username': 'public','permision': {'read': true,'write': false}}"
							MetaController.addMetadataPermission(pem_body,$scope.metadataUuid);
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
