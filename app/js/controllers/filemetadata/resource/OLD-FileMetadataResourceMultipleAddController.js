angular.module('AgaveToGo').controller("FileMetadataResourceMulitpleAddController", function($scope, $state, $stateParams, $translate, WizardHandler, MetaController, FilesController, ActionsService, MessageService) {
  //$locationProvider.html5Mode(true);
	//$scope.model = {};
	//	if ($stateParams.associatedUuids){
  //    //this is going to assign and array of ids
	//		$scope.model.associatedUuids = $stateParams.associationIds;//uuids;
	//	}
	//	$scope.uuids = $location.search()['associationIds[]'];//$stateParams.associationIds;//uuids;
	$scope.schemauuid = $stateParams.schemauuid;


  //  $scope.query="{'uuid': '"+$scope.schemauuid+"'}";
/*
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
  /*          formschema = {};
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
*/
/*	  $scope.fetchFile = FilesController.listFileItems("{'uuid':'"+$scope.uuid+"'}").then(
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
*/
	});
