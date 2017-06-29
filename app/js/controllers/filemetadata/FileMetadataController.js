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
    $scope.approvedSchema = ['DataDescriptor','Well','Site','Person','Organization','Location','Keywords','Variable','Tag'];
    $scope.modalSchemas = [''];
    $scope.selectedSchema = [''];
    $scope.matchingAssociationIds = [''];
    $scope.removedAssociationIds = [''];
    $scope.limit = 1000;
    $scope.offset = 0;
    //set admin
    $scope.get_editors = function(){
      $scope.editors = MetadataService.getAdmins();
      $scope.edit_perm = $scope.editors.indexOf($scope.profile.username) > -1;
    }
    $scope.get_editors();

    $scope.query = "{'name':{$in:['Well','Site','Person','Organization','Location','Keywords','Variable','Tag']}}"//'{"associationIds":"' +  $stateParams.uuid + '"}';
    $scope.schemaQuery ='';//"{'owner':'seanbc'}";
    //$scope.subjects = ['Wells', 'SGD', 'Bacteria'];

    $scope.people = [];
    $scope.orgs = [];


    $scope.formats = [
    	".aiff - audio interchange file format",
    	".bmp - bit map",
    	".cdf - common data format, netCDF",
    	".csv - comma-separated value",
    	".docx - Word document",
    	".gif - graphics interchange format",
    	".ipynb - Jupyter notebook",
    	".jpg - joint photographic experts group",
    	".json - geospatial javascript object notation",
    	".json - javascript object notation",
    	".kml - keyhole markup language",
    	".kmz - keyhole markup language, zipped",
    	".mov - QuickTime movie",
    	".mp3 - moving picture experts group",
    	".mp4 - moving picture experts group",
    	".odp - OpenDocument presentation",
    	".ods - OpenDocument spreadsheet",
    	".odt - OpenDocument text",
    	".pdf - Adobe portable document format",
    	".png - portable network graphics",
    	".pptx - PowerPoint",
    	".py - Python",
    	".r - R code and files",
    	".rtf - rich text format",
    	".shp .shx .dbf .prj .xml plus - shapefile (submit together as zip)",
    	".svg - scalable vector graphics",
    	".tex - LaTeX",
    	".tiff - tagged image file format",
    	".tiff - geoTIFF (geospatial tagged image file format)",
    	".tsv - tab-separated value",
    	".txt - plain text or other content",
    	".xlsx - Excel workbook",
    	".xml - extensible markup language",
    	".zip - zip compression",
    	".mat - Matlab file",
    	".fasta - biological sequence text",
    	".fastq - biological sequence text, Illumina"];
    
    
    $scope.languages = ['English', 'Hawaiian'];
    $scope.datadescriptor = {};
    $scope.datadescriptor.organizations = [];
    $scope.datadescriptor.creators = [];
    $scope.datadescriptor.contributors = [];
    $scope.edit_data_descriptor = false;
    $scope.data_descriptor_order = ['creators','title','license_rights','license_permission','subjects','start_datetime','end_datetime','formats','contributors','organizations','languages','version','publishers','publication_date','description','relations']
    $scope.datadescriptor.license_permission = "private";
    $scope.datadescriptor.title = "";
    $scope.datadescriptor.license_rights = 'Creative Commons Attribution CC BY';

    $scope.data_descriptor
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

    $scope.refreshMetadata = function(){
      //refetch the file metadata object to ensure the latest associtionIds are in place
      MetaController.listMetadata("{$and:[{'name':{'$in':['PublishedFile','File']}},{'associationIds':'"+$stateParams.uuid+"'}]}",)
        .then(function(response){
          $q.when()
            .then(function () {
              var deferred = $q.defer();
              $scope.fileMetadataObject = response.result;
              deferred.resolve($scope.fetchMetadata("{'uuid':{$in: ['"+$scope.fileMetadataObject[0].associationIds.join("','")+"']}}"));
              return deferred.promise;
            })
        }
      )
    }
    //MAP STUFF
    $scope.data_descriptor_markers = {};

    $scope.makeLocationMarkers = function(metadata){
        $scope.siteMarkers = $filter('filter')(metadata, {name: "Site"});
        $scope.wellMarkers = $filter('filter')(metadata, {name: "Well"});
        $scope.marks = {};
        angular.forEach($scope.siteMarkers, function(datum) {
            if(datum.value.loc != undefined){
            $scope.marks[datum.uuid.replace(/-/g,"")] = {lat: parseFloat(datum.value.latitude), lng: parseFloat(datum.value.longitude), message: "Site Name: " + datum.value.name + "<br/>" + "Description: " + datum.value.description + "<br/>" + "Latitude: " + datum.value.latitude + "<br/>" + "Longitude: " + datum.value.longitude, draggable:false}
          }
        });
        angular.forEach($scope.wellMarkers, function(datum) {
            if(datum.value.latitude != undefined && datum.value.wid !=undefined){
            $scope.marks[datum.value.wid.replace(/-/g,"")] = {lat: parseFloat(datum.value.latitude), lng: parseFloat(datum.value.longitude), message: "Well ID: " + datum.value.wid + "<br/>" + "Well Name: " + datum.value.well_name + "<br/>" + "Latitude: " + datum.value.latitude + "<br/>" + "Longitude: " + datum.value.longitude, draggable:false}
          }
        });
        $scope.data_descriptor_markers = $scope.marks
    }

    angular.extend($scope, {
        hawaii: {
            lat: 21.289373,
            lng: -157.91,
            zoom: 7
        },
        events: {
          map: {
            enable: ['click', 'drag', 'blur', 'touchstart'],
            logic: 'emit'
          }
        },
        defaults: {
            scrollWheelZoom: false
        },
    });

    $scope.refresh = function() {
      $scope.requesting = true;
  	  $scope.people.length = 0;
      //$scope.keywords.length = 0;
	    $scope.orgs.length = 0;

      MetaController.listMetadataSchema(
				$scope.schemaQuery
			).then(function(response){
				$scope.metadataschema = response.result;
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
            //we have an object to modify our query for getting metadata
            if ($scope.fileMetadataObject[0].name == "PublishedFile"){
              //filename & path are good fetch associated metadata
              $scope.filename = $scope.fileMetadataObject[0]._links.associationIds[0].href.split('system')[1];
             // $scope.fetchMetadata("{'uuid':{$in: ['"+$scope.fileMetadataObject[0].associationIds.join("','")+"']}}");
              $scope.refreshMetadata();
            }
            else if ($scope.fileMetadataObject[0].value.filename != $scope.fileMetadataObject[0]._links.associationIds[0].href.split('system')[1])
            {
              //if filename or path is off change File metadata object
              $scope.updateFileObject($scope.fileMetadataObject[0]);

            }
            else{
              //filename & path are good fetch associated metadata
              $scope.filename = $scope.fileMetadataObject[0]._links.associationIds[0].href.split('system')[1];
             // $scope.fetchMetadata("{'uuid':{$in: ['"+$scope.fileMetadataObject[0].associationIds.join("','")+"']}}");
              $scope.refreshMetadata();


            }
          }
          $scope.setTitle();
        },
        function(response){
          MessageService.handle(response, $translate.instant('error_filemetadata_list'));
          $scope.requesting = false;
        }
      )

      $scope.getPeople();
      //$scope.getKeywords();
      $scope.getOrgs();

      MetaController.listMetadataSchema(
        $scope.schemaQuery
      ).then(function(response){$scope.metadataschema = response.result;})
      jQuery('#datetimepicker1').datetimepicker();
      jQuery('#datetimepicker2').datetimepicker();
      jQuery('#datetimepicker3').datetimepicker();
      $scope.refreshMetadata();
    };

    $scope.setTitle = function() {
      if (!$scope.datadescriptor.title && $scope.filename) {
        $scope.datadescriptor.title = $scope.filename.split('/').slice(-1)[0];
      }
    }

    $scope.getPeople = function(){
        $scope.people.length = 0;
        $scope.fetchMetadata("{'name':'Person'}");
    };

    //$scope.getKeywords = function(){
    //    $scope.keywords.length = 0;
    //    $scope.fetchMetadata("{'name':'Keywords'}");
    //};

    $scope.getOrgs = function(){
        $scope.orgs.length = 0;
        $scope.fetchMetadata("{'name':'Organization'}");
    };

    $scope.fetchMetadata = function(metadata_query){
      MetaController.listMetadata(metadata_query,100,0).then(
          function (response) {
            $scope.totalItems = response.result.length;
            $scope.pagesTotal = Math.ceil(response.result.length / $scope.limit);
            //$scope[$scope._COLLECTION_NAME] = response.result;
            $scope.filemetadata = response.result;
            $scope.makeLocationMarkers($scope.filemetadata);
            angular.forEach($scope[$scope._COLLECTION_NAME], function(value, key){
              if(value.name === 'DataDescriptor'){
                $scope.has_data_descriptor = true;
                $scope.data_descriptor_metadatum = value;
              }
              else if(value.name === 'Person'){
                  $scope.people.push(value.value);
                  $scope.people[$scope.people.length-1]["uuid"] = value.uuid;
              }
              else if(value.name === 'Organization'){
                  $scope.orgs.push(value.value);
                  $scope.orgs[$scope.orgs.length-1]["uuid"] = value.uuid;
              }
            });
            $scope.requesting = false;
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
       $scope.refreshMetadata();
       $scope.refresh();
    });
    
    $rootScope.$on("metadataPersonOrOrgUpdated", function (event, args) {
      $scope.requesting = false;
      if (args.type === "Person") {
        var str = {"first_name":args.value.value.first_name,"last_name":args.value.value.last_name,"uuid":args.value.uuid};
        // this person is a contributor, not a creator
        if ($scope.isContrib) {
          $scope.datadescriptor.contributors.push(str);
        }
        // this person is a creator
        else {
          $scope.datadescriptor.creators.push(str);
        }
      }
      else if (args.type === "Organization") {
        var str = {"name":args.value.value.name,"uuid":args.value.uuid};
        $scope.datadescriptor.organizations.push(str);
      }
      //$scope.refresh();
      $rootScope.$broadcast('metadataUpdated');
    });

    $rootScope.$on("associationsUpdated", function(){
     // $scope.refresh();
     $scope.refreshMetadata()
     // $scope.fetchMetadata("{'uuid':{$in: ['"+$scope.fileMetadataObject[0].associationIds.join("','")+"']}}")
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
      	  App.alert({message: $translate.instant('success_metadata_assocation_removed'),closeInSeconds: 5  });
          $scope.metadatum = null;
          //pause to let model update
          $timeout(function(){
            //$scope.refresh()
              $scope.refreshMetadata();
              $scope.matchingAssociationIds.splice($scope.matchingAssociationIds.indexOf(metadatumUuid))
              $scope.removedAssociationIds.push(metadatumUuid)
              //$scope.fetchMetadata("{'uuid':{$in: ['"+$scope.fileMetadataObject[0].associationIds.join("','")+"']}}")
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
          if($scope.datadescriptor.creators.length > 0 && $scope.datadescriptor.title && $scope.datadescriptor.license_permission && $scope.datadescriptor.license_rights){
            // Then we check if the form is valid
          //	if (form.$valid) {
            MetadataService.fetchSystemMetadataSchemaUuid('DataDescriptor')
            .then(function(response){
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
                      $scope.addAssociation($scope.metadataUuid)
                      App.alert({message: "Success Data Descriptor Saved",closeInSeconds: 5  });
                      $rootScope.$broadcast('metadataUpdated');
                      $scope.edit_data_descriptor = false;
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
          }else{
            $scope.requesting = false;
            App.alert({type:'danger', message: "Creator, Title, License Rights and License Permissions are Required Fields - Please Correct and Submit Again.",closeInSeconds: 5  });
          }

        }

        $scope.updateDataDescriptor = function(){
          $scope.requesting = true;
      		$scope.$broadcast('schemaFormValidate');

          if($scope.datadescriptor.creators.length > 0 && $scope.datadescriptor.creators != '' && $scope.datadescriptor.title && $scope.datadescriptor.license_permission && $scope.datadescriptor.license_rights){
           
            // Then we check if the form is valid
          //	if (form.$valid) {
            MetadataService.fetchSystemMetadataSchemaUuid('DataDescriptor')
            .then(function(response){
              var body = {};
              body.name = $scope.data_descriptor_metadatum.name;
              body.value = $scope.datadescriptor;
              body.schemaId = $scope.data_descriptor_metadatum.schemaId;

              MetaController.updateMetadata(body,$scope.data_descriptor_metadatum.uuid)
                .then(
                  function(response){
                      $scope.metadataUuid = response.result.uuid;
                      App.alert({message: "Success Data Descriptor Saved",closeInSeconds: 5  });
                      $rootScope.$broadcast('metadataUpdated');
                      $scope.edit_data_descriptor = false;
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
          }else{
            $scope.requesting = false;
            App.alert({type:'danger', message: "Creator, Title, Licence Rights and License Permissions are Required Fields - Please Correct and Submit Again.",closeInSeconds: 5  });
          }
        }

        $scope.animationsEnabled = true;

        $scope.editDataDescriptor = function(){
          $scope.datadescriptor = $scope.data_descriptor_metadatum.value;
          $scope.edit_data_descriptor = true;
        }

        $scope.cancelEditDataDescriptor = function(){
          $scope.edit_data_descriptor = false;
          $scope.refreshMetadata();
        }

        $scope.doTheBack = function() {
          window.history.back();
        };
/////////Modal Stuff/////////////////////
        $scope.fetchMoreModalMetadata = function(){
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
                      App.alert({message: $translate.instant('success_metadata_add_assocation'),closeInSeconds: 5 });
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
                        App.alert({message: $translate.instant('success_metadata_add') + ' ' + body.name ,closeInSeconds: 5 });
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
            return item;
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
          $scope.fileMetadataObjects = $scope.fileMetadataObject;
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

    $scope.offset=0;
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
