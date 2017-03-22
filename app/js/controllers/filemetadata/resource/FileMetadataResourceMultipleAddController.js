angular.module('AgaveToGo').controller("FileMetadataResourceMultipleAddController", function($scope, $state, $stateParams, $translate, $window, $uibModal, $rootScope, WizardHandler, MetaController, FilesController, MetadataService, ActionsService, MessageService, FilesMetadataService) {
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

		$scope.populateAssociatedMetadata = function(){
			$scope.allAssociationIds = []
			angular.forEach($scope.fileMetadataObjects, function(value, key) {
				$scope.allAssociationIds.push(value.associationIds)
			})
			if ($scope.allAssociationIds.length > 0){
				$scope.matchingAssociationIds = $scope.allAssociationIds.shift().filter(function(v) {
					return $scope.allAssociationIds.every(function(a) {
							return a.indexOf(v) !== -1;
					});
				});
			}
			//alert(angular.toJson($scope.matchingAssociationIds))
			$scope.matchingMetadata =[];
			MetaController.listMetadata("{'uuid':{$in :['"+$scope.matchingAssociationIds.join("','")+"']}}").then(function(response){
				$scope.matchingMetadata = response.result;
			})
		}

		$scope.fetchFileMetadataObjects = function(){
			MetaController.listMetadata("{$and:[{'name':'File'},{'associationIds':{$in :['"+$scope.fileUuids.join("','")+"']}}]}").then(

				function (response) {
					$scope.fileMetadataObjects = response.result;
					//alert($scope.fileMetadataObjects.length +" : "+$scope.fileUuids+" : " + $scope.fileUuids.length)
					if ($scope.fileMetadataObjects.length < $scope.fileUuids.length){
						//we have object mistmatch so figure our which are missing
						/*FilesMetadataService.createFileMetadataObjects($scope.fileUuids).then(
							MetaController.listMetadata("{$and:[{'name':'File'},{'associationIds':{$in :['"+$scope.fileUuids.join("','")+"']}}]}").then(
								function(resp){
									$scope.fileMetadataObjects = resp.result;
									$scope.populateAssociatedMetadata();
								}
							)
						)*/
					}
					else{
						//do nothing
						$scope.populateAssociatedMetadata();
					}
				}
			)
		}

		$scope.loadedOnce = false;

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

		$scope.fetchFileObjects = function(){
			//fetch File metadata objects
			if ($scope.loadedOnce == false){
				$scope.loadedOnce == true;
				$scope.fetchFileMetadataObjects();
			}
		}
		$scope.fetchFileObjects();

		$rootScope.$on("associationsUpdated", function(){
			$scope.fetchModalMetadata();
			$scope.fetchFileMetadataObjects();
			$scope.populateAssociatedMetadata
			$scope.requesting = false;
		});


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
							//$window.history.back();
							App.alert({message: $translate.instant('success_metadata_add') + $scope.metadataUuid });
						},
						function(response){
							MessageService.handle(response, $translate.instant('error_metadata_add'));
							$scope.requesting = false;
						}
					);
				}
		};
		$scope.animationsEnabled = true;

/////////Modal Stuff/////////////////////
			$scope.fetchModalMetadata = function(query){
				MetaController.listMetadata(
					query
				)
					.then(
						function (response) {
							$scope.metadata= response.result;
							$scope.requesting = false;
						},
						function(response){
							MessageService.handle(response, $translate.instant('error_metadata_list'));
							$scope.requesting = false;
						}
				);

			}
		$scope.addAssociation = function(metadatumUuid) {
			FilesMetadataService.addAssociations($scope.fileMetadataObjects, metadatumUuid)
				.then(function(response) {
					//$scope.matchingAssociationIds.push(metadatumUuid)
					$rootScope.$broadcast('associationsUpdated')
				});
		}

		$scope.unAssociateMetadata = function(metadatumUuid){
			FilesMetadataService.removeAssociations($scope.fileMetadataObjects, metadatumUuid)
				.then(function(response) {
					//remove uuid of unassociated metadata object
					//var index = $scope.matchingAssociationIds.indexOf(metadatumUuid);
					//$scope.matchingAssociationIds.splice(index, 1);
					$rootScope.$broadcast('associationsUpdated')
				});
		}

			$scope.addClone = function(metadatumUuid) {
				if (metadatumUuid){
					$scope.requesting = true;
					MetaController.getMetadata(metadatumUuid)
						.then(function(response){
							$scope.metadatum = response.result;
							var body = {};
							body.name = $scope.metadatum.name;
							body.value = $scope.metadatum.value;
							body.schemaId = $scope.metadatum.schemaId;
							MetaController.addMetadata(body)
								.then(
									function(response){
										$scope.new_metadataUuid = response.result.uuid;
										MetadataService.addDefaultPermissions($scope.new_metadataUuid);
										App.alert({message: $translate.instant('success_metadata_add') + ' ' + $scope.new_metadataUuid });
										$scope.addAssociation($scope.new_metadataUuid)
										$scope.requesting = false;
										$state.go('metadata-edit',{uuid: $scope.new_metadataUuid});
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

				$scope.open = function (size) {
					$scope.fetchModalMetadata();
					var modalInstance = $uibModal.open({
						animation: $scope.animationsEnabled,
						templateUrl: 'views/modals/ModalAssociateMetadata.html',
						controller: 'ModalAssociateMetadataMultiFileCtrl',
						scope: $scope,
						size: size,
						resolve: {

						}
					}
				);

		};

}).controller('ModalAssociateMetadataMultiFileCtrl', function ($scope, $modalInstance, MetaController) {
	///$scope.uuid = filemetadatumUuid;
	$scope.cancel = function () {
		$modalInstance.close();
	};

	$scope.fetchModalMetadata = function(query){
		MetaController.listMetadata(
			query
		)
			.then(
				function (response) {
					$scope.metadata= response.result;
					$scope.requesting = false;
				},
				function(response){
					MessageService.handle(response, $translate.instant('error_metadata_list'));
					$scope.requesting = false;
				}
		);

	}
});
