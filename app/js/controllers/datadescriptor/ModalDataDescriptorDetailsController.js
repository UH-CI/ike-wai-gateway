angular.module('AgaveToGo').controller('ModalDataDescriptorDetailsController', function($scope, $uibModal, $q, $filter, $modalInstance, $state, $translate, $timeout, $window, $rootScope, $localStorage, MetaController, PostitsController, FilesMetadataService, ActionsService, MessageService, MetadataService) {
  $scope.profile = $localStorage.activeProfile;

    //Set the order fields should display
  $scope.order={};
  $scope.order['Variable'] =['variable_name','category','site_type','sample_medium','data_type','speciation','unit','value_type']
  $scope.order['Well'] =['wid','island','well_name','old_name','yr_drilled','driller','latitude','longitude','gps','utm','owner_user','land_owner','pump_installer','old_number','well','casing_dia','ground_el','well_depth','solid_case','perf_case','use','init_head','salinity','init_cl','test_date','test_gpm','test_ddwon','test_chlor','test_temp','test_unit','temp_f','temp_c','pump_gpm','draft_mgy','head_feet','pump_yr','draft_yr','bot_hole','bot_solid','bot_perf','SPEC_CAPAC','pump_mgd','draft_mgd','pump_depth','surveyor','t']
  $scope.order['Site'] =['name','latitude','longitude','description','county','state']
  $scope.order['Person'] =['first_name','last_name','email','orcid','organization','address','phone','url']
  $scope.order['Organization'] = ['name','email','address','phone','url']
  //$scope.order['Subject'] = ['word','uuid','short_heirarchy','full_heirarchy','display']
  
  
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
  //$scope.action = $stateParams.action;

  $scope.query = "{'name':{$in:['Well','Site','Person','Organization','Location','Subject','Variable','Tag','File']}}";
  $scope.schemaQuery = ''; //"{'owner':'seanbc'}";
  //$scope.subjects = ['Wells', 'SGD', 'Bacteria'];

  $scope.people = [];
  $scope.orgs = [];
  $scope.subjects = [];
  $scope.locations = [];
  $scope.variables = [];

  $scope.ddUuid = $scope.metadataUuid;//$stateParams.uuid;

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
   //console.log("JEN DDC: refreshMetadata: uuid:'" + $stateParams.uuid);
    //console.log("JEN DDC: refreshMetadata: uuid:" + $scope.ddUuid);
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

 $scope.getAssociations = function () {
    $scope.locations = [];
    $scope.variables = [];
    console.log('getAssociation')
    if ($scope.data_descriptor_metadatum.associationIds){
      $scope.fetchMetadata("{'uuid':{'$in':['"+$scope.data_descriptor_metadatum.associationIds.join("','")+"']}}");
    }
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
            $scope.getAssociations();
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
  
  
  
  
  

  $scope.get_editors = function(){
    $scope.editors = MetadataService.getAdmins();
    $scope.edit_perm = $scope.editors.indexOf($scope.profile.username) > -1;
  }
  $scope.get_editors();

  $scope.close = function () {
    $modalInstance.close($scope.model);
  };

  $scope.metadatum = null;

 /* $scope.getModalMetadatum = function(){
    $scope.requesting = true;
    var uuid = this.$parent.metadataUuid;
    if (uuid !== '' && uuid) {
      MetaController.getMetadata(uuid)
        .then(
          function(response){
            $scope.metadatum = response.result;
              $scope.fetchFileMetadata("{$and:[{'name':'File'},{'associationIds':{$in: ['"+$scope.metadatum.uuid+"']}}]}")
              $scope.makeLocationMarkers($scope.metadatum)
            $scope.requesting = false;
          },
          function(response){
            MessageService.handle(response, $translate.instant('error_metadata_details'));
            $scope.requesting = false;
          }
        );
    } else {
      MessageService.handle(response, $translate.instant('error_metadata_details'));
      $scope.requesting = false;
    }
  };

  $scope.fetchFileMetadata = function(metadata_query){
    MetaController.listMetadata(metadata_query,100,0).then(
        function (response) {
          $scope.filemetadata = response.result;
          $scope.requesting = false;
        },
        function(response){
          MessageService.handle(response, $translate.instant('error_filemetadata_list'));
          $scope.requesting = false;
        }
    );
  };
*/
  $scope.openEdit = function (metadatumuuid, size) {
	  //$scope.close(); // if I close this modal, the new one's buttons don't work
      $uibModal.open({
        animation: $scope.animationsEnabled,
        templateUrl: 'views/modals/ModalEditMetadata.html',
        controller: 'ModalMetadataResourceEditController',
        scope: $scope,
        size: size,
        metadataUuid: metadatumuuid,
        resolve: {

        }
      }
    );
  };
  
 $scope.locFilter = function (item) {
    if (item.name === 'Well' || item.name === 'Site') {
      return item;
    }
  }

 // $scope.getModalMetadatum();

  $rootScope.$on("metadataUpdated", function(){
    $scope.getModalMetadatum();
  });
  
    $scope.refresh = function () {
    //console.log("JEN DDC: refresh: action = " + $scope.action + ", uuid:" + $stateParams.uuid);
    //console.log("JEN DDC: refresh: action = " + $scope.action + ", uuid:" + $scope.ddUuid);
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

    $scope.refreshMetadata();
  };
  
   $scope.refresh();

});
