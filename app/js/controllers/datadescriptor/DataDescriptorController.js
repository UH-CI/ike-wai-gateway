angular.module('AgaveToGo').controller('DataDescriptorController', function ($scope, $filter, $state, $stateParams, $translate, $timeout, $window, $localStorage, $modalInstance, $uibModal, $rootScope, $q, MetaController, FilesController, FilesMetadataService, ActionsService, MessageService, MetadataService, leafletDrawEvents,leafletData) {
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
  $scope.approvedSchema = ['DataDescriptor', 'Well', 'Site', 'Water_Quality_Site', 'Person', 'Organization', 'Location', 'Subject', 'Variable', 'Tag', 'File'];
  $scope.modalSchemas = [''];
  $scope.selectedSchema = [''];
  $scope.matchingAssociationIds = [''];
  $scope.removedAssociationIds = [''];
  $scope.limit = 500;
  $scope.offset = 0;
  // used to show the right things on the first/second pages of the data descriptor create modal
  $scope.wizardSecondPage = false;
  // used to show/hide the hawaiian language newspaper translations section on the data descriptor edit view.
  $scope.hawaiian = false;

  //set admin
  $scope.get_editors = function () {
    $scope.editors = MetadataService.getAdmins();
    $scope.edit_perm = $scope.editors.indexOf($scope.profile.username) > -1;
  }
  $scope.get_editors();
  //$scope.action = $stateParams.action;

  $scope.query = "{'name':{$in:['Well','Site','Water_Quality_Site','Person','Organization','Location','Subject','Variable','Tag','File']}}";
  $scope.schemaQuery = "";//{'schema.title':{'$in': ['" + $scope.approvedSchema.join("','") +"'] }}"
  //$scope.schemaQuery = ''; //"{'owner':'seanbc'}";
  //$scope.subjects = ['Wells', 'SGD', 'Bacteria'];

  $scope.data_state = '';
  $scope.sensitive = '';
  $scope.people = [];
  $scope.translators = [];
  $scope.newspapers = [];
  $scope.articleAuthors = [];
  $scope.orgs = [];
  $scope.subjects = [];
  $scope.locations = [];
  $scope.variables = [];
  //$scope.ddUuid = $stateParams.uuid;
  $scope.ddUuid = $scope.uuid;

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

  $scope.data_types = [
    "Figure - figures, images",
    "Map",
    "Media - videos, audio",
    "Dataset - tables, statistics",
    "Fileset - Multiple associated files",
    "Poster - illustrations, diagrams",
    "Paper - publication documents",
    "Preprint - pre-peer review papers",
    "Presentation - Slides",
    "Thesis - essays, dissertations",
    "Code - scripts, binaries",
    "Books - monograph, books"
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
  $scope.datadescriptor.data_state = '';
  $scope.datadescriptor.sensitive = '';
  $scope.datadescriptor.organizations = [];
  $scope.datadescriptor.creators = [];
  $scope.datadescriptor.articleAuthors = [];
  $scope.datadescriptor.newspapers = [];
  $scope.datadescriptor.translators = [];
  $scope.datadescriptor.files = [];
  //$scope.datadescriptor.subjects = [];
  $scope.datadescriptor.contributors = [];
  $scope.edit_data_descriptor = false;
  $scope.data_descriptor_order = ['title','creators', 'organizations','subjects', 'start_datetime', 'end_datetime', 'data_state', 'sensitive', 'data_types', 'formats',  'description', 'newspapers', 'articleAuthors', 'translators']
  $scope.data_descriptor_display = ['Title','Author(s)', 'Organization(s)','Subjects/Keywords/Search Terms', 'Data Collection Start Date', 'Data Collection End Date', 'Data State', 'Sensitivity', 'Data Type(s)', 'Format(s)',  'Summary', 'Newspaper Article Source','Newspaper Article Authors','Newspaper Article Translators']

  $scope.datadescriptor.license_permission = "public";
  $scope.datadescriptor.title = "";
  $scope.datadescriptor.license_rights = "Creative Commons Attribution CC BY";

  $scope.data_descriptor
  $scope.class = [];

  $scope.refreshMetadata = function () {
    //console.log("JEN DDC: refreshMetadata: stateparam uuid:'" + $stateParams.uuid);
    //console.log("JEN DDC: refreshMetadata: scope uuid:" + $scope.ddUuid);
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
    $scope.waterQualitySiteMarkers = $filter('filter')(metadata, {
      name: "Water_Quality_Site"
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
    
    angular.forEach($scope.waterQualitySiteMarkers, function (datum) {
      if (datum.value.loc != undefined) {
        $scope.marks[datum.uuid.replace(/-/g, "")] = {
          lat: parseFloat(datum.value.latitude),
          lng: parseFloat(datum.value.longitude),
          message: "Water Quality Site Name: " + datum.value.name + "<br/>" + "Description: " + datum.value.description + "<br/>" + "Latitude: " + datum.value.latitude + "<br/>" + "Longitude: " + datum.value.longitude,
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

  //
  // START of methods to export a data descriptor to a text file
  //
  $scope.exportGeneralData = function (a, header, newline, indent) {
    exportContent = '';
    if (a.length > 0) {
      exportContent += header + newline;
      for (var i in a) {
        exportContent += indent + a[i] + newline;
      }
    }
    //console.log(header + exportContent);
    return exportContent;
  };

  $scope.exportPersonData = function (a, header, newline, indent) {
    exportContent = '';
    if (a.length > 0) {
      exportContent += header + newline;
      for (var i in a) {
        p = a[i];
        name = p.first_name + " " + p.last_name;
        email = p.email;
        org = p.organization;
        phone = p.phone;
        exportContent += indent + "Name: " + name + newline;
        exportContent += indent + "Email: " + email + newline;
        exportContent += indent + "Organization: " + org + newline;
        exportContent += indent + "Phone: " + phone + newline;
      }
    }
    //console.log(header + exportContent);
    return exportContent;
  };

  $scope.exportFileData = function (a, header, newline, indent) {
    exportContent = '';
    if (a.length > 0) {
      exportContent += header + newline;
      for (var i in a) {
        item = a[i];
        if (item.title == 'file') {
          link = item.href;
          console.log("link: " + link);
          exportContent += indent + link.split('system')[1] + newline;
        }
      }
    }
    //console.log(header + exportContent);
    return exportContent;
  };

  $scope.exportVariablesAndLocations = function (varArray, header, subHeader, newline, indent) {
    exportContent = '';
    extraIndent = "  ";
    var index = 0;
    if (varArray.length > 0) {
      exportContent += header + newline;
      // get a variable or location
      for (var i in varArray) {
        index = index + 1;
        variable = varArray[i];
        exportContent += extraIndent + subHeader + " " + index + ": " + newline;
        // loop through the variable/location's properties
        for (var v in variable.value) {
          str = v + ": " + variable.value[v];
          console.log(str);
          exportContent += extraIndent + indent + str + newline;
        }
      }
    }
    //console.log(header + exportContent);
    return exportContent;
  };

  $scope.exportBasicData = function (val, header, newline, indent) {
    exportContent = '';
    if (typeof val !== 'undefined') {
      exportContent += header + val + newline;
    }
    //console.log(header + exportContent);
    return exportContent;
  };

  $scope.exportDataDescriptor = function () {
    //$scope.fetchMetadata("{'uuid':'" + $scope.ddUuid + "'}");
    exportContent = '';
    //dataDelimiter = "";
    newline = "\n";
    indent = "  ";

    exportContent += $scope.exportBasicData($scope.data_descriptor_metadatum.value["title"], "Title: ", newline, indent);
    exportContent += $scope.exportPersonData($scope.data_descriptor_metadatum.value.creators, "Creators: ", newline, indent);
    exportContent += $scope.exportGeneralData($scope.datadescriptor.organizations, "Organizations: ", newline, indent);
    exportContent += $scope.exportBasicData($scope.data_descriptor_metadatum.value["subjects"], "Subjects: ", newline, indent);
    exportContent += $scope.exportBasicData($scope.data_descriptor_metadatum.value["start_datetime"], "Start Data/Time: ", newline, indent);
    exportContent += $scope.exportBasicData($scope.data_descriptor_metadatum.value["end_datetime"], "End Data/Time: ", newline, indent);
    exportContent += $scope.exportBasicData($scope.data_descriptor_metadatum.value["data_state"], "Data State: ", newline, indent);
    exportContent += $scope.exportBasicData($scope.data_descriptor_metadatum.value["sensitive"], "Sensitivity: ", newline, indent);
    exportContent += $scope.exportBasicData($scope.data_descriptor_metadatum.value["data_types"], "Data Types: ", newline, indent);
    exportContent += $scope.exportBasicData($scope.data_descriptor_metadatum.value["formats"], "Formats: ", newline, indent);
    exportContent += $scope.exportBasicData($scope.data_descriptor_metadatum.value["Description"], "Description: ", newline, indent);
    exportContent += $scope.exportFileData($scope.data_descriptor_metadatum._links.associationIds, "Associated Files: ", newline, indent);
    exportContent += $scope.exportPersonData($scope.data_descriptor_metadatum.value.contributors, "Contributors: ", newline, indent);
    exportContent += $scope.exportGeneralData($scope.datadescriptor.newspapers, "Newspapers: ", newline, indent);
    exportContent += $scope.exportPersonData($scope.datadescriptor.articleAuthors, "Article Authors: ", newline, indent);
    exportContent += $scope.exportPersonData($scope.datadescriptor.translators, "Translators: ", newline, indent);
    exportContent += $scope.exportVariablesAndLocations($scope.variables, "Variables: ", "Variable", newline, indent);
    exportContent += $scope.exportVariablesAndLocations($scope.locations, "Locations: ", "Location", newline, indent);

    console.log(exportContent);
 
    // START download data to file
    // from: https://stackoverflow.com/questions/38462894/how-to-create-and-save-file-to-local-filesystem-using-angularjs
    var filename = 'MetadataExport' + '.txt';
    var blob = new Blob([exportContent], {type: 'text/plain'});
    if (window.navigator && window.navigator.msSaveOrOpenBlob) {
      window.navigator.msSaveOrOpenBlob(blob, filename);
    } else{
      var e = document.createEvent('MouseEvents'),
      a = document.createElement('a');
      a.download = filename;
      a.href = window.URL.createObjectURL(blob);
      a.dataset.downloadurl = ['text/plain', a.download, a.href].join(':');
      e.initEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
      a.dispatchEvent(e);
      // window.URL.revokeObjectURL(a.href); // clean the url.createObjectURL resource
    }
  };
  //
  // END of methods to export a data descriptor to a text file
  //

  $scope.download = function(file_url){
    $scope.requesting = true;
    FilesMetadataService.downloadSelected(file_url).then(function(result){
      $scope.requesting = false;
    });
  }

  $scope.cancelEditDataDescriptor = function () {
    console.log("JEN DDC: cancelEditDataDescriptor");
    $scope.edit_data_descriptor = false;
    $scope.action = "view";
    //$scope.refreshMetadata();
    //$rootScope.$broadcast('metadataUpdated');
    //$scope.close();
  }

  $scope.cancelEditDataDescriptorWithBroadcast = function () {
    console.log("JEN DDC: cancelEditDataDescriptorWithBroadcast");
    $scope.edit_data_descriptor = false;
    $scope.action = "view";
    //$scope.refreshMetadata();
    $rootScope.$broadcast('metadataUpdated');
    //$scope.close();
  }

  $scope.close = function () {
    console.log("JEN DDC: close");
    $scope.cancelEditDataDescriptor();
    $modalInstance.close();
    $uibModal.close;
    $scope.refresh();
	};


  $scope.refresh = function () {
    console.log("JEN DDC: refresh: action = " + $scope.action);
    if ($stateParams.uuid != undefined) {
      $scope.ddUuid = $stateParams.uuid;
    }
    // stateParams.action, if provided, overrules scope.action,
    // but if not provided, leave scope.action alone
    if ($stateParams.action != undefined) {
      $scope.action = $stateParams.action;
    }
    //console.log("JEN DDC: refresh: action = " + $scope.action + ", stateparam uuid:" + $stateParams.uuid);
    //console.log("JEN DDC: refresh: action = " + $scope.action + ", scope uuid:" + $scope.ddUuid);

    $scope.continue = true;

    if ($scope.action === "create") {
      $scope.ddUuid = "";
      $scope.action = "edit";
    }
    else if ($scope.action === "clone") {
      $scope.continue = false;
      $scope.action = "edit";
      //$modalInstance.close();
      //$scope.close();
      //$scope.addClone($stateParams.uuid);
      $scope.addClone($scope.ddUuid);
    }

    if ($scope.continue) {
      console.log("Jen DDC continue in refresh");
      $scope.requesting = true;
      $scope.people.length = 0;
      $scope.newspapers.length = 0;
      $scope.articleAuthors.length = 0;
      $scope.translators.length = 0;
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
      $scope.getNewspapers();
      $scope.getArticleAuthors();
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
      
    }
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
    $scope.translators.length = 0;
    $scope.fetchMetadata("{'name':'Person'}");
  };

  $scope.getNewspapers = function () {
    $scope.newspapers.length = 0;
    $scope.fetchMetadata("{'name':'Newspaper'}");
  };

  $scope.getArticleAuthors = function () {
    $scope.articleAuthors.length = 0;
    $scope.fetchMetadata("{'name':'Author'}");
  };

  $scope.getAssociations = function () {
    $scope.locations = [];
    $scope.variables = [];
    //console.log('getAssociations')
    if ($scope.data_descriptor_metadatum.associationIds){
      $scope.fetchMetadata("{'uuid':{'$in':['"+$scope.data_descriptor_metadatum.associationIds.join("','")+"']}}");
    }
  };


  $scope.getFiles = function () {
    // JEN: TODO: this likely shouldn't be people, what should it be?
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
    //console.log("JEN DDC: fetchMetadataWithLimit: " + metadata_query);
    var deferred = $q.defer();
    $scope.variables = [];
    $scope.locations = [];
    deferred.resolve(MetaController.listMetadata(metadata_query, limit, 0).then(
      function (response) {
        $scope.variables = [];
        $scope.locations = [];
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
            $scope.translators.push(value.value);
            $scope.translators[$scope.translators.length - 1]["uuid"] = value.uuid;
          } else if (value.name === 'Newspaper') {
            $scope.newspapers.push(value.value);
            $scope.newspapers[$scope.newspapers.length - 1]["uuid"] = value.uuid;
          } else if (value.name === 'Author') {
            $scope.articleAuthors.push(value.value);
            $scope.articleAuthors[$scope.articleAuthors.length - 1]["uuid"] = value.uuid;
          } else if (value.name === 'Organization') {
            $scope.orgs.push(value.value);
            $scope.orgs[$scope.orgs.length - 1]["uuid"] = value.uuid;
          } else if (value.name === 'File') {
            // JEN: TODO: this likely shouldn't be org, what should it be?
            $scope.orgs.push(value.value);
            $scope.orgs[$scope.orgs.length - 1]["uuid"] = value.uuid;
          }
          else if (value.name === 'Well' || value.name === 'Site' || value.name === 'Water_Quality_Site') {
            //console.log('stuff')
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
        leafletData.getMap("datadescriptorMap").then(function(map) {
          setTimeout(function() {
            map.invalidateSize();
          }, 0.1 * 1000);
            
        })
        $scope.requesting = false;
        //console.log("Locations count: " + $scope.locations.length)
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
    console.log("JEN DDC: addClone from dd: " + dataDescriptorUuid);
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
                //$modalInstance.close();
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
                console.log("clone made, new dd: " + $scope.new_metadataUuid);
                $scope.uuid = $scope.new_metadataUuid;
                $scope.ddUuid = $scope.new_metadataUuid;
                $scope.action = "close-clone";
                $scope.close();
                //$state.go('datadescriptor', {
                //  uuid: $scope.new_metadataUuid,
                //  "action": "edit"
                //});

                //$scope.openEditDataDescriptor($scope.new_metadataUuid,'lg');

              },
              function (response) {
                MessageService.handle(response, $translate.instant('error_metadata_add'));
                $scope.requesting = false;
              }
            )
        })
    } else {
      App.alert({
        type: 'danger',
        message: $translate.instant('Error access existing Data Descritpor!'),
        closeInSeconds: 5
      });
    }
    //$scope.close();
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
      // don't actually want to do association yet until 
      // user clicks "save", just want to display it.
      //$scope.addAssociationToDataDescriptor($scope.ddUuid, args.value.uuid);
    } else if (args.type === "Author") {
      var str = {
        "name": args.value.value.name,
        "pen_name": args.value.value.pen_name,
        "uuid": args.value.uuid
      };
      $scope.datadescriptor.articleAuthors.push(str);
    } else if (args.type === "Newspaper") {
      var str = {
        "name": args.value.value.name,
        //"volume": args.value.value.volume,
        //"number": args.value.value.number,
        //"page": args.value.value.page,
        //"column": args.value.value.column,
        "uuid": args.value.uuid
      };
      $scope.datadescriptor.newspapers.push(str);
    } else if (args.type === "Translator") {
      var str = {
        "first_name": args.value.value.first_name,
        "last_name": args.value.value.last_name,
        "uuid": args.value.uuid
      };
      $scope.datadescriptor.translators.push(str);
    } else if (args.type === "Organization") {
      var str = {
        "name": args.value.value.name,
        "uuid": args.value.uuid
      };
      $scope.datadescriptor.organizations.push(str);
      // don't actually want to do association yet until 
      // user clicks "save", just want to display it.
      //$scope.addAssociationToDataDescriptor($scope.ddUuid, args.value.uuid);
    } else if (args.type === "File") {
      var str = {
        "name": args.value.value.name,
        "uuid": args.value.uuid
      };
      $scope.datadescriptor.files.push(str);
      // don't actually want to do association yet until 
      // user clicks "save", just want to display it.
      //$scope.addAssociation($scope.ddUuid, args.value.uuid)
    }
    //else if (args.type === "Subject") {
    //  var str = {"name":args.value.value.word,"uuid":args.value.uuid};
    //  $scope.datadescriptor.subjects.push(str);
    //}
    //$scope.refresh();

    // if I call this, it wipes out the above changes as they are only displayed on the form,
    // but not actually associated yet as the user has to click "save"
    //$rootScope.$broadcast('metadataUpdated');
  });

  $rootScope.$on("associationsUpdated", function () {
    console.log("JEN DDC: on associationsUpdated");
    $scope.refreshMetadata()
    App.alert({
      message: $translate.instant('success_metadata_update_assocation'),
      closeInSeconds: 5
    });
  });

  $rootScope.$on("associationRemoved", function () {
    console.log("JEN DDC: on associationRemoved");
    $scope.refreshMetadata().then(
      $timeout(function () {
        App.alert({
          container: '#association_notifications',
          //message: "Assocation Successfully Removed",
          message: $translate.instant('success_metadata_assocation_removed'),
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
   // $scope.requesting = true;
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
          //$scope.refreshMetadata();
          //$rootScope.$broadcast('metadataUpdated');
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
  $scope.saveDataDescriptor = function (container_id="") {
    //console.log("JEN DDC: saveDataDescriptor: " + $scope.datadescriptor.uuid);
    $scope.requesting = true;
    $scope.$broadcast('schemaFormValidate');
    /*if ($scope.datadescriptor.creators.length > 0 && $scope.datadescriptor.title &&
      $scope.datadescriptor.license_permission && $scope.datadescriptor.license_rights) {*/
    // check for required fields before continuing with the save process
    if ($scope.datadescriptor.creators.length > 0 && $scope.datadescriptor.title) {
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
                // JEN TODO: need to add a mechanism to loop through all the files and add the association.
                App.alert({
                  message: "Success Data Descriptor Saved",
                  closeInSeconds: 5
                });

                $scope.wizardSecondPage = true;
                $scope.edit_data_descriptor = true;
                $scope.has_data_descriptor = true;
                $scope.action = "edit";
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
      $scope.missing_values_error = true;
      App.alert({
        type: 'danger',
        container: container_id,
        message: "Title and Author are required fields - Please correct and submit again.",
        closeInSeconds: 5,
        focus: true }
      );
    }
    //$scope.cancelEditDataDescriptor();
    //$scope.close();
  }

  $scope.updateDataDescriptor = function (container_id="") {
    console.log("JEN DDC: updateDataDescriptor");
    $scope.requesting = true;
    $scope.wizardSecondPage = false;
    $scope.$broadcast('schemaFormValidate');

     /*
    if ($scope.datadescriptor.creators.length > 0 && $scope.datadescriptor.creators != '' &&
      $scope.datadescriptor.title && $scope.datadescriptor.license_permission &&
      $scope.datadescriptor.license_rights) {
````*/
    // check for required fields before continuing with save process
    if ($scope.datadescriptor.creators.length > 0 
        && $scope.datadescriptor.creators != '' 
        && $scope.datadescriptor.title) {
      // Then we check if the form is valid
      //	if (form.$valid) {
      MetadataService.fetchSystemMetadataSchemaUuid('DataDescriptor')
        .then(function (response) {
          var body = {};
          body.name = $scope.data_descriptor_metadatum.name;
          body.value = $scope.datadescriptor;
          body.schemaId = $scope.data_descriptor_metadatum.schemaId;
          body.associationIds = $scope.data_descriptor_metadatum.associationIds;
          MetaController.updateMetadata(body, $scope.data_descriptor_metadatum.uuid)
            .then(
              function (response) {
                $scope.metadataUuid = response.result.uuid;
                App.alert({
                  message: "Success Data Descriptor Saved",
                  closeInSeconds: 5
                });
                //$rootScope.$broadcast('metadataUpdated');
                $scope.cancelEditDataDescriptorWithBroadcast();
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
      //$scope.md = $("#data_descriptor_modal");
      //$("#data_descriptor_modal").scrollTop(0);
      //$('#data_descriptor_modal').animate({ scrollTop: 0 }, 'fast');
      //var container = document.getElementById("data_descriptor_modal");
      App.alert({
        type: 'danger',
        container: container_id,
        message: "Title and Author are required fields - Please correct and submit again.",
        closeInSeconds: 5,
        focus: true }
      );
    }
    //$scope.cancelEditDataDescriptor();
    //$scope.close();
  }

  $scope.animationsEnabled = true;

  $scope.editDataDescriptor = function () {
    console.log("JEN DDC: editDataDescriptor");
    $scope.datadescriptor = $scope.data_descriptor_metadatum.value;
    $scope.edit_data_descriptor = true;
    ga('create', 'UA-127746084-1', 'auto');
    ga('send', 'pageview', {
      page:'/app/views/datadescriptor/manager.html', 
      title:'`Ike Wai Gateway | Data Descriptor Edit' 
    });
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
    console.log("JEN DDC: addAssociationToDataDescriptor: " + dataDescriptorUuid + ", " + metadatumUuid);
    if (metadatumUuid) {
     // $scope.requesting = true;
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
      MessageService.handle(response, $translate.instant('error_metadataschemas_get'));
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
     // $scope.requesting = true;
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
      App.alert({
        type: 'danger',
        message: $translate.instant('Error access existing Data Descritpor!'),
        closeInSeconds: 5
      });
    }
    $scope.requesting = false;
  }

  $scope.locFilter = function (item) {
    if (item.name === 'Well' || item.name === 'Site'|| item.name === 'Water_Quality_Site') {
      return item;
    }
  }

  /////////Modal Stuff for locations and variables, not data descriptors /////////////////////
  $scope.fetchVarModalMetadata = function () {
    $scope.requesting = true;
    MetaController.listMetadata(
        $scope.query, $scope.limit, $scope.offset
      )
      .then(
        function (response) {
          $scope.associate_metadata = response.result;
          $scope.requesting = false;
        },
        function (response) {
          MessageService.handle(response, $translate.instant('error_metadata_list'));
          $scope.requesting = false;
        }
      );

  }
  // opens modals for location and variables
  $scope.open = function (size, types, title) {
    //Set the
    $scope.modalSchemas = types.slice(0);
    console.log("modalSchemas: " + $scope.modalSchemas);
    $scope.selectedSchema = types.slice(0);
    console.log("selectedSchema: " + $scope.selectedSchema);
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
    //$scope.searchAll();
  };

  $scope.openVariables = function (size, types, title) {
    //Set the
    $scope.modalSchemas = types.slice(0);
    console.log("modalSchemas: " + $scope.modalSchemas);
    $scope.selectedSchema = types.slice(0);
    console.log("selectedSchema: " + $scope.selectedSchema);
    $scope.modalTitle = title;
    var modalInstance = $uibModal.open({
      animation: $scope.animationsEnabled,
      templateUrl: 'views/modals/ModalAssociateVariable.html',
      controller: 'ModalAssociateVariableCtrl',
      scope: $scope,
      size: size,
      resolve: {

      }
    });
    $scope.selectedSchema =['Variable']
    $scope.searchAll()

  };

  $scope.openLocations = function (size, types, title) {
    //Set the
    $scope.modalSchemas = types.slice(0);
    console.log("modalSchemas: " + $scope.modalSchemas);
    $scope.selectedSchema = types.slice(0);
    console.log("selectedSchema: " + $scope.selectedSchema);
    $scope.modalTitle = title;
    var modalInstance = $uibModal.open({
      animation: $scope.animationsEnabled,
      templateUrl: 'views/modals/ModalLocationsAssociate.html',
      controller: 'ModalAssociateMetadatCtrl',
      scope: $scope,
      size: size,
      resolve: {

      }
    })
    leafletData.getMap("associateMap").then(function(map) {
      setTimeout(function() {
        map.invalidateSize();
      }, 0.1 * 1000);
        
    })
  
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
    console.log("schemaType: " + schemaType);
    MetadataService.fetchSystemMetadataSchemaUuid(schemaType)
      .then(function (response) {
        var uuid = response;
        console.log("schema uuid: " + uuid);
        $scope.isContrib = isContrib;
        $scope.openCreate(uuid, size);
      });
    $scope.requesting = false;
    var gaString = "`Ike Wai Gateway | Create Metadata " + schemaType;
    ga('create', 'UA-127746084-1', 'auto');
    ga('send', 'pageview', {
      page:'views/modals/ModalCreateMetadata.html', 
      title:gaString  
    });
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
    //console.log("Jen DDC: openCreate");
    $scope.wizardSecondPage = false;
    $scope.fileMetadataObjects = $scope.fileMetadataObject;
    $scope.selectedSchemaUuid = schemauuid;
    $uibModal.open({
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

  $scope.openEditDataDescriptor = function (dataDescriptorUuid, size) {
    console.log("Jen DDC: openEditDataDescriptor: " + dataDescriptorUuid);
    $scope.uuid = dataDescriptorUuid;
    $scope.action = "edit";
    var modalInstance = $uibModal.open({
      animation: $scope.animationsEnabled,
      templateUrl: 'views/datadescriptor/manager.html',
      controller: 'DataDescriptorController',
      scope: $scope,
      size: size,
      uuid: dataDescriptorUuid,
      profile: $scope.profile,
      resolve: {

      }
    });
  };



  ///////Assoc modal search////////
  $scope.schemaBox = {
    val1: true,
    val2: true,
    val5: true
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
    console.log("$scope.metadataschema: "+$scope.metadataschema)
    angular.forEach($scope.metadataschema, function (value, key) {
      if ($scope.selectedSchema.indexOf(value.schema.title) > -1) {
        //set the schema name(s) to search across
        typearray.push(value.schema.title);
        //add schema properties to search across
       /* if ($scope.searchField.value != '') {
          angular.forEach(value.schema.properties, function (val, key) {
            var valquery = {}
            valquery['value.' + key] = {
              $regex: $scope.searchField.value,
              '$options': 'i'
            }
            queryarray.push(valquery)
          })
          if ($scope.searchField.value != null && $scope.searchField.value !=''){
            queryarray.push({'$text':{'$search':$scope.searchField.value}})
          }
          orquery['$or'] = queryarray;
        }*/
      }
    })
    typequery['name'] = {
      '$in': typearray
    }
    if ($scope.searchField.value != null && $scope.searchField.value !=''){
      andarray.push({'$text':{'$search':$scope.searchField.value}})
    }
    andarray.push(typequery)
   //andarray.push(orquery)
    
    andquery['$and'] = andarray;
    if ($scope.searchField.value != null && $scope.searchField.value !=''){
        $scope.query = "{$and: [{'$text':{ '$search': '"+$scope.searchField.value+"'}},"+JSON.stringify(typequery)+"]}"//JSON.stringify(andquery);
    }
    else{ 
      $scope.query = JSON.stringify(typequery)
    }
        console.log("DataDescriptorController.searchAll QUERY: "+$scope.query)
    $scope.offset = 0;
    $scope.fetchVarModalMetadata();
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

}).controller('ModalAssociateMetadatCtrl', function ($scope, $filter,$modalInstance, MetaController,MessageService,leafletDrawEvents,leafletData) {
  $scope.initializeModal = function(){
    leafletData.getMap("associateMap").then(function(map) {
      
      
      setTimeout(function() {
        map.invalidateSize();
      }, 0.1 * 1000);
      
      var drawnItems = new L.FeatureGroup();
      $scope.drawnitems = drawnItems
      map.addLayer(drawnItems);
      var options = {
        position: 'topright',
        collapsed: false,
        draw: {
          polyline: false,
          polygon: {
            allowIntersection: false, // Restricts shapes to simple polygons
            drawError: {
              color: '#e1e100', // Color the shape will turn when intersects
              message: '<strong>Oh snap!<strong> you can\'t draw that!' // Message that will show when intersect
            },
            shapeOptions: {
              color: '#bada55'
            }
          },
          marker: false,
          circlemarker:false,
          circle: false, // Turns off this drawing tool
          rectangle: {
            shapeOptions: {
              clickable: true
            }
          }
        },
        edit: {
          featureGroup: drawnItems, //REQUIRED!!
          remove: true
        }
      };
      var drawControl = new L.Control.Draw(options);
      map.addControl(drawControl);

      var getCentroid = function (arr) {
        var twoTimesSignedArea = 0;
        var cxTimes6SignedArea = 0;
        var cyTimes6SignedArea = 0;
    
        var length = arr.length
    
        var x = function (i) { return arr[i % length][0] };
        var y = function (i) { return arr[i % length][1] };
    
        for ( var i = 0; i < arr.length; i++) {
            var twoSA = x(i)*y(i+1) - x(i+1)*y(i);
            twoTimesSignedArea += twoSA;
            cxTimes6SignedArea += (x(i) + x(i+1)) * twoSA;
            cyTimes6SignedArea += (y(i) + y(i+1)) * twoSA;
        }
        var sixSignedArea = 3 * twoTimesSignedArea;
        return [ cxTimes6SignedArea / sixSignedArea, cyTimes6SignedArea / sixSignedArea];
      }

      map.on('draw:created', function (e,leafletEvent, leafletObject, model, modelName) {
        var type = e.layerType,
          layer = e.layer;

        

        drawnItems.addLayer(layer);
        //hide toolbar
        angular.element('.leaflet-draw-toolbar-top').hide();
        //drawControl.hideDrawTools();
       // alert(angular.toJson(angular.fromJson(drawnItems.toGeoJSON()).features[0].geometry));
      });//end created
      map.on('draw:deleted', function (e,leafletEvent, leafletObject, model, modelName) {
        if (angular.fromJson(drawnItems.toGeoJSON()).features[0] == null){
          angular.element('.leaflet-draw-toolbar-top').show();
          $scope.layers.overlays = {}
        }
      })
      
    });
  }
  $scope.initializeModal();

  $scope.cancel = function () {
    $modalInstance.close();
  };
  
  $scope.updateMap = function(){
    $scope.siteMarkers = $filter('filter')($scope.location_metadata, {name: "Site"});
    $scope.wellMarkers = $filter('filter')($scope.location_metadata, {name: "Well"});
    $scope.waterQualitySiteMarkers = $filter('filter')($scope.location_metadata, {name: "Water_Quality_Site"});
    $scope.marks = {};
    $scope.layers.overlays = {};
    if ($scope.siteMarkers.length > 0){
      $scope.layers.overlays['ikewai_sites']={
                      name: 'Ike Wai Sites',
                      type: 'group',
                      visible: true
                  }
    }
    if ($scope.wellMarkers.length > 0){
      $scope.layers.overlays['ikewai_wells']={
                      name: 'Ike Wai Wells',
                      type: 'group',
                      visible: true
                  }
    }
    if ($scope.waterQualitySiteMarkers.length > 0){
    $scope.layers.overlays['water_quality_sites']= {
                      name: 'Water Quality Sites',
                      type: 'group',
                      visible: true
                  }
    }
    angular.forEach(  $scope.siteMarkers, function(datum) {
        if(datum.value.loc != undefined && datum.value.name != undefined){
          if(datum.value.loc.type == 'Point'){
            $scope.marks[encodeURI(datum.value.name).replace(/-/g,"")] = {lat: datum.value.latitude, lng: datum.value.longitude, message: datum.value.description, draggable:false, layer:'ikewai_sites'}
          }else{

              $scope.layers.overlays[datum.uuid] = {
                  name: datum.value.name.replace(/-/g,""),
                  type: 'geoJSONShape',
                  data: datum.value.loc,
                  visible: true,
                  layerOptions: {
                      style: {
                              color: '#00D',
                              fillColor: 'green',
                              weight: 2.0,
                              opacity: 0.6,
                              fillOpacity: 0.2
                      },
                      message: datum.value.description
                  }
              }

          }
      }
    });
    angular.forEach($scope.wellMarkers, function(datum) {
        if(datum.value.latitude != undefined && datum.value.wid !=undefined){
          $scope.marks[encodeURI(datum.value.wid).replace(/-/g,"")] = {lat: datum.value.latitude, lng: datum.value.longitude, message: "Well ID: " + datum.value.wid + "<br/>" + "Well Name: " + datum.value.well_name + "<br/>" + "Latitude: " + datum.value.latitude + "<br/>" + "Longitude: " + datum.value.longitude, draggable:false, layer:'ikewai_wells'}
      }
    });
    angular.forEach($scope.waterQualitySiteMarkers, function(datum) {
        if(datum.value.latitude != undefined && datum.value.name !=undefined){
          $scope.marks[encodeURI(datum.value.name.replace(/-/g,""))] = {lat: datum.value.latitude, lng: datum.value.longitude, message: "Name: " + datum.value.name + "<br/>" + "Latitude: " + datum.value.latitude + "<br/>" + "Longitude: " + datum.value.longitude, draggable:false, layer:'water_quality_sites'}
      }
    });
    $scope.assoc_markers = $scope.marks
  }

  $scope.spatialSearch = function(){
    //if ($scope.selectedMetadata != ''){
      
  // leafletData.getMap("associateMap").then(function(map) {
        //alert(angular.toJson(map.getBounds()))
        //GeoIP.centerMapOnPosition(map, 15);
    //});
      
    
    typearray = []
    typequery = {}
    angular.forEach($scope.selectedSchema,function(schema) {
      typearray.push(schema);
    });
   /* if ($scope.schemaBox.val1){
      typearray.push('Site')
    }
    if ($scope.schemaBox.val2){
      typearray.push('Well')
    }
    if ($scope.schemaBox.val5){
      typearray.push('Water_Quality_Site')
    }*/
    typequery['name'] = {'$in': typearray}
    $scope.requesting = true;
    if (angular.fromJson($scope.drawnitems.toGeoJSON()).features[0] != null)
    {
      if ($scope.searchField.value != ''){
        $scope.query = "{$and: [{'$text':{ '$search':'"+$scope.searchField.value+"'}},"+JSON.stringify(typequery)+", {'value.loc': {$geoWithin: {'$geometry':"+angular.toJson(angular.fromJson($scope.drawnitems.toGeoJSON()).features[0].geometry).replace(/"/g,'\'')+"}}}]}";
      }
      else{
        $scope.query = "{$and: ["+JSON.stringify(typequery)+", {'value.loc': {$geoWithin: {'$geometry':"+angular.toJson(angular.fromJson($scope.drawnitems.toGeoJSON()).features[0].geometry).replace(/"/g,'\'')+"}}}]}";
      }
    }
    else{
      if ($scope.searchField.value != ''){
        $scope.query = "{$and: [{'$text':{ '$search': '"+$scope.searchField.value+"'}},"+JSON.stringify(typequery)+"]}"
      }
      else{
        $scope.query = ""+JSON.stringify(typequery)+"]"
      }
    }
        // $scope.query = "{$and: [{'name': {'$in':['Landuse']}}, {'value.loc': {$geoWithin: {'$geometry':"+angular.toJson(angular.fromJson($scope.drawnitems.toGeoJSON()).features[0].geometry).replace(/"/g,'\'')+"}}}]}";

    //else{
    //  $scope.filequery = "{$or:[{'value.published':'True'},{'name':'PublishedFile'}]}";
    //}
    $scope.fetchModalMetadata()
  }

  $scope.fetchLocations = function(){
    $scope.requesting = true;
    MetaController.listMetadata($scope.query,limit=10000,offset=0).then(
      function (response) {
        $scope.totalItems = response.result.length;
        $scope.pagesTotal = Math.ceil(response.result.length / $scope.limit);
        $scope[$scope._COLLECTION_NAME] = response.result;

        $scope.updateMap();
        // update download dropdown options for search results types
        $scope.searchResultsTypes = $scope.getSearchResultsTypes();
        $scope.requesting = false;
      },
      function(response){
        MessageService.handle(response, $translate.instant('error_metadata_list'));
        $scope.requesting = false;
      }
    );
  }
  $scope.fetchModalMetadata = function () {
    MetaController.listMetadata(
        $scope.query, 10000, 0
      )
      .then(
        function (response) {
          $scope.location_metadata = response.result;
          
          $scope.updateMap();
          $scope.requesting = false;
        },
        function (response) {
          MessageService.handle(response, $translate.instant('error_metadata_list'));
          $scope.requesting = false;
        }
      );

  }


   ///MAP///
////////LEAFLET//////////////////
$scope.assoc_markers=[];
$scope.mylayers = {
  baselayers: {
    google: {
      name: 'Google Satellite',
      url: 'http://www.google.com/maps/vt?lyrs=y@189&gl=en&x={x}&y={y}&z={z}',
      type: 'xyz'
    },
    googleStreet: {
      name: 'Google Roads',
      url: 'http://www.google.com/maps/vt?lyrs=m@189&gl=en&x={x}&y={y}&z={z}',
      type: 'xyz'
    }
  },
  overlays:{

  }
}
angular.extend($scope, {
  drawControl: false,
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
          scrollWheelZoom: false,
          controls :{
            layers : {
                visible: true,
                position: 'topright',
                collapsed: false
                     }
            }
  },
  layers: {
    baselayers: {
      google: {
        name: 'Google Satellite',
        url: 'http://www.google.com/maps/vt?lyrs=y@189&gl=en&x={x}&y={y}&z={z}',
        type: 'xyz'
      },
      googleStreet: {
        name: 'Google Roads',
        url: 'http://www.google.com/maps/vt?lyrs=m@189&gl=en&x={x}&y={y}&z={z}',
        type: 'xyz'
      }
    },
    overlays:{

    }
  },
});

angular.extend($scope, {
  map: {
    id:"associateMap",
    center: {
        lat: 21.289373,
        lng: -157.91,
        zoom: 7
    },
  /*  drawOptions: {
      position: "bottomright",
      draw: {
        polyline: false,
        polygon: {
          metric: false,
          showArea: true,
          drawError: {
            color: '#b00b00',
            timeout: 1000
          },
          shapeOptions: {
            color: 'blue'
          }
        },
        circle: false,
        marker: false
      },
      edit: {
        featureGroup: drawnItems,
        remove: true
      }
    }*/
  }
  });
/*var drawnItems = new L.FeatureGroup();
$scope.drawnItemsCount = function() {
return drawnItems.getLayers().length;
}


var handle = {
created: function(e,leafletEvent, leafletObject, model, modelName) {
  drawnItems.addLayer(leafletEvent.layer);
  //hide toolbar
  angular.element('.leaflet-draw-toolbar-top').hide();
  //drawControl.hideDrawTools();
  alert(angular.toJson(angular.fromJson(drawnItems.toGeoJSON()).features[0].geometry));
},
edited: function(arg) {},
deleted: function(arg) {
  if (angular.fromJson(drawnItems.toGeoJSON()).features[0] == null){
    angular.element('.leaflet-draw-toolbar-top').show();
  }
},
drawstart: function(arg) {console.log("drawing")},
drawstop: function(arg) {},
editstart: function(arg) {},
editstop: function(arg) {},
deletestart: function(arg) {

},
deletestop: function(arg) {}
};
var drawEvents = leafletDrawEvents.getAvailableEvents("associateMap");
drawEvents.forEach(function(eventName){
  $scope.$on('leafletDirectiveDraw.' + eventName, function(e, payload) {
    //{leafletEvent, leafletObject, model, modelName} = payload
    var leafletEvent, leafletObject, model, modelName; //destructuring not supported by chrome yet :(
    leafletEvent = payload.leafletEvent, leafletObject = payload.leafletObject, model = payload.model,
    modelName = payload.modelName;
    handle[eventName.replace('draw:','')](e,leafletEvent, leafletObject, model, modelName);
  });
});*/
}).controller('ModalAssociateVariableCtrl', function ($scope, $modalInstance, MetaController,MessageService) {
  $scope.cancel = function () {
    $modalInstance.close();
  };

  $scope.fetchVariableModalMetadata = function () {
    $scope.requesting = true;
    MetaController.listMetadata(
        $scope.query, $scope.limit, $scope.offset
      )
      .then(
        function (response) {
          $scope.associate_metadata = response.result;
          $scope.requesting = false;
        },
        function (response) {
          MessageService.handle(response);
          $scope.requesting = false;
        }
      );

  }
  $scope.fetchVariableModalMetadata(); 
  $scope.searchVariables = function () {
    $scope.requesting = true;
    var orquery = {}
    var andquery = {}
    var queryarray = []
    var andarray = []
    var innerquery = {}
    var typearray = []
    var typequery = {}
    console.log("$scope.metadataschema: "+$scope.metadataschema)
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
          /*if ($scope.searchField.value != null && $scope.searchField.value !=''){
            queryarray.push({'$text':{'$search':$scope.searchField.value}})
          }*/
          orquery['$or'] = queryarray;
        }
      }
    })
    typequery['name'] = {
      '$in': typearray
    }
    //if ($scope.searchField.value != null && $scope.searchField.value !=''){
    //  andarray.push({'$text':{'$search':$scope.searchField.value}})
    //}
    andarray.push(typequery)
    andarray.push(orquery)
    
    andquery['$and'] = andarray;
    $scope.query =JSON.stringify(andquery);
    /*if ($scope.searchField.value != null && $scope.searchField.value !=''){
        $scope.query = "{$and: [{'$text':{ '$search': '"+$scope.searchField.value+"'}},"+JSON.stringify(typequery)+"]}"//JSON.stringify(andquery);
    }
    else{ 
      $scope.query = JSON.stringify(typequery)
    }*/
        console.log("DataDescriptorController.searchAll QUERY: "+$scope.query)
    $scope.offset = 0;
    $scope.fetchVariableModalMetadata();
  }
});
