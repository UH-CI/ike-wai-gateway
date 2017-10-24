angular.module('AgaveToGo').controller('FileMetadataController', function ($scope, $filter, $state, $stateParams, $translate, $timeout, $window, $localStorage,  $uibModal, $rootScope, $q, MetaController, FilesController, FilesMetadataService, ActionsService, MessageService, MetadataService) {
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
    $scope.approvedSchema = ['DataDescriptor','Well','Site','Person','Organization','Location','Subject','Variable','Tag','File'];
    $scope.modalSchemas = [''];
    $scope.selectedSchema = [''];
    $scope.matchingAssociationIds = [''];
    $scope.removedAssociationIds = [''];
    $scope.limit = 500;
    $scope.offset = 0;
    //set admin
    $scope.get_editors = function(){
      $scope.editors = MetadataService.getAdmins();
      $scope.edit_perm = $scope.editors.indexOf($scope.profile.username) > -1;
    }
    $scope.get_editors();
    $scope.action = $stateParams.action;

    $scope.query = "{'name':{$in:['Well','Site','Person','Organization','Location','Subject','Variable','Tag','File']}}"//'{"associationIds":"' +  $stateParams.uuid + '"}';
    $scope.schemaQuery ='';//"{'owner':'seanbc'}";
    $scope.data_descriptor_metadatum = [];
    $scope.associatedDataDescriptors = [];
    $scope.class =[];

    $scope.filemetadatumUuid = $stateParams.uuid;

    var updateFileObject = function() {
      var deferred = $q.defer();
      MetaController.listMetadata("{$and:[{'name':{'$in':['PublishedFile','File']}},{'associationIds':'"+$stateParams.uuid+"'}]}")
        .then(function(response){
              $scope.fileMetadataObject = response.result;
              deferred.resolve();
            
        })
      return deferred.promise;
    };

    $scope.refreshMetadata = function(){
      console.log("JEN FMC: refreshMetadata");
      //refetch the file metadata object to ensure the latest associtionIds are in place
       var deferred = $q.defer();
       deferred.resolve(updateFileObject().then(function(response){ 	
         $scope.fetchMetadata("{'uuid':{$in: ['"+$scope.fileMetadataObject[0].associationIds.join("','")+"']}}")
                  
       }));
       return deferred.promise;
    }

    $scope.refresh = function() {
      console.log("JEN FMC: refresh: action = " + $scope.action);
      $scope.requesting = true;
      $scope.data_descriptor_metadatum.length = 0;

      MetaController.listMetadataSchema(
				$scope.schemaQuery
			).then(function(response){
				$scope.metadataschema = response.result;
			});
      //check if default filemetadata object exists
      MetaController.listMetadata("{$and:[{'name':{'$in':['PublishedFile','File']}},{'associationIds':'"+$stateParams.uuid+"'}]}")
        .then(function (response) {
          $scope.fileMetadataObject = response.result;

          // see if file has a filemetadataobject, if not make one.
          // this retrieves an example file metadata object on dev: 
          // ./metadata-list -v -Q '{"name":"File","associationIds":"1907741320846241305-242ac113-0001-002"}'
          if ($scope.fileMetadataObject == ""){
            $scope.createFileObject($stateParams.uuid);
          }
          else {

            //we have an object to modify our query for getting metadata
            if ($scope.fileMetadataObject[0].name == "PublishedFile"){
              //filename & path are good fetch associated metadata
              $scope.filename = $scope.fileMetadataObject[0]._links.associationIds[0].href.split('system')[1];
             // $scope.fetchMetadata("{'uuid':{$in: ['"+$scope.fileMetadataObject[0].associationIds.join("','")+"']}}");
              //$scope.refreshMetadata();
            }
            //if filename or path are off, update the File metadata object
            else if ($scope.fileMetadataObject[0].value.filename != 
                     $scope.fileMetadataObject[0]._links.associationIds[0].href.split('system')[1]) {
              $scope.updateFileObject($scope.fileMetadataObject[0]);
            }
            else {
              //filename & path are good fetch associated metadata
              $scope.filename = $scope.fileMetadataObject[0]._links.associationIds[0].href.split('system')[1];
             // $scope.fetchMetadata("{'uuid':{$in: ['"+$scope.fileMetadataObject[0].associationIds.join("','")+"']}}");
              //$scope.refreshMetadata();
            }
          }

          //$scope.setTitle();
        },
        function(response){
          MessageService.handle(response, $translate.instant('error_filemetadata_list'));
          $scope.requesting = false;
        });

        MetaController.listMetadataSchema(
          $scope.schemaQuery
        ).then(function(response){$scope.metadataschema = response.result;})
        $scope.refreshMetadata();
      };

  
   /*
    $scope.setTitle = function() {
      if (!$scope.datadescriptor.title && $scope.filename) {
        $scope.datadescriptor.title = $scope.filename.split('/').slice(-1)[0];
      }
    }
    */

    $scope.fetchMetadata = function(metadata_query){
      $scope.fetchMetadataWithLimit(metadata_query, 100);
    }

    $scope.fetchMetadataWithLimit = function(metadata_query, limit){
      console.log("JEN FMC: fetchMetadataWithLimit: " + metadata_query);
      var deferred = $q.defer();
      $scope.associatedDataDescriptors.length = 0;
      $scope.data_descriptor_metadatum.length = 0;
      deferred.resolve(MetaController.listMetadata(metadata_query,limit,0).then(
          function (response) {
            $scope.totalItems = response.result.length;
            $scope.pagesTotal = Math.ceil(response.result.length / $scope.limit);
            //$scope[$scope._COLLECTION_NAME] = response.result;
            $scope.filemetadata = response.result;
            //$scope.datadescriptors = response.result;
            //$scope.makeLocationMarkers($scope.filemetadata);
            angular.forEach($scope[$scope._COLLECTION_NAME], function(value, key){
              if(value.name === 'DataDescriptor'){
                $scope.has_data_descriptor = true;
                //$scope.data_descriptor_metadatum = value;
                $scope.associatedDataDescriptors.push(value.uuid);
                $scope.data_descriptor_metadatum.push(value.value);
                $scope.data_descriptor_metadatum[$scope.data_descriptor_metadatum.length-1]["uuid"] = value.uuid;
              }
            });
            
            if ($scope.action === "associate") {
              $scope.fetchAllDataDescriptors();
            }
            else {
              $scope.action = "view";
              console.log("JEN FMC: have " +  $scope.data_descriptor_metadatum.length + " data descriptors: ");
              // if there is no data descriptor for this file, prompt the user to associate with an
              // existing data descriptor, clone and associate an existing dd, or create a new one
              if ($scope.data_descriptor_metadatum.length === 0) {
                //console.log("JEN FMC: have no data descriptors");
                $scope.has_data_descriptor = false;
                // get all Data Descriptors and let the user do associations 
                // between one or more of them with the current file
                $scope.fetchAllDataDescriptors();
              }
              // if it has only one data descriptor, call the DataDescriptor controller to show it.          
              else if ($scope.data_descriptor_metadatum.length === 1) {
                //console.log("JEN FMC: have one data descriptor");
                $scope.has_data_descriptor = true;
                //$state.go("datadescriptor",{'uuid': $scope.data_descriptor_metadatum[0].uuid, 'action': 'view'});
                $scope.openViewDataDescriptor($scope.data_descriptor_metadatum[0].uuid, 'lg');
              } 
              // if there is more than one data descriptor, show modal list of dds from which the user can select
              else if ($scope.data_descriptor_metadatum.length > 1) {
                $scope.has_data_descriptor = true;
                //console.log("JEN FMC: Got multiple data descriptors");
              }
            }
            $scope.requesting = false;
          },
          function(response){
            MessageService.handle(response, $translate.instant('error_filemetadata_list'));
            $scope.requesting = false;
          }
      ));  
      return deferred.promise;
    };

    $scope.fetchAllDataDescriptors = function(){
      console.log("JEN FMC: fetchAllDataDescriptors");
      var deferred = $q.defer();
      deferred.resolve(MetaController.listMetadata("{'name':'DataDescriptor'}").then(
          function (response) {
            $scope.totalItems = response.result.length;
            $scope.pagesTotal = Math.ceil(response.result.length / $scope.limit);
            //$scope[$scope._COLLECTION_NAME] = response.result;
            $scope.filemetadata = response.result;
            //$scope.makeLocationMarkers($scope.filemetadata);
            //angular.forEach($scope[$scope._COLLECTION_NAME], function(value, key){
            //  if(value.name === 'DataDescriptor'){
            //    //$scope.data_descriptor_metadatum = value;
            //    $scope.data_descriptor_metadatum.push(value.value);
            //    $scope.data_descriptor_metadatum[$scope.data_descriptor_metadatum.length-1]["uuid"] = value.uuid;
            //  }
            //});
            $scope.requesting = false;
          },
          function(response){
            MessageService.handle(response, $translate.instant('error_filemetadata_list'));
            $scope.requesting = false;
          }
      ));  
      return deferred.promise;
    };

    $scope.searchTools = function(query){
      $scope.query = query;
      $scope.fetchModalMetadata()
      //$scope.refresh();
    }

    $scope.refresh();

    $rootScope.$on("metadataUpdated", function(){
      console.log("JEN FMC: on metadataUpdated");
       $scope.refreshMetadata();
       $scope.refresh();
    });

    $rootScope.$on("associationsUpdated", function(){
      console.log("JEN FMC: on associationsUpdated");
     $scope.refreshMetadata()
     App.alert({message: $translate.instant('success_metadata_assocation_removed'),closeInSeconds: 5  });
    });

    $rootScope.$on("associationRemoved", function(){
      console.log("JEN FMC: on associationRemoved");
     $scope.refreshMetadata().then(
       $timeout(function(){
            App.alert({container:'#association_notifications',  message: "Assocation Successfully Removed" ,closeInSeconds: 5  })
          }, 500)
     )
    });

    $scope.confirmAction = function(resourceType, resource, resourceAction, resourceList, resourceIndex){
      ActionsService.confirmAction(resourceType, resource, resourceAction, resourceList, resourceIndex);
    }

    $scope.unAssociateMetadata = function(metadatumUuid, container_id=""){
      console.log("JEN FMC: unAssociateMetadata");
      $scope.requesting = true;
      $scope.class[metadatumUuid] = "btn-warning"
      var unAssociate = $window.confirm('Are you sure you want to remove the metadata/file association?');
      //$scope.confirmAction(metadatum.name, metadatum, 'delete', $scope[$scope._COLLECTION_NAME])
      if (unAssociate) {
        FilesMetadataService.removeAssociations($scope.fileMetadataObject, metadatumUuid).then(function(result){
          App.alert({type:'info',container: container_id, message: 'Removing Association',icon:'fa fa-spinner fa-spin', place:''})
      	  //App.alert({message: $translate.instant('success_metadata_assocation_removed'),closeInSeconds: 5  });
          $scope.metadatum = null;
          $timeout(function(){
            //$scope.refresh()
              $scope.refreshMetadata();
              $scope.matchingAssociationIds.splice($scope.matchingAssociationIds.indexOf(metadatumUuid))
              $scope.removedAssociationIds.push(metadatumUuid)
          }, 500);
          $scope.requesting = false;
        });
      }else{
        $scope.requesting = false;
      }
    }
 
  // the "fileobject" being created is not the file itself,
  // it's metadata holding the file path, name, uuid, and associations
  // note that the uuid of this fileobject is not the same as the one for the file itself. 
  $scope.createFileObject = function(fileUuid){
      console.log("JEN FMC: createFileObject");
      MetaController.listMetadata("{$and:[{'name':'File'},{'associationIds':'"+$stateParams.uuid+"'}]}").then(
        function(resp){
          //if still empty createFileObject
        if (resp.result == ""){
          MetadataService.fetchSystemMetadataSchemaUuid('File').then(function(response_uuid){
            var body={};
            //associate system file with this metadata File object
            body.associationIds = [fileUuid];
            body.name = 'File';
            body.value = {};
            //File Schema uuid
            body.schemaId = response_uuid;
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
          })
         }
        })
      }

      $scope.updateFileObject = function(fileobject){
         MetadataService.fetchSystemMetadataSchemaUuid('File').then(function(response_uuid){
          var body={};
          //associate system file with this metadata File object
          body.associationIds = fileobject.associationIds;
          body.name = 'File';
          body.value= {};
          body.value['filename'] = fileobject._links.associationIds[0].href.split('system')[1];
          body.value['path'] = fileobject._links.associationIds[0].href.split('system')[1];
          //File Schema uuid
          body.schemaId = response_uuid;
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
            )
         })
        }

        $scope.confirmAction = function(resourceType, resource, resourceAction, resourceList, resourceIndex){
          ActionsService.confirmAction(resourceType, resource, resourceAction, resourceList, resourceIndex);
        }

        $scope.confirmRemove = function(metadatum){
          $scope.confirmAction(metadatum.name, metadatum, 'delete', $scope[$scope._COLLECTION_NAME])
        }

        $scope.animationsEnabled = true;

        $scope.doTheBack = function() {
          window.history.back();
        };
/////////Modal Stuff/////////////////////
        $scope.fetchMoreModalMetadata = function(){
          console.log("JEN FMC: fetchMoreModalMetadata");
          $scope.offset = $scope.offset + $scope.limit
          $scope.requesting = true
          MetaController.listMetadata(
            $scope.query,$scope.limit,$scope.offset
          )
            .then(
              function (response) {
                //$scope.metadata = angular.extend($scope.metadata,response.result);
                //$scope.newmetadata. = Object.assign({},$scope.metadata, response.result);
                if (response.result.length == $scope.limit){
                  $scope.can_fetch_more = true;
                }
                else{
                  $scope.can_fetch_more = false;
                }
                $scope.metadata = $scope.metadata.concat(response.result)
                $scope.requesting = false;
              },
              function(response){
                MessageService.handle(response, $translate.instant('error_metadata_list'));
                $scope.requesting = false;
              }
          );
        }
        $scope.fetchModalMetadata = function(query){
          console.log("JEN FMC: fetchModalMetadata");
          $scope.can_fetch_more = false;
          MetaController.listMetadata(
            $scope.query,$scope.limit,$scope.offset
          )
            .then(
              function (response) {
                $scope.metadata= response.result;
                if ($scope.metadata.length == $scope.limit){
                  $scope.can_fetch_more = true;
                }
                $scope.requesting = false;
              },
              function(response){
                MessageService.handle(response, $translate.instant('error_metadata_list'));
                $scope.requesting = false;
              }
          );

        }

        //make and association btwn the current datadescriptor
        //object and the given file.
        //accepts the current datadescriptor uuid 
        //accepts a file uuid to get the dd uuid association
        //accepts a container id to display a message app alert
        // metadatumUuid is really dataDescriptorUuid, but since I'm modifying
        // an old method and don't want a bunch of arbitrary changes to show 
        // during a comparison, I just do an assignment on the first line.
        $scope.addAssociation = function(metadatumUuid,container_id="") {
          console.log("JEN FMC: addAssociation: " + metadatumUuid);
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
                       App.alert({container: container_id, message: $translate.instant('success_metadata_add_assocation'),closeInSeconds: 5 });
                      $scope.requesting = false;

                      //$scope.fetchMetadata("{'uuid':{$in: ['"+body.associationIds.join("','")+"']}}")
                      $scope.refreshMetadata();
                      $scope.matchingAssociationIds.push(metadatumUuid)
                      $scope.removedAssociationIds.splice($scope.removedAssociationIds.indexOf(metadatumUuid))
                      //$state.go('metadata',{id: $scope.metadataUuid});
                    },
                    function(response){
                      MessageService.handle(response, $translate.instant('error_metadata_add_assocation'));
                      $scope.requesting = false;
                    }
                  )
                }
                else {
                  App.alert({type: 'danger',message: $translate.instant('error_metadata_add_assocation_exists'),closeInSeconds: 5  });
                  return
                }
            })
          }
          else{
            MessageService.handle(schema_response, $translate.instant('error_metadataschemas_get'));
          }
          $scope.requesting = false;
        }        

        // metadatumUuid is really dataDescriptorUuid, but since I'm modifying
        // an old method and don't want a bunch of arbitrary changes to show 
        // during a comparison, I just do an assignment on the first line.
        $scope.addClone = function (metadatumUuid) {
          console.log("JEN FMC: addClone: " + metadatumUuid);
          fileUuid = $scope.fileMetadataObject[0].uuid;
          if (metadatumUuid) {
            $scope.requesting = true;
            MetaController.getMetadata(metadatumUuid)
              .then(function (response) {
                $scope.metadatum = response.result;
                var body = {};
                body.name = $scope.metadatum.name;
                body.value = $scope.metadatum.value;
                body.schemaId = $scope.metadatum.schemaId;
                MetaController.addMetadata(body)
                  .then(
                    function (response) {
                      $scope.new_metadataUuid = response.result.uuid;
                      $scope.ddUuid = $scope.new_metadataUuid;
                      MetadataService.addDefaultPermissions($scope.new_metadataUuid);
                      App.alert({
                        message: $translate.instant('success_metadata_add') + ' ' + body.name,
                        closeInSeconds: 5
                      });
                      if (fileUuid && fileUuid != undefined) {
                        $scope.addAssociation($scope.new_metadataUuid, fileUuid);
                      }
                      $scope.requesting = false;
                      //$scope.openEditMetadata($scope.new_metadataUuid,'lg')
                      console.log("clone made: " + $scope.new_metadataUuid);
                      $scope.uuid = $scope.new_metadataUuid;
                      $state.go('datadescriptor', {
                        uuid: $scope.new_metadataUuid,
                        "action": "edit"
                      });
                    },
                    function (response) {
                      MessageService.handle(response, $translate.instant('error_metadata_add'));
                      $scope.requesting = false;
                    }
                  )
              })
          } else {
            MessageService.handle(schema_response, $translate.instant('error_metadataschemas_get'));
          }
          $scope.requesting = false;
        }
      

  /////////Modal Stuff/////////////////////
        $scope.openViewDataDescriptor = function (metadatumuuid, size) {
          $scope.metadataUuid = metadatumuuid;
          $scope.uuid = metadatumuuid;
          $scope.action = 'view';
          var modalInstance = $uibModal.open({
            animation: $scope.animationsEnabled,
            //templateUrl: 'views/modals/ModalViewDataDescriptor.html',
            templateUrl: 'views/datadescriptor/manager.html',
            controller: 'DataDescriptorController',
            scope: $scope,
            size: size,
            metadataUuid: metadatumuuid,
            uuid: metadatumuuid,
            profile: $scope.profile,
            resolve: {

            }
          });
        };

