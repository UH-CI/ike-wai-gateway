angular.module('AgaveToGo').controller('FileMetadataController', function ($scope, $state, $stateParams, $translate, $timeout, $window, $localStorage,  $uibModal, $rootScope, MetaController, FilesController, FilesMetadataService, ActionsService, MessageService, MetadataService) {
    $scope._COLLECTION_NAME = 'filemetadata';
    $scope._RESOURCE_NAME = 'filemetadatum';

    $scope.profile = $localStorage.activeProfile;

    $scope.sortType = 'name';
    $scope.sortReverse  = true;
    $scope.has_data_descriptor = false;
    //Don't display metadata of these types
    $scope.ignoreMetadataType = ['published','stagged','PublishedFile','rejected','File','unapproved'];
    //Don't display metadata schema types as options
    $scope.ignoreSchemaType = ['PublishedFile'];
    $scope.approvedSchema = ['DataDescriptor','Well','Site','Variable'];
    $scope.modalSchemas = [''];
    $scope.selectedSchema = [''];
    //set admin
    $scope.get_editors = function(){
      $scope.editors = MetadataService.getAdmins();
      $scope.edit_perm = $scope.editors.indexOf($scope.profile.username) > -1;
    }
    $scope.get_editors();

    $scope.query = "{'name':{$in:['Well','Site']}}"//'{"associationIds":"' +  $stateParams.uuid + '"}';
    $scope.schemaQuery ='';//"{'owner':'seanbc'}";
    //$scope.query ="{'associationIds':'673572511630299622-242ac113-0001-002'}";
  //  $scope.query["associationIds"] = $stateParams.uuid;

    $scope.selected = {};
    $scope.selected.subjects = [];
    $scope.subjects = ['Wells', 'SGD', 'Bacteria'];

    $scope.selected.people = [];
    $scope.people = [{"lastName": "Geis", "firstName": "Jennifer"},{"lastName": "Cleveland", "firstName": "Sean"},{"lastName": "Jacobs", "firstName": "Gwen"}];
    //$scope.systemTemplates.push({"id": system.id, "name": system.name, "type": system.type});

    $scope.selected.contributingPeople = [];
    $scope.contributingPeople = [{"lastName": "Geis", "firstName": "Jennifer"},{"lastName": "Cleveland", "firstName": "Sean"},{"lastName": "Jacobs", "firstName": "Gwen"}];

    $scope.selected.formats = [];
    $scope.formats = ['pdf', 'jpeg', 'shape file', 'excel spreadsheet', 'word doc'];

    $scope.selected.languages = [];
    $scope.languages = ['English', 'Hawaiian', 'Dublin Core', 'Gene Ontology for genomics', 'Plant Ontology'];
    $scope.datadescriptor = {};
    /*
    $scope.tagTransformPerson = function (newTag) {
        var item = {
            name: newTag,
            email: newTag.toLowerCase()+'@email.com',
            age: 'unknown',
            country: 'unknown'
        };
    */

    $scope.filemetadatumUuid = $stateParams.uuid;

    $scope.refresh = function() {
      $scope.requesting = true;
      MetaController.listMetadataSchema(
				$scope.schemaQuery
			).then(function(response){
				$scope.metadataschema = response.result;
				$scope.requesting = false;
			})
      //check if default filemetadata object exists
      MetaController.listMetadata("{$and:[{'name':{'$in':['PublishedFile','File']}},{'associationIds':'"+$stateParams.uuid+"'}]}").then(

        function (response) {
          $scope.fileMetadataObject = response.result;

          if ($scope.fileMetadataObject == ""){
            //we have no object so create a new one
            $scope.createFileObject($stateParams.uuid);

          }
          else{
            //we have an object to modify our query for gettting metadata
            if ($scope.fileMetadataObject[0].name == "PublishedFile"){
              //filename & path are good fetch associated metadata
              $scope.filename = $scope.fileMetadataObject[0]._links.associationIds[0].href.split('system')[1];
              $scope.fetchMetadata("{'uuid':{$in: ['"+$scope.fileMetadataObject[0].associationIds.join("','")+"']}}")

            }
            else if ($scope.fileMetadataObject[0].value.filename != $scope.fileMetadataObject[0]._links.associationIds[0].href.split('system')[1])
            {
              //if filename or path is off change File metadata object
              $scope.updateFileObject($scope.fileMetadataObject[0]);

            }
            else{
              //filename & path are good fetch associated metadata
              $scope.filename = $scope.fileMetadataObject[0]._links.associationIds[0].href.split('system')[1];
              $scope.fetchMetadata("{'uuid':{$in: ['"+$scope.fileMetadataObject[0].associationIds.join("','")+"']}}")

            }
          }
        },
        function(response){
          MessageService.handle(response, $translate.instant('error_filemetadata_list'));
          $scope.requesting = false;
        }
      )

      MetaController.listMetadataSchema(
        $scope.schemaQuery
      ).then(function(response){$scope.metadataschema = response.result;})
      jQuery('#datetimepicker1').datetimepicker();
      jQuery('#datetimepicker2').datetimepicker();
      jQuery('#datetimepicker3').datetimepicker();
    };

    $scope.fetchMetadata = function(metadata_query){
      MetaController.listMetadata(metadata_query,100,0).then(
          function (response) {
            $scope.totalItems = response.result.length;
            $scope.pagesTotal = Math.ceil(response.result.length / $scope.limit);
            $scope[$scope._COLLECTION_NAME] = response.result;
            angular.forEach($scope[$scope._COLLECTION_NAME], function(value, key){
              if(value.name =='DataDescriptor'){
                $scope.has_data_descriptor = true;
              }
            })
            $scope.requesting = false;
          //  $scope.$apply();
          },
          function(response){
            MessageService.handle(response, $translate.instant('error_filemetadata_list'));
            $scope.requesting = false;
          }
      );
    };

    $scope.searchTools = function(query){
      $scope.query = query;
      $scope.fetchModalMetadata()
      //$scope.refresh();
    }


    $scope.refresh();

    $rootScope.$on("metadataUpdated", function(){
      $scope.refresh();
    });

    $rootScope.$on("associationsUpdated", function(){
      $scope.refresh();
    });

    $scope.confirmAction = function(resourceType, resource, resourceAction, resourceList, resourceIndex){
      ActionsService.confirmAction(resourceType, resource, resourceAction, resourceList, resourceIndex);
    }

    $scope.unAssociateMetadata = function(metadatumUuid){
      $scope.requesting = true;
      var unAssociate = $window.confirm('Are you sure you want to remove the metadata/file association?');
      //$scope.confirmAction(metadatum.name, metadatum, 'delete', $scope[$scope._COLLECTION_NAME])
      if (unAssociate) {
        FilesMetadataService.removeAssociations($scope.fileMetadataObject, metadatumUuid).then(function(result){
      	  App.alert({message: $translate.instant('success_metadata_assocation_removed') });
          $scope.metadatum = null;
          //pause to let model update
          $timeout(function(){
            //$scope.refresh()
              $scope.fetchMetadata("{'uuid':{$in: ['"+$scope.fileMetadataObject[0].associationIds.join("','")+"']}}")
          }, 300);
          $scope.requesting = false;
        });
      }else{
        $scope.requesting = false;
      }
    }

    $scope.createFileObject = function(fileUuid){
      MetaController.listMetadata("{$and:[{'name':'File'},{'associationIds':'"+$stateParams.uuid+"'}]}").then(
        function(resp){
          //if still empty createFileObject
        if (resp.result == ""){
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
                //App.alert({message: $translate.instant('File is ready for adding metadata') });
                //add the default permissions for the system in addition to the owners
                MetadataService.addDefaultPermissions($scope.metadataUuid);
                $scope.updateFileObject(response.result)
                $scope.requesting = false;
                $scope.refresh();
              },
              function(response){
                MessageService.handle(response, $translate.instant('error_metadata_add'));
                $scope.requesting = false;
              }
            );
          }
        })
      }

      $scope.updateFileObject = function(fileobject){
        var body={};
        //associate system file with this metadata File object
        body.associationIds = fileobject.associationIds;
        body.name = 'File';
        body.value= {};
        body.value['filename'] = fileobject._links.associationIds[0].href.split('system')[1];
        body.value['path'] = fileobject._links.associationIds[0].href.split('system')[1];
        //File Schema uuid
        body.schemaId = '3557207775540866585-242ac1110-0001-013';
        MetaController.updateMetadata(body,fileobject.uuid)
          .then(
            function(response){
              $scope.metadataUuid = response.result.uuid;
              //App.alert({message: $translate.instant('File is ready for adding metadata') });
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

        $scope.confirmAction = function(resourceType, resource, resourceAction, resourceList, resourceIndex){
          ActionsService.confirmAction(resourceType, resource, resourceAction, resourceList, resourceIndex);
        }

        $scope.confirmRemove = function(metadatum){
          $scope.confirmAction(metadatum.name, metadatum, 'delete', $scope[$scope._COLLECTION_NAME])
        }

        $scope.saveDataDescriptor = function(){
          $scope.requesting = true;
      		$scope.$broadcast('schemaFormValidate');
      		// Then we check if the form is valid
      	//	if (form.$valid) {
          MetadataService.fetchSystemMetadataSchemaUuid('DataDescriptor')
          .then(function(response){
            alert(response)
      			var body = {};
      			body.name = "DataDescriptor";
      			body.value = $scope.datadescriptor;
      			body.schemaId = response;

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
      								$scope.close();
      								//$rootScope.$broadcast('associationsUpdated');
      							}, 500);
      							});

      						}
      							App.alert({message: $translate.instant('success_metadata_add') + " " + response.result.value.name });
      						  $rootScope.$broadcast('metadataUpdated');
      						},
      						function(response){
      							MessageService.handle(response, $translate.instant('error_metadata_add'));
      							$scope.requesting = false;
      						}
      				);
      			//}
      			//else{
      			//	$scope.requesting = false;
      			//}
          })

        }

        $scope.animationsEnabled = true;



