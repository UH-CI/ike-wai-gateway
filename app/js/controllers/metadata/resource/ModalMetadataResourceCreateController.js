angular.module('AgaveToGo').controller("ModalMetadataResourceCreateController", function($scope, $modalInstance, $state, $translate, $window, $rootScope, $timeout, $filter, MetaController, MetadataService, ActionsService, FilesMetadataService, MessageService) {


	$scope.close = function () {
	  $modalInstance.close();
	};

	$scope.model = {};

	$scope.schemaQuery ='';
	$scope.approvedSchema = ["Well","Site"]
	var selectedSchemaUuid = '';

	$scope.initialize = function() {
		selectedSchemaUuid = this.$parent.selectedSchemaUuid;
		$scope.refresh();
	}

	$scope.changeSchema = function(schemauuid) {
		selectedSchemaUuid = schemauuid;
		$scope.refresh();
	}

	$scope.fetchMetadataSchema = function() {
		$scope.requesting = true;

		MetaController.getMetadataSchema(selectedSchemaUuid)
			.then(
				function(response){
					$scope.selectedmetadataschema = response.result;
					var formschema = {};
					formschema["type"]="object";
					formschema["properties"] = $scope.selectedmetadataschema.schema.properties;
					formschema["required"] = $scope.selectedmetadataschema.schema.required;
					$scope.schema = formschema;
					$scope.form = [
						"*"/*,
						{
							type: "submit",
							title: "Save"
						}*/
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
			$scope.metadataschema = 	$filter('filter')(response.result, function(item){
				return $scope.approvedSchema.indexOf(item.schema.title) > -1;
			}
		  );
			$scope.requesting = false;
		})
		if (selectedSchemaUuid != null) {
				$scope.fetchMetadataSchema(selectedSchemaUuid);
		}
	};


	$scope.onSubmit = function(form) {
		$scope.requesting = true;
		$scope.$broadcast('schemaFormValidate');
		// Then we check if the form is valid
		if (form.$valid) {
			alert("HEY")
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
						//add the default permissions for the system in addition to the owners
						MetadataService.addDefaultPermissions($scope.metadataUuid);
						//check if this is for a file object or just a new metadata creation
						if ($scope.fileMetadataObjects){
						FilesMetadataService.addAssociations($scope.fileMetadataObjects, $scope.metadataUuid)
							.then(function(response) {
							//	need to send to modal instead
							$timeout(function(){
								$scope.requesting = false;
								$rootScope.$broadcast('metadataUpdated');
								//$rootScope.$broadcast('associationsUpdated');
								$scope.close();
							}, 500);
							});

						}
						else{
							App.alert({message: $translate.instant('success_metadata_add') + " " + response.result.value.name });
						  $rootScope.$broadcast('metadataUpdated');
							$timeout(function(){
								$scope.requesting = false;
								$rootScope.$broadcast('metadataUpdated');
								//$rootScope.$broadcast('associationsUpdated');
								$scope.close();
							}, 500);
							}
						},
						function(response){
							MessageService.handle(response, $translate.instant('error_metadata_add'));
							$scope.requesting = false;
						}
				);
			}
			else{
				$scope.requesting = false;
			}
		//$parent.refresh();
	};

	$scope.initialize();
});
