angular.module('AgaveToGo').controller('DataDescriptorController', function ($scope, $filter, $state, $stateParams, $translate, $timeout, $window, $localStorage, $uibModal, $rootScope, $q, MetaController, FilesController, FilesMetadataService, ActionsService, MessageService, MetadataService) {
  $scope._COLLECTION_NAME = 'filemetadata';
  $scope._RESOURCE_NAME = 'filemetadatum';

  $scope.profile = $localStorage.activeProfile;

  $scope.sortType = 'name';
  $scope.sortReverse = true;
  $scope.has_data_descriptor = false;
  //Don't display metadata of these types
  $scope.ignoreMetadataType = ['published', 'stagged', 'PublishedFile', 'rejected', 'File', 'unapproved'];
  //Don't display metadata schema types as options
  $scope.ignoreSchemaType = ['PublishedFile'];
  $scope.approvedSchema = ['DataDescriptor', 'Well', 'Site', 'Person', 'Organization', 'Location', 'Subject', 'Variable', 'Tag', 'File'];
  $scope.modalSchemas = [''];
  $scope.selectedSchema = [''];
  $scope.matchingAssociationIds = [''];
  $scope.removedAssociationIds = [''];
  $scope.limit = 500;
  $scope.offset = 0;
  //set admin
  $scope.get_editors = function () {
    $scope.editors = MetadataService.getAdmins();
    $scope.edit_perm = $scope.editors.indexOf($scope.profile.username) > -1;
  }
  $scope.get_editors();
  $scope.action = $stateParams.action;

  $scope.query = "{'name':{$in:['Well','Site','Person','Organization','Location','Subject','Variable','Tag','File']}}";
  $scope.schemaQuery = ''; //"{'owner':'seanbc'}";
  //$scope.subjects = ['Wells', 'SGD', 'Bacteria'];

  $scope.people = [];
  $scope.orgs = [];
  $scope.subjects = [];
  $scope.locations = [];
  $scope.variables = [];
  $scope.ddUuid = $stateParams.uuid;

  $scope.formats = [
    ".bmp - bit map",
    ".cdf - common data format, netCDF",
    ".csv - comma-separated value",
    ".docx - Word document",
    ".fasta - biological sequence text",
    ".fastq - biological sequence text, Illumina",
    ".gif - graphics interchange format",
    ".ipynb - Jupyter notebook",
    ".jpg - joint photographic experts group",
    ".json - geospatial javascript object notation",
    ".json - javascript object notation",
    ".kml - keyhole markup language",
    ".kmz - keyhole markup language, zipped",
    ".mat - Matlab file ",
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
    ".shp.shx .dbf .prj .xml - shapefile (submit together as zip)",
    ".svg - scalable vector graphics",
    ".tex - LaTeX",
    ".tiff - tagged image file format",
    ".tiff - geoTIFF (geospatial tagged image file format)",
    ".tsv - tab-separated value",
    ".txt - plain text or other content",
    ".xlsx - Excel workbook ",
    ".xml - extensible markup language",
    ".zip - zip compression (select internal file formats also)"
  ];

  // Licenses from: https://creativecommons.org/licenses/
  $scope.license_rights = [
    "Creative Commons Attribution CC BY",
    "Creative Commons Attribution-ShareAlike CC BY-SA",
    "Creative Commons Attribution-NoDerivs CC BY-ND",
    "Creative Commons Attribution-NoCommercial-ShareAlike CC BY-NC-SA",
    "Creative Commons Attribution-NoCommercial CC BY-NC",
    "Creative Commons Attribution-NoCommercial-NoDerivs CC BY-NC-ND",
    "Other"
  ];

  $scope.languages = ['English', 'Hawaiian'];
  $scope.datadescriptor = {};
  $scope.datadescriptor.organizations = [];
  $scope.datadescriptor.creators = [];
  $scope.datadescriptor.files = [];
  //$scope.datadescriptor.subjects = [];
  $scope.datadescriptor.contributors = [];
  $scope.edit_data_descriptor = false;
  $scope.data_descriptor_order = ['creators', 'title', 'license_rights', 'license_permission', 'subjects', 'start_datetime', 'end_datetime', 'formats', 'contributors', 'organizations', 'languages', 'version', 'publisher', 'publication_date', 'description', 'relations']
  $scope.datadescriptor.license_permission = "public";
  $scope.datadescriptor.title = "";
  $scope.datadescriptor.license_rights = "Creative Commons Attribution CC BY";

  $scope.data_descriptor
  $scope.class = [];

  $scope.refreshMetadata = function () {
    console.log("JEN DDC: refreshMetadata: uuid:'" + $stateParams.uuid);
    console.log("JEN DDC: refreshMetadata: uuid:" + $scope.ddUuid);
    //refetch the file metadata object to ensure the latest associtionIds are in place
    var deferred = $q.defer();
    //$scope.fetchMetadata("{'uuid':'" + $stateParams.uuid + "'}");
    $scope.fetchMetadata("{'uuid':'" + $scope.ddUuid + "'}");
    return deferred.promise;
  }

  //MAP STUFF
  $scope.data_descriptor_markers = {};

  $scope.makeLocationMarkers = function (metadata) {
    $scope.siteMarkers = $filter('filter')(metadata, {
      name: "Site"
    });
    $scope.wellMarkers = $filter('filter')(metadata, {
      name: "Well"
    });
    $scope.marks = {};
    angular.forEach($scope.siteMarkers, function (datum) {
      if (datum.value.loc != undefined) {
        $scope.marks[datum.uuid.replace(/-/g, "")] = {
          lat: parseFloat(datum.value.latitude),
          lng: parseFloat(datum.value.longitude),
          message: "Site Name: " + datum.value.name + "<br/>" + "Description: " + datum.value.description + "<br/>" + "Latitude: " + datum.value.latitude + "<br/>" + "Longitude: " + datum.value.longitude,
          draggable: false
        }
      }
    });
    angular.forEach($scope.wellMarkers, function (datum) {
      if (datum.value.latitude != undefined && datum.value.wid != undefined) {
        $scope.marks[datum.value.wid.replace(/-/g, "")] = {
          lat: parseFloat(datum.value.latitude),
          lng: parseFloat(datum.value.longitude),
          message: "Well ID: " + datum.value.wid + "<br/>" + "Well Name: " + datum.value.well_name + "<br/>" + "Latitude: " + datum.value.latitude + "<br/>" + "Longitude: " + datum.value.longitude,
          draggable: false
        }
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

  $scope.refresh = function () {
    console.log("JEN DDC: refresh: action = " + $scope.action + ", uuid:" + $stateParams.uuid);
    console.log("JEN DDC: refresh: action = " + $scope.action + ", uuid:" + $scope.ddUuid);
    if ($scope.action === "create") {
      $scope.ddUuid = "";
      $scope.action = "edit";
    }
    if ($scope.action === "clone") {
      $scope.action = "edit";
      //$scope.addClone($stateParams.uuid);
      $scope.addClone($scope.ddUuid);
    }

    $scope.requesting = true;
    $scope.people.length = 0;
    //$scope.subjects.length = 0;
    $scope.orgs.length = 0;

    MetaController.listMetadataSchema(
      $scope.schemaQuery
    ).then(function (response) {
      $scope.metadataschema = response.result;
    })

    //check if default filemetadata object exists
    //MetaController.listMetadata("{'uuid':'" + $stateParams.uuid + "'}").then(
    MetaController.listMetadata("{'uuid':'" + $scope.ddUuid + "'}").then(
      function (response) {
        $scope.ddObject = response.result;
        //$scope.refreshMetadata();
      },
      function (response) {
        MessageService.handle(response, $translate.instant('error_filemetadata_list'));
        $scope.requesting = false;
      }
    )

    $scope.getPeople();
    //$scope.getSubjects();
    $scope.getOrgs();
    $scope.getFiles();

    MetaController.listMetadataSchema(
      $scope.schemaQuery
    ).then(function (response) {
      $scope.metadataschema = response.result;
    })
    jQuery('#datetimepicker1').datepicker();
    jQuery('#datetimepicker2').datepicker();
    jQuery('#datetimepicker3').datepicker();
    $scope.refreshMetadata();
  };

  /*
   $scope.setTitle = function() {
     if (!$scope.datadescriptor.title && $scope.filename) {
       $scope.datadescriptor.title = $scope.filename.split('/').slice(-1)[0];
     }
   }
   */

  $scope.getPeople = function () {
    $scope.people.length = 0;
    $scope.fetchMetadata("{'name':'Person'}");
  };
  
  $scope.getAssociations = function () {
    $scope.locations = [];
    $scope.variables = [];
    console.log('getAssociation')
    if ($scope.data_descriptor_metadatum.associationIds){
      $scope.fetchMetadata("{'uuid':{'$in':['"+$scope.data_descriptor_metadatum.associationIds.join("','")+"']}}");
    }
  };


  $scope.getFiles = function () {
    $scope.people.length = 0;
    //$scope.fetchMetadata("{$and:[{'name':{'$in':['PublishedFile','File']}},{'associationIds':'" + $stateParams.uuid + "'}]}");
    $scope.fetchMetadata("{$and:[{'name':{'$in':['PublishedFile','File']}},{'associationIds':'" + $scope.ddUuid + "'}]}");
  };

  //$scope.getSubjects = function(){
  //    $scope.subjects.length = 0;
  //    $scope.fetchMetadataWithLimit("{'name':'Subject'}", 300);
  //};

  $scope.getOrgs = function () {
    $scope.orgs.length = 0;
    $scope.fetchMetadata("{'name':'Organization'}");
  };

  $scope.fetchMetadata = function (metadata_query) {
    $scope.fetchMetadataWithLimit(metadata_query, 100);
  }

  $scope.fetchMetadataWithLimit = function (metadata_query, limit) {
    console.log("JEN DDC: fetchMetadataWithLimit: " + metadata_query);
    var deferred = $q.defer();
    deferred.resolve(MetaController.listMetadata(metadata_query, limit, 0).then(
      function (response) {
        $scope.totalItems = response.result.length;
        $scope.pagesTotal = Math.ceil(response.result.length / $scope.limit);
        //$scope[$scope._COLLECTION_NAME] = response.result;
        $scope.filemetadata = response.result;
        
        $scope.makeLocationMarkers($scope.filemetadata);
        angular.forEach($scope[$scope._COLLECTION_NAME], function (value, key) {
          if (value.name === 'DataDescriptor') {
            $scope.has_data_descriptor = true;
            $scope.data_descriptor_metadatum = value;
            $scope.getAssociations() 
            if ($scope.action && $scope.action === "edit") {
              $scope.editDataDescriptor();
            }
          } else if (value.name === 'Person') {
            $scope.people.push(value.value);
            $scope.people[$scope.people.length - 1]["uuid"] = value.uuid;
          } else if (value.name === 'Organization') {
            $scope.orgs.push(value.value);
            $scope.orgs[$scope.orgs.length - 1]["uuid"] = value.uuid;
          } else if (value.name === 'File') {
            $scope.orgs.push(value.value);
            $scope.orgs[$scope.orgs.length - 1]["uuid"] = value.uuid;
          }
          else if (value.name === 'Well' || value.name ==='Site') {
            console.log('stuff')
            if( $scope.locations.indexOf(value) < 0){
              $scope.locations.push(value);
            }
          }
          else if (value.name === 'Variable') {
            if($scope.variables.indexOf(value) < 0){
              $scope.variables.push(value);
            }
          }
          
          //else if(value.name === 'Subject'){
          //    $scope.subjects.push(value.value);
          //    $scope.subjects[$scope.subjects.length-1]["uuid"] = value.uuid;
          //}
          
        });
        $scope.requesting = false;
        console.log("Locations count: " + $scope.locations.length)
      },
      function (response) {
        MessageService.handle(response, $translate.instant('error_filemetadata_list'));
        $scope.requesting = false;
      }
    ));
    return deferred.promise;
  };

  $scope.searchTools = function (query) {
    $scope.query = query;
    $scope.fetchModalMetadata()
    //$scope.refresh();
  }

  // metadatumUuid is really dataDescriptorUuid, but since I'm modifying
  // an old method and don't want a bunch of arbitrary changes to show 
  // during a comparison, I just do an assignment on the first line.
  $scope.addClone = function (dataDescriptorUuid, fileUuid) {
    console.log("JEN DDC: addClone: " + dataDescriptorUuid);
    metadatumUuid = dataDescriptorUuid;
    if (metadatumUuid) {
      $scope.requesting = true;
      MetaController.getMetadata(metadatumUuid)
        .then(function (response) {
          $scope.metadatum = response.result;
          var body = {};
          body.name = $scope.metadatum.name;
          body.value = $scope.metadatum.value;
          body.schemaId = $scope.metadatum.schemaId;
          if($stateParams.fileUuids){
            body.associationIds = $stateParams.fileUuids
          }
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
                //$state.go('datadescriptor', {
                //  uuid: $scope.new_metadataUuid,
                //  "action": "edit"
                //});
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

  $scope.refresh();

  $rootScope.$on("metadataUpdated", function () {
    console.log("JEN DDC: on metadataUpdated");
    $scope.refreshMetadata();
    $scope.refresh();
  });

  $rootScope.$on("metadataPersonOrgOrSubjectUpdated", function (event, args) {
    console.log("JEN DDC: metadataPersonOrgOrSubjectUpdated");
    $scope.requesting = false;
    if (args.type === "Person") {
      var str = {
        "first_name": args.value.value.first_name,
        "last_name": args.value.value.last_name,
        "uuid": args.value.uuid
      };
      // this person is a contributor, not a creator
      if ($scope.isContrib) {
        $scope.datadescriptor.contributors.push(str);
      }
      // this person is a creator
      else {
        $scope.datadescriptor.creators.push(str);
      }
    } else if (args.type === "Organization") {
      var str = {
        "name": args.value.value.name,
        "uuid": args.value.uuid
      };
      $scope.datadescriptor.organizations.push(str);
    } else if (args.type === "File") {
      var str = {
        "name": args.value.value.name,
        "uuid": args.value.uuid
      };
      $scope.datadescriptor.files.push(str);
    }
    //else if (args.type === "Subject") {
    //  var str = {"name":args.value.value.word,"uuid":args.value.uuid};
    //  $scope.datadescriptor.subjects.push(str);
    //}
    //$scope.refresh();
    $rootScope.$broadcast('metadataUpdated');
  });

  $rootScope.$on("associationsUpdated", function () {
    console.log("JEN DDC: on associationsUpdated");
    $scope.refreshMetadata()
    App.alert({
      message: $translate.instant('success_metadata_assocation_removed'),
      closeInSeconds: 5
    });
  });

  $rootScope.$on("associationRemoved", function () {
    console.log("JEN DDC: on associationRemoved");
    $scope.refreshMetadata().then(
      $timeout(function () {
        App.alert({
          container: '#association_notifications',
          message: "Assocation Successfully Removed",
          closeInSeconds: 5
        })
      }, 500)
    )
  });

  $scope.confirmAction = function (resourceType, resource, resourceAction, resourceList, resourceIndex) {
    ActionsService.confirmAction(resourceType, resource, resourceAction, resourceList, resourceIndex);
  }



  $scope.unAssociateMetadata = function (metadatumUuid, container_id = "") {
    console.log("JEN DDC: unAssociateMetadata");
    $scope.requesting = true;
    $scope.class[metadatumUuid] = "btn-warning"
    var unAssociate = $window.confirm('Are you sure you want to remove the metadata/file association?');
    //$scope.confirmAction(metadatum.name, metadatum, 'delete', $scope[$scope._COLLECTION_NAME])
    $scope.dd_object = [$scope.data_descriptor_metadatum]
    if (unAssociate) {
      FilesMetadataService.removeAssociations($scope.dd_object, metadatumUuid).then(function (result) {
        App.alert({
          type: 'info',
          container: container_id,
          message: 'Removing Association',
          icon: 'fa fa-spinner fa-spin',
          place: ''
        })
        //App.alert({message: $translate.instant('success_metadata_assocation_removed'),closeInSeconds: 5  });
        $scope.metadatum = null;
        $timeout(function () {
          //$scope.refresh()
          $scope.refreshMetadata();
          $scope.matchingAssociationIds.splice($scope.matchingAssociationIds.indexOf(metadatumUuid))
          $scope.removedAssociationIds.push(metadatumUuid)
        }, 500);
        $scope.requesting = false;
      });
    } else {
      $scope.requesting = false;
    }
  }

  $scope.confirmAction = function (resourceType, resource, resourceAction, resourceList, resourceIndex) {
    ActionsService.confirmAction(resourceType, resource, resourceAction, resourceList, resourceIndex);
  }

  $scope.confirmRemove = function (metadatum) {
    $scope.confirmAction(metadatum.name, metadatum, 'delete', $scope[$scope._COLLECTION_NAME])
  }

//THe save
  $scope.saveDataDescriptor = function () {
    console.log("JEN DDC: saveDataDescriptor: " + $scope.datadescriptor.uuid);
    //$scope.cancelEditDataDescriptor();
    $scope.requesting = true;
    $scope.$broadcast('schemaFormValidate');
    if ($scope.datadescriptor.creators.length > 0 && $scope.datadescriptor.title &&
      $scope.datadescriptor.license_permission && $scope.datadescriptor.license_rights) {
      // Then we check if the form is valid
      //	if (form.$valid) {
      MetadataService.fetchSystemMetadataSchemaUuid('DataDescriptor')
        .then(function (response) {
          var body = {};
          body.name = "DataDescriptor";
          body.value = $scope.datadescriptor;
          body.schemaId = response;
          if($stateParams.fileUuids){
            body.associationIds = $stateParams.fileUuids
          }

          MetaController.addMetadata(body)
            .then(
              function (response) {
                $scope.metadataUuid = response.result.uuid;
                $scope.ddUuid = $scope.metadataUuid;
                //add the default permissions for the system in addition to the owners
                MetadataService.addDefaultPermissions($scope.metadataUuid);
                if ($scope.fileUuid && $scope.fileUuid != undefined) {
                  $scope.addAssociation($scope.metadataUuid, $scope.fileUuid)
                }
                $scope.cancelEditDataDescriptor();
                // JEN TODO: need to add a mechanism to loop through all the files and add the association.
                App.alert({
                  message: "Success Data Descriptor Saved",
                  closeInSeconds: 5
                });
                $rootScope.$broadcast('metadataUpdated');
              },
              function (response) {
                MessageService.handle(response, $translate.instant('error_metadata_add'));
                $scope.requesting = false;
              }
            );
          //}
          //else{
          $scope.requesting = false;
          //}
        })
    } else {
      $scope.requesting = false;
      App.alert({
        type: 'danger',
        message: "Creator, Title, License Rights and License Permissions are Required Fields - Please Correct and Submit Again.",
        closeInSeconds: 5
      });
    }
  }

  $scope.updateDataDescriptor = function () {
    console.log("JEN DDC: updateDataDescriptor");
    $scope.requesting = true;
    $scope.$broadcast('schemaFormValidate');

    if ($scope.datadescriptor.creators.length > 0 && $scope.datadescriptor.creators != '' &&
      $scope.datadescriptor.title && $scope.datadescriptor.license_permission &&
      $scope.datadescriptor.license_rights) {

      // Then we check if the form is valid
      //	if (form.$valid) {
      MetadataService.fetchSystemMetadataSchemaUuid('DataDescriptor')
        .then(function (response) {
          var body = {};
          body.name = $scope.data_descriptor_metadatum.name;
          body.value = $scope.datadescriptor;
          body.schemaId = $scope.data_descriptor_metadatum.schemaId;
          MetaController.updateMetadata(body, $scope.data_descriptor_metadatum.uuid)
            .then(
              function (response) {
                $scope.metadataUuid = response.result.uuid;
                App.alert({
                  message: "Success Data Descriptor Saved",
                  closeInSeconds: 5
                });
                $rootScope.$broadcast('metadataUpdated');
                $scope.cancelEditDataDescriptor();
              },
              function (response) {
                MessageService.handle(response, $translate.instant('error_metadata_add'));
                $scope.requesting = false;
              }
            );
          //}
          //else{
          //	$scope.requesting = false;
          //}
        })
    } else {
      $scope.requesting = false;
      App.alert({
        type: 'danger',
        message: "Creator, Title, License Rights, and License Permissions are required fields - Please correct and submit again.",
        closeInSeconds: 5
      });
    }
  }

  $scope.animationsEnabled = true;

  $scope.editDataDescriptor = function () {
    console.log("JEN DDC: editDataDescriptor");
    $scope.datadescriptor = $scope.data_descriptor_metadatum.value;
    $scope.edit_data_descriptor = true;
  }

  $scope.cancelEditDataDescriptor = function () {
    console.log("JEN DDC: cancelEditDataDescriptor");
    $scope.edit_data_descriptor = false;
    $scope.action = "view";
    $scope.refreshMetadata();
  }

  $scope.doTheBack = function () {
    window.history.back();
  };
  /////////Modal Stuff/////////////////////
  $scope.fetchMoreModalMetadata = function () {
    console.log("JEN DDC: fetchMoreModalMetadata");
    $scope.offset = $scope.offset + $scope.limit
    $scope.requesting = true
    MetaController.listMetadata(
        $scope.query, $scope.limit, $scope.offset
      )
      .then(
        function (response) {
          //$scope.metadata = angular.extend($scope.metadata,response.result);
          //$scope.newmetadata. = Object.assign({},$scope.metadata, response.result);
          if (response.result.length == $scope.limit) {
            $scope.can_fetch_more = true;
          } else {
            $scope.can_fetch_more = false;
          }
          $scope.metadata = $scope.metadata.concat(response.result)
          $scope.requesting = false;
        },
        function (response) {
          MessageService.handle(response, $translate.instant('error_metadata_list'));
          $scope.requesting = false;
        }
      );
  }
  $scope.fetchModalMetadata = function (query) {
    console.log("JEN DDC: fetchModalMetadata");
    $scope.can_fetch_more = false;
    MetaController.listMetadata(
        $scope.query, $scope.limit, $scope.offset
      )
      .then(
        function (response) {
          $scope.metadata = response.result;
          if ($scope.metadata.length == $scope.limit) {
            $scope.can_fetch_more = true;
          }
          $scope.requesting = false;
        },
        function (response) {
          MessageService.handle(response, $translate.instant('error_metadata_list'));
          $scope.requesting = false;
        }
      );

  }
  
  $scope.addAssociationToDataDescriptor = function (dataDescriptorUuid, metadatumUuid, container_id = "") {
    //alert('trying to associate')
    //metadatumUuid = dataDescriptorUuid;
    console.log("JEN DDC: addAssociation");
    if (metadatumUuid) {
      $scope.requesting = true;
      MetaController.getMetadata(dataDescriptorUuid)
        .then(function (response) {
          $scope.dataDescriptor = response.result;
          //alert(dataDescriptor)
          var body = {};
          body.associationIds = $scope.dataDescriptor.associationIds;
          //check if fileUuid is already associated
          if (body.associationIds.indexOf(metadatumUuid) < 0) {
            body.associationIds.push(metadatumUuid);
            body.name = $scope.dataDescriptor.name;
            body.value = $scope.dataDescriptor.value;
            body.schemaId = $scope.dataDescriptor.schemaId;
            MetaController.updateMetadata(body, dataDescriptorUuid)
              .then(
                function (response) {
                  // decided not to show the metadata name in the error message as it would require that to be passed in, or another call
                  App.alert({
                    container: container_id,
                    message: $translate.instant('success_metadata_add_assocation'),
                    closeInSeconds: 5
                  });
                  $scope.requesting = false;

                  //$scope.fetchMetadata("{'uuid':{$in: ['"+body.associationIds.join("','")+"']}}")
                  $scope.refreshMetadata();
                  $scope.matchingAssociationIds.push(metadatumUuid)
                  $scope.removedAssociationIds.splice($scope.removedAssociationIds.indexOf(metadatumUuid))
                  //$state.go('metadata',{id: $scope.metadataUuid});
                },
                function (response) {
                  MessageService.handle(response, $translate.instant('error_metadata_add_assocation'));
                  $scope.requesting = false;
                }
              )
          } else {
            App.alert({
              type: 'danger',
              message: $translate.instant('error_metadata_add_assocation_exists'),
              closeInSeconds: 5
            });
            return
          }
        })
    } else {
      MessageService.handle(schema_response, $translate.instant('error_metadataschemas_get'));
    }
    $scope.requesting = false;
  }

  //make and association btwn the current datadescriptor
  //object and the given file.
  //accepts the current datadescriptor uuid 
  //accepts a file uuid to get the dd uuid association
  //accepts a container id to display a message app alert
  // metadatumUuid is really dataDescriptorUuid, but since I'm modifying
  // an old method and don't want a bunch of arbitrary changes to show 
  // during a comparison, I just do an assignment on the first line.
  $scope.addAssociation = function (dataDescriptorUuid, fileUuid, container_id = "") {
    metadatumUuid = dataDescriptorUuid;
    console.log("JEN DDC: addAssociation");
    if (metadatumUuid) {
      $scope.requesting = true;
      MetaController.getMetadata(fileUuid)
        .then(function (response) {
          $scope.metadatum = response.result;
          var body = {};
          body.associationIds = $scope.metadatum.associationIds;
          //check if fileUuid is already associated
          if (body.associationIds.indexOf(metadatumUuid) < 0) {
            body.associationIds.push(metadatumUuid);
            body.name = $scope.metadatum.name;
            body.value = $scope.metadatum.value;
            body.schemaId = $scope.metadatum.schemaId;
            MetaController.updateMetadata(body, fileUuid)
              .then(
                function (response) {
                  // decided not to show the metadata name in the error message as it would require that to be passed in, or another call
                  App.alert({
                    container: container_id,
                    message: $translate.instant('success_metadata_add_assocation'),
                    closeInSeconds: 5
                  });
                  $scope.requesting = false;

                  //$scope.fetchMetadata("{'uuid':{$in: ['"+body.associationIds.join("','")+"']}}")
                  $scope.refreshMetadata();
                  $scope.matchingAssociationIds.push(metadatumUuid)
                  $scope.removedAssociationIds.splice($scope.removedAssociationIds.indexOf(metadatumUuid))
                  //$state.go('metadata',{id: $scope.metadataUuid});
                },
                function (response) {
                  MessageService.handle(response, $translate.instant('error_metadata_add_assocation'));
                  $scope.requesting = false;
                }
              )
          } else {
            App.alert({
              type: 'danger',
              message: $translate.instant('error_metadata_add_assocation_exists'),
              closeInSeconds: 5
            });
            return
          }
        })
    } else {
      MessageService.handle(schema_response, $translate.instant('error_metadataschemas_get'));
    }
    $scope.requesting = false;
  }

  /*
          $scope.addAssociation = function(metadatumUuid,container_id="") {
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
    */

  $scope.locFilter = function (item) {
    if (item.name === 'Well' || item.name === 'Site') {
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
    });
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
    });
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
    });
  };

  $scope.openCreateType = function (size, schemaType, isContrib = false) {
    $scope.requesting = true;
    // get the uuid for the schema
    var typeString = "{'schema.title':'" + schemaType + "'}";
    MetadataService.fetchSystemMetadataSchemaUuid(schemaType)
      .then(function (response) {
        var uuid = response;
        //console.log("uuid: " + uuid);
        $scope.isContrib = isContrib;
        $scope.openCreate(uuid, size);
      });
    $scope.requesting = false;
  };

  // open the modal to create a new person schema object
  $scope.openCreatePerson = function (size) {
    $scope.openCreateType(size, "Person");
  };

  $scope.openCreateContribPerson = function (size) {
    $scope.openCreateType(size, "Person", true);
  };

  // open the modal to create a new organization schema object
  $scope.openCreateOrg = function (size) {
    $scope.openCreateType(size, "Organization");
  };

  // NOTE: This is NOT used to create a data descriptor, it's used for 
  // other, generic objects, like person or organization
  // JEN TODO: can this work?  Now if I associate a person or org with a data
  // descriptor, I have to edit every file associated with it, too.  Shit.
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
    });
  };

  ///////Assoc modal search////////
  $scope.schemaBox = {
    val1: true,
    val2: true
  };
  $scope.wellbox = true;
  $scope.searchField = {
    value: ''
  }
  $scope.searchAll = function () {
    $scope.requesting = true;
    var orquery = {}
    var andquery = {}
    var queryarray = []
    var andarray = []
    var innerquery = {}
    var typearray = []
    var typequery = {}

    angular.forEach($scope.metadataschema, function (value, key) {
      if ($scope.selectedSchema.indexOf(value.schema.title) > -1) {
        //set the schema name(s) to search across
        typearray.push(value.schema.title);
        //add schema properties to search across
        if ($scope.searchField.value != '') {
          angular.forEach(value.schema.properties, function (val, key) {
            var valquery = {}
            valquery['value.' + key] = {
              $regex: $scope.searchField.value,
              '$options': 'i'
            }
            queryarray.push(valquery)
          })
          orquery['$or'] = queryarray;
        }
      }
    })
    typequery['name'] = {
      '$in': typearray
    }
    andarray.push(typequery)
    andarray.push(orquery)
    andquery['$and'] = andarray;
    $scope.query = JSON.stringify(andquery);

    $scope.offset = 0;
    $scope.fetchModalMetadata();
  }

  // Toggle selection for a given fruit by name
  $scope.toggleSelectedSchema = function (title) {
    var idx = $scope.selectedSchema.indexOf(title);

    // Is currently selected
    if (idx > -1) {
      //alert($scope.selectedSchema.length )
      if ($scope.selectedSchema.length >= 2) {
        $scope.selectedSchema.splice(idx, 1);
      } else {
        jQuery('#' + title + '_box').prop("checked", true);
      }
    }

    // Is newly selected
    else {
      $scope.selectedSchema.push(title);
    }
    $scope.modalSchemas = $scope.modalSchemas
  };

}).controller('ModalAssociateMetadatCtrl', function ($scope, $modalInstance, MetaController) {
  $scope.cancel = function () {
    $modalInstance.close();
  };

  $scope.fetchModalMetadata = function () {
    MetaController.listMetadata(
        $scope.query, $scope.limit, $scope.offset
      )
      .then(
        function (response) {
          $scope.metadata = response.result;
          $scope.requesting = false;
        },
        function (response) {
          MessageService.handle(response, $translate.instant('error_metadata_list'));
          $scope.requesting = false;
        }
      );

  }
});