/////////Modal Stuff/////////////////////
        $scope.fetchModalMetadata = function(query){
          MetaController.listMetadata(
            $scope.query
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
          if (metadatumUuid){
        		$scope.requesting = true;
        	  MetaController.getMetadata($scope.fileMetadataObject[0].uuid)
              .then(function(response){
                $scope.metadatum = response.result;
                var body = {};
                body.associationIds = $scope.metadatum.associationIds;
                //check if fileUuid is already associated
                if (body.associationIds.indexOf(metadatumUuid) < 0) {
                  body.associationIds.push(metadatumUuid);
                  body.name = $scope.metadatum.name;
                  body.value = $scope.metadatum.value;
                  body.schemaId = $scope.metadatum.schemaId;
                  MetaController.updateMetadata(body,$scope.fileMetadataObject[0].uuid)
                  .then(
                    function(response){
                      // decided not to show the metadata name in the error message as it would require that to be passed in, or another call
                      App.alert({message: $translate.instant('success_metadata_add_assocation') });
                      $scope.requesting = false;
                      //$scope.refresh();
                      alert('fetchMe')
                      $scope.fetchMetadata("{'uuid':{$in: ['"+body.associationIds.join("','")+"']}}")
                      //$state.go('metadata',{id: $scope.metadataUuid});
                    },
                    function(response){
                      MessageService.handle(response, $translate.instant('error_metadata_add_assocation'));
                      $scope.requesting = false;
                    }
                  )
                }
                else {
                  App.alert({type: 'danger',message: $translate.instant('error_metadata_add_assocation_exists') });
                  return
                }
              })
             }
          else{
               MessageService.handle(schema_response, $translate.instant('error_metadataschemas_get'));
             }
             $scope.requesting = false;
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
                        App.alert({message: $translate.instant('success_metadata_add') + ' ' + body.name });
                        $scope.addAssociation($scope.new_metadataUuid)
                        $scope.requesting = false;
                        $scope.openEditMetadata($scope.new_metadataUuid,'lg')
                        //$state.go('metadata-edit',{uuid: $scope.new_metadataUuid});
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
        $scope.locFilter = function(item){
           if (item.name === 'Well' || item.name === 'Site'){
            return item;// || item.name === 'Site';
            alert('filtering')
          }
        }


  /////////Modal Stuff/////////////////////

        $scope.open = function (size, types, title) {
            //Set the
            $scope.modalSchemas = types.slice(0);
             $scope.selectedSchema = types.slice(0);
            $scope.modalTitle = title;
            var modalInstance = $uibModal.open({
              animation: $scope.animationsEnabled,
              templateUrl: 'views/modals/ModalAssociateMetadata.html',
              controller: 'ModalAssociateMetadatCtrl',
              scope: $scope,
              size: size,
              resolve: {

              }
            }
          );
          //$scope.fetchModalMetadata();
          $scope.searchAll();
        };

        $scope.openEditMetadata = function (metadatumuuid, size) {
        	$scope.metadataUuid = metadatumuuid;
            var modalInstance = $uibModal.open({
              animation: $scope.animationsEnabled,
              templateUrl: 'views/modals/ModalEditMetadata.html',
              controller: 'ModalMetadataResourceEditController',
              scope: $scope,
              size: size,
              resolve: {

              }
            }
          );
        };

        $scope.openViewMetadata = function (metadatumuuid, size) {

        	$scope.metadataUuid = metadatumuuid;
            var modalInstance = $uibModal.open({
              animation: $scope.animationsEnabled,
              templateUrl: 'views/modals/ModalViewMetadata.html',
              controller: 'ModalMetadataResourceDetailsController',
              scope: $scope,
              size: size,
              resolve: {

              }
            }
          );
        };

        $scope.openCreate = function (schemauuid, size) {
            $scope.fileMetadataObjects = $scope.fileMetadataObject
          $scope.selectedSchemaUuid = schemauuid;
            var modalInstance = $uibModal.open({
              animation: $scope.animationsEnabled,
              templateUrl: 'views/modals/ModalCreateMetadata.html',
              controller: 'ModalMetadataResourceCreateController',
              scope: $scope,
              size: size,
              schemaUuid: schemauuid,
              fileMetadataObjects: $scope.fileMetadataObjects,
              resolve: {

              }
            }
          );
        };

///////Assoc modal search////////
$scope.schemaBox = {val1:true,val2:true};
$scope.wellbox = true;
$scope.searchField = {value:''}
$scope.searchAll = function(){
  $scope.requesting = true;
    var orquery = {}
    var andquery = {}
    var queryarray = []
    var andarray = []
    var innerquery = {}
    var typearray = []
    var typequery = {}

    angular.forEach($scope.metadataschema, function(value, key){
      if($scope.selectedSchema.indexOf(value.schema.title) > -1){
        //set the schema name(s) to search across
        typearray.push(value.schema.title);
        //add schema properties to search across
        if ($scope.searchField.value != ''){
          angular.forEach(value.schema.properties, function(val, key){
            var valquery = {}
            valquery['value.'+key] = {$regex: $scope.searchField.value, '$options':'i'}
            queryarray.push(valquery)
          })
          orquery['$or'] = queryarray;
        }
      }
    })
    typequery['name'] = {'$in': typearray}
    andarray.push(typequery)
    andarray.push(orquery)
    andquery['$and'] = andarray;
    $scope.query = JSON.stringify(andquery);

    $scope.fetchModalMetadata();
}

// Toggle selection for a given fruit by name
  $scope.toggleSelectedSchema = function(title) {
    var idx = $scope.selectedSchema.indexOf(title);

    // Is currently selected
    if (idx > -1) {
      $scope.selectedSchema.splice(idx, 1);
    }

    // Is newly selected
    else {
      $scope.selectedSchema.push(title);
    }
    $scope.modalSchemas = $scope.modalSchemas
  };

}).controller('ModalAssociateMetadatCtrl', function ($scope, $modalInstance, MetaController) {
      ///$scope.uuid = filemetadatumUuid;
      $scope.cancel = function () {
        $modalInstance.close();
      };

      $scope.fetchModalMetadata = function(query){
        MetaController.listMetadata(
          $scope.query
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
