angular.module('AgaveToGo').controller('LocationMetadataController', function ($scope, $state, $filter,$translate, $uibModal, $rootScope, $localStorage, MetaController, FilesController, ActionsService, MessageService, MetadataService, leafletDrawEvents) {
    $scope._COLLECTION_NAME = 'metadata';
    $scope._RESOURCE_NAME = 'metadatum';

    $scope.profile = $localStorage.activeProfile;
    $scope.get_editors = function(){
      $scope.editors = MetadataService.getAdmins();
      $scope.edit_perm = $scope.editors.indexOf($scope.profile.username) > -1;
    }
    $scope.get_editors();

    //Don't display metadata of these types
    $scope.ignoreMetadataType = ['published','stagged','PublishedFile','rejected'];
    //Don't display metadata schema types as options
    $scope.ignoreSchemaType = ['PublishedFile'];
    $scope.approvedSchema = ['Well','Site','Water_Quality_Site']
    $scope.selectedSchema = ['Well','Site','Water_Quality_Site']
    $scope.queryLimit = 99999;

    $scope.offset = 0;
    $scope.limit = 10;

    $scope.sortType = 'name';
    $scope.sortReverse  = true;
    $scope.status = 'active';
    $scope.available = true;
    $scope.query = "{'name':{'$in': ['" + $scope.approvedSchema.join("','") +"'] }}";
    $scope.schemaQuery = "{'schema.title':{'$in': ['" + $scope.approvedSchema.join("','") +"'] }}"

    $scope.schemaBox = {val1:true,val2:true,val5:true};
    $scope.wellbox = true;
    $scope.searchField = {value:''}

    $scope.updateMap = function(){
      $scope.siteMarkers = $filter('filter')($scope[$scope._COLLECTION_NAME], {name: "Site"});
      $scope.wellMarkers = $filter('filter')($scope[$scope._COLLECTION_NAME], {name: "Well"});
      $scope.waterQualitySiteMarkers = $filter('filter')($scope[$scope._COLLECTION_NAME], {name: "Water_Quality_Site"});
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
      angular.forEach($scope.siteMarkers, function(datum) {
          if(datum.value.loc != undefined && datum.value.name != undefined){
            if(datum.value.loc.type == 'Point'){
              $scope.marks[datum.value.name.replace("-"," ")] = {lat: datum.value.latitude, lng: datum.value.longitude, message: datum.value.description, draggable:false, layer:'ikewai_sites'}
            }else{

                $scope.layers.overlays[datum.uuid] = {
                    name: datum.value.name.replace("-"," "),
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
                        }
                    }
                }

            }
        }
      });
      angular.forEach($scope.wellMarkers, function(datum) {
          if(datum.value.latitude != undefined && datum.value.wid !=undefined){
            $scope.marks[datum.value.wid.replace(/-/g," ")] = {lat: datum.value.latitude, lng: datum.value.longitude, message: "Well ID: " + datum.value.wid + "<br/>" + "Well Name: " + datum.value.well_name + "<br/>" + "Latitude: " + datum.value.latitude + "<br/>" + "Longitude: " + datum.value.longitude, draggable:false, layer:'ikewai_wells'}
        }
      });
      angular.forEach($scope.waterQualitySiteMarkers, function(datum) {
          if(datum.value.latitude != undefined && datum.value.name !=undefined){
            $scope.marks[datum.value.name.replace(/-/g," ")] = {lat: datum.value.latitude, lng: datum.value.longitude, message: "Name: " + datum.value.name + "<br/>" + "Latitude: " + datum.value.latitude + "<br/>" + "Longitude: " + datum.value.longitude, draggable:false, layer:'water_quality_sites'}
        }
      });
      $scope.markers = $scope.marks
    }


    $scope.fetchLocations = function(){
      $scope.requesting = true;
      MetaController.listMetadata($scope.query,limit=10000,offset=0).then(
        function (response) {
          $scope.totalItems = response.result.length;
          $scope.pagesTotal = Math.ceil(response.result.length / $scope.limit);
          $scope[$scope._COLLECTION_NAME] = response.result;

          $scope.updateMap();
          $scope.requesting = false;
        },
        function(response){
          MessageService.handle(response, $translate.instant('error_metadata_list'));
          $scope.requesting = false;
        }
      );
    }

    $scope.searchAll = function(){
      //alert($scope.filter)
      $scope.requesting = true;
        var orquery = {}
        var andquery = {}
        var queryarray = []
        var andarray = []
        var innerquery = {}
        var typearray = []
        if ($scope.searchField.value != ''){
          angular.forEach($scope.metadataschema, function(value, key){
            //alert(angular.toJson(value))
            if($scope.approvedSchema.indexOf(value.schema.title) > -1){
              angular.forEach(value.schema.properties, function(val, key){
                var valquery = {}
                valquery['value.'+key] = {$regex: $scope.searchField.value, $options:'i'}
                queryarray.push(valquery)
              })
            }
          })
          orquery['$or'] = queryarray;
       }
        var typequery = {}

        if ($scope.schemaBox.val1){
          typearray.push('Site')
        }
        if ($scope.schemaBox.val2){
          typearray.push('Well')
        }
        if ($scope.schemaBox.val5){
          typearray.push('Water_Quality_Site')
        }
        // update the dropdown options for the download based on the checkboxes
        $scope.searchResultsTypes = typearray;

        // if the currently selected option is no longer an option, make the first option selected
        if ($scope.searchResultsTypes.indexOf($scope.downloadType.value) == -1) {
          if ($scope.searchResultsTypes[0]) {
            $scope.downloadType.value = $scope.searchResultsTypes[0];
          }
        }
        
        
        typequery['name'] = {'$in': typearray}
        if(angular.fromJson(drawnItems.toGeoJSON()).features[0]){
          $scope.query = "{$and: ["+JSON.stringify(typequery)+","+JSON.stringify(orquery)+", {'value.loc': {$geoWithin: {'$geometry':"+angular.toJson(angular.fromJson(drawnItems.toGeoJSON()).features[0].geometry).replace(/"/g,'\'')+"}}}]}";
        }
        else {
          $scope.query = "{$and: ["+JSON.stringify(typequery)+","+JSON.stringify(orquery)+"]}";
          //$scope.query = "{$and: ["+JSON.stringify(typequery)+",{$text: {$search: '"+$scope.searchField.value+"'}},"+JSON.stringify(orquery)+"]}";
          //$scope.query = "{$and: ["+JSON.stringify(typequery)+",{$text: {$search: '"+$scope.searchField.value+"'}}]}";
        }
        //typequery['name'] = {'$in': typearray}
        //andarray.push(typequery)
      //  if (orquery != null){
          //andarray.push(orquery)
        //}
        //andquery['$and'] = andarray;
        //$scope.query = JSON.stringify(andquery);
        //$scope.query = "{$and: ["+JSON.stringify(typequery)+", {'value.loc': {$geoWithin: {'$geometry':"+angular.toJson(angular.fromJson(drawnItems.toGeoJSON()).features[0].geometry).replace(/"/g,'\'')+"}}}]}";
        $scope.site_layers={}
        $scope.fetchLocations();
    }

     $scope.spatialSearch = function(){
        //if ($scope.selectedMetadata != ''){
        typearray = []
        typequery = {}
        if ($scope.schemaBox.val1){
          typearray.push('Site')
        }
        if ($scope.schemaBox.val2){
          typearray.push('Well')
        }
        if ($scope.schemaBox.val5){
          typearray.push('Water_Quality_Site')
        }
        typequery['name'] = {'$in': typearray}
        $scope.requesting = true;
          $scope.query = "{$and: ["+JSON.stringify(typequery)+", {'value.loc': {$geoWithin: {'$geometry':"+angular.toJson(angular.fromJson(drawnItems.toGeoJSON()).features[0].geometry).replace(/"/g,'\'')+"}}}]}";
        //  $scope.query = "{$and: [{'name': {'$in':['Landuse']}}, {'value.loc': {$geoWithin: {'$geometry':"+angular.toJson(angular.fromJson(drawnItems.toGeoJSON()).features[0].geometry).replace(/"/g,'\'')+"}}}]}";

        //else{
        //  $scope.filequery = "{$or:[{'value.published':'True'},{'name':'PublishedFile'}]}";
        //}
        $scope.fetchLocations()
      }


    $scope.refresh = function() {
      $scope.requesting = true;
      MetaController.listMetadataSchema(
				$scope.schemaQuery
			).then(function(response){
				$scope.metadataschema = response.result;

			})
       $scope.requesting = false;
      //$scope.searchAll()


    };

    $scope.searchTools = function(query){
      $scope.query = query;
      $scope.fetchLocations();
    };


    $scope.refresh();

    $rootScope.$on("metadataUpdated", function(){
      $scope.refresh();
    });

    $scope.confirmAction = function(resourceType, resource, resourceAction, resourceList, resourceIndex){
      ActionsService.confirmAction(resourceType, resource, resourceAction, resourceList, resourceIndex);
    };

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

  //*** download search results in metadata in CSV format *** //
  // downloadType holds the value of the type of download: site, well or water quality site
  $scope.downloadType = {};
  // assign to default dropdown value
  $scope.downloadType.value = "Site";
  
  $schemaProperties = {};
  $schemaProperties.Site = {};
  $schemaProperties.Well = {};
  $schemaProperties.Water_Quality_Site = {};
  
  $scope.prepareForDownloadSearchResults = function() {
    if ($scope.downloadType.length == 0) {
      // shouldn't happen, but in case an empty value is passed for the download type
      alert ('Please select a download category');
      return false;
    }

    // get the UUID for the download type
    angular.forEach($scope.searchResultsTypes, function(value, key){
      if (!$schemaProperties[value].uuid) {
        if (!$localStorage["schema_" + value]) {
          $schemaProperties[value].uuid = MetadataService.fetchSystemMetadataSchemaUuid(value)
            .then(function(response){
               return response;
          })
        } else {
          $schemaProperties[value].uuid = $localStorage["schema_" + value];
        } // END check if schema uuid was stored in local storage
      }
    })

    // get the properties of this download type
    if (!$schemaProperties[$scope.downloadType.value].properties) {
      MetaController.listMetadataSchema()
        .then(function(response) {
          list_schemas = response.result;
          for (var c = 0; c < list_schemas.length; c++) {
            if (list_schemas[c].uuid == $schemaProperties[$scope.downloadType.value].uuid) {
              $schemaProperties[$scope.downloadType.value].properties = list_schemas[c].schema.properties;
            }
          }
          $scope.downloadSearchResults();
      })
    } else {
      $scope.downloadSearchResults();
    }
  } // END function prepareForDownloadSearchResults

  $scope.downloadSearchResults = function() {
    var dataFields = [];
    angular.forEach($schemaProperties[$scope.downloadType.value].properties, function(value, key) {
    	dataFields.push(key);
    })

    // START populating data
    csvContent = '';
    for (var c = 0; c < dataFields.length; c++) {
      if (c > 0) {
        csvContent += ',';
      }
      dataDelimiter = "";
      if (dataFields[c].indexOf('"') > -1 ||
        dataFields[c].indexOf(',') > -1) {
        dataDelimiter = '"';
      }
      csvContent += dataDelimiter + dataFields[c] + dataDelimiter;
    } // END loop through datafields array to populate download headers
    csvContent += "\n";
    
    for (var i = 0; i < $scope.metadata.length; i++) {
      var metadatum = $scope.metadata[i];
      if ($scope.downloadType.value == metadatum.name) {
        for (var c = 0; c < dataFields.length; c++) {
          var keyName = dataFields[c].split('.');
          var tempDataObject = metadatum.value;
          for (var kn = 0; kn < keyName.length; kn++) {
            if (typeof tempDataObject[keyName[kn]] === "undefined") {
              tempDataObject = '';
            } else {
              tempDataObject = tempDataObject[keyName[kn]];
            }
          } // END go through the list of download type's field names to get the data
          if (c > 0) {
            csvContent += ',';
          }
          // sanitize string data. double quotes must be duplicated for csv.
          if (typeof tempDataObject == "string") {
            dataDelimiter = "";
            if (tempDataObject.indexOf('"') > -1 ||
              tempDataObject.indexOf(',') > -1) {
              dataDelimiter = '"';
            }
	    if (tempDataObject.substring(0, 1) == '"') {
	      tempDataObject = tempDataObject.substring(1, tempDataObject.length);
	    }
	    if (tempDataObject.substring(tempDataObject.length - 1) == '"') {
	      tempDataObject = tempDataObject.substring(0, tempDataObject.length - 1);
	    }
	    tempDataObject = tempDataObject.replace(/\"/g, "\"\"");
	  }
	  
	  if (!tempDataObject) {
	    tempDataObject = '';
	  }

          csvContent += dataDelimiter + tempDataObject + dataDelimiter;
        } // END loop through data fields array to populate download values
        csvContent += "\n";
      }
    }

    // csvContent = JSON.stringify($scope.metadata);
    // START download data to file
    // from: https://stackoverflow.com/questions/38462894/how-to-create-and-save-file-to-local-filesystem-using-angularjs
    var filename = 'searchResultsData' + $scope.downloadType.value + 's.csv';
    var blob = new Blob([csvContent], {type: 'text/csv'});
    if (window.navigator && window.navigator.msSaveOrOpenBlob) {
      window.navigator.msSaveOrOpenBlob(blob, filename);
    } else{
      var e = document.createEvent('MouseEvents'),
      a = document.createElement('a');
      a.download = filename;
      a.href = window.URL.createObjectURL(blob);
      a.dataset.downloadurl = ['text/csv', a.download, a.href].join(':');
      e.initEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
      a.dispatchEvent(e);
      // window.URL.revokeObjectURL(a.href); // clean the url.createObjectURL resource
    }
  } // END function downloadSearchResults

  // default types of the search results
  $scope.searchResultsTypes = ['Site', 'Well', 'Water_Quality_Site'];  
  // check what is currently selected then return types available to download based on checkboxes. Set in searchAll()
  $scope.getSearchResultsTypes = function() {
    if ($scope.searchResultsTypes.length == 0) {
      if ($scope.schemaBox.val1) {
        if (!$scope.downloadType.value) {
          $scope.downloadType.value = 'Site';
        }
      }
      if ($scope.schemaBox.val2) {
        if (!$scope.downloadType.value) {
          $scope.downloadType.value = 'Well';
        }
      }
      if ($scope.schemaBox.val5) {
        if (!$scope.downloadType.value) {
          $scope.downloadType.value = 'Water_Quality_Site';
        }
      }
    }
    return $scope.searchResultsTypes;
  } // END function getSearchResultsTypes

  ///MAP///
