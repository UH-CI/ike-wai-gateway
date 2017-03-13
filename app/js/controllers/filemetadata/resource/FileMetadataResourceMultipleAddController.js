angular.module('AgaveToGo').controller("FileMetadataResourceMultipleAddController", function($scope, $state, $stateParams, $translate, $window, WizardHandler, MetaController, FilesController, MetadataService, ActionsService, MessageService) {
	$scope.model = {};

		$scope.fileUuids = $stateParams['fileUuids'];
		$scope.filePaths = $stateParams['filePaths'];
		$scope.filename = $stateParams['filename'];
		$scope.schemauuid = $stateParams.schemauuid;


    //$scope.query="{'uuid': //'"+$scope.schemauuid+"'}"//"{'uuid':'316750742996381210-242ac1110-0001-013'}";
    $scope.schemaQuery ='';//"{'owner':'seanbc'}";

		$scope.fetchMetadataSchema = function(schemauuid) {
			$scope.requesting = true;
			if (schemauuid) {
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
		  else{
				$scope.requesting = false;
			}
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

			//fetch File metadata objects
			MetaController.listMetadata("{$and:[{'name':'File'},{'associationIds':{$in :['"+$scope.fileUuids.join("','")+"']}}]}").then(

        function (response) {
          $scope.fileMetadataObjects = response.result;
					if ($scope.fileMetadataObjects.length < $scope.fileUuids.length){
            //we have object mistmatch so figure our which are missing
						angular.forEach($scope.fileUuids, function(value, key) {
							MetaController.listMetadata("{$and:[{'name':'File'},{'associationIds':'"+value+"'}]}").then(
								function(resp){
									$scope.fileobj = resp.result;
									if ($scope.fileobj == ""){
										$scope.createFileObject(value);
									}
							  }
  						)
						})
						//objects should be created fetch them all now
						MetaController.listMetadata("{$and:[{'name':'File'},{'associationIds':{$in :['"+$stateParams.fileUuids.join("','")+"']}}]}").then(
							function(resp){
						  	$scope.fileMetadataObjects = resp.result;
							}
						)
          }
					else{
						//do nothing
					}
				}
			)
    };

    $scope.refresh();



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
		//$scope.submit = function(){
		$scope.onSubmit = function(form) {
			$scope.requesting = true;
			$scope.$broadcast('schemaFormValidate');

    // Then we check if the form is valid
	    if (form.$valid) {
				var body = {};
				//body.associationIds = $scope.fileUuids;//$scope.model.associatedUuid;
				body.name = $scope.selectedmetadataschema.schema.title;
				body.value = $scope.model;
				body.schemaId = $scope.selectedmetadataschema.uuid;
				MetaController.addMetadata(body)
					.then(
						function(response){
							$scope.metadataUuid = response.result.uuid;
							//add the default permissions for the system in addition to the owners
							MetadataService.addDefaultPermissions($scope.metadataUuid);
							angular.forEach($scope.fileMetadataObjects, function(value,key){
								MetadataService.addAssociation(value.uuid,$scope.metadataUuid);
							});
							$scope.requesting = false;
							//$state.go('filemetadata',{id: $scope.fileUuids[0]});
							$window.history.back();
							App.alert({message: $translate.instant('success_metadata_add') + $scope.metadataUuid });
						},
						function(response){
							MessageService.handle(response, $translate.instant('error_metadata_add'));
							$scope.requesting = false;
						}
					);
				}
		};
	});