/*
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
        
        $scope.openCreateType = function (size, schemaType, isContrib = false) {
            $scope.requesting = true;
            // get the uuid for the schema
            var typeString = "{'schema.title':'" + schemaType + "'}";
            MetadataService.fetchSystemMetadataSchemaUuid(schemaType)
              .then(function(response){
                var uuid = response;
                //console.log("uuid: " + uuid);
                $scope.isContrib = isContrib;
                $scope.openCreate(uuid, size);
              });
        	$scope.requesting = false;
        };
        
        // open the modal to create a new person schema object
        $scope.openCreatePerson = function (size) {
        	 $scope.openCreateType(size,"Person");
        };

        $scope.openCreateContribPerson = function (size) {
        	 $scope.openCreateType(size,"Person", true);
        };
        
        // open the modal to create a new organization schema object
        $scope.openCreateOrg = function (size) {
        	 $scope.openCreateType(size,"Organization");
        };
        
        $scope.openCreate = function (schemauuid, size) {
          $scope.ddObjects = $scope.ddObject;
          $scope.selectedSchemaUuid = schemauuid;
            var modalInstance = $uibModal.open({
              animation: $scope.animationsEnabled,
              templateUrl: 'views/modals/ModalCreateMetadata.html',
              controller: 'ModalMetadataResourceCreateController',
              scope: $scope,
              size: size,
              schemaUuid: schemauuid,
              ddObjects: $scope.ddObjects,
              resolve: {

              }
            }
          );
        };
*/


}).controller('ModalAssociateMetadatCtrl', function ($scope, $modalInstance, MetaController) {
      $scope.cancel = function () {
        $modalInstance.close();
      };

      $scope.fetchModalMetadata = function(){
        MetaController.listMetadata(
          $scope.query,$scope.limit,$scope.offset
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