////////LEAFLET//////////////////
  $scope.markers=[];

  angular.extend($scope, {
    drawControl: true,
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
    layers: {
        baselayers: {
            osm: {
            name: 'OpenStreetMap',
            url: 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
            type: 'xyz'
            },
        },
        overlays:{

        }
    }
});


var drawnItems = new L.FeatureGroup();
$scope.drawnItemsCount = function() {
  return drawnItems.getLayers().length;
}
angular.extend($scope, {
  map: {
    center: {
        lat: 21.289373,
        lng: -157.91,
        zoom: 7
    },
    drawOptions: {
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
    }
  }
});

var handle = {
  created: function(e,leafletEvent, leafletObject, model, modelName) {
    drawnItems.addLayer(leafletEvent.layer);
    //hide toolbar
    angular.element('.leaflet-draw-toolbar-top').hide();
    //drawControl.hideDrawTools();
    //alert(angular.toJson(angular.fromJson(drawnItems.toGeoJSON()).features[0].geometry));
  },
  edited: function(arg) {},
  deleted: function(arg) {
    if (angular.fromJson(drawnItems.toGeoJSON()).features[0] == null){
      angular.element('.leaflet-draw-toolbar-top').show();
    }
  },
  drawstart: function(arg) {},
  drawstop: function(arg) {},
  editstart: function(arg) {},
  editstop: function(arg) {},
  deletestart: function(arg) {

  },
  deletestop: function(arg) {}
};
var drawEvents = leafletDrawEvents.getAvailableEvents();
drawEvents.forEach(function(eventName){
    $scope.$on('leafletDirectiveDraw.' + eventName, function(e, payload) {
      //{leafletEvent, leafletObject, model, modelName} = payload
      var leafletEvent, leafletObject, model, modelName; //destructuring not supported by chrome yet :(
      leafletEvent = payload.leafletEvent, leafletObject = payload.leafletObject, model = payload.model,
      modelName = payload.modelName;
      handle[eventName.replace('draw:','')](e,leafletEvent, leafletObject, model, modelName);
    });
});

/////////Modal Stuff/////////////////////


    $scope.openCreate = function (schemauuid, size) {
    	$scope.selectedSchemaUuid = schemauuid;
        var modalInstance = $uibModal.open({
          animation: $scope.animationsEnabled,
          templateUrl: 'views/modals/ModalCreateMetadata.html',
          controller: 'ModalMetadataResourceCreateController',
          scope: $scope,
          size: size,
          schemaUuid: schemauuid,
          resolve: {

          }
        }
      );
    };

    $scope.openEdit = function (metadatumuuid, size) {
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

    $scope.openView = function (metadatumuuid, size) {
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
});
