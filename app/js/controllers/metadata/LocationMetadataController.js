angular.module('AgaveToGo').controller('LocationMetadataController', function ($scope, $state, $filter,$translate, $uibModal, $rootScope, $localStorage, MetaController, FilesController, ActionsService, MessageService, MetadataService, leafletDrawEvents, leafletData) {
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
    $scope.approvedSchema = ['Well','Site','Water_Quality_Site','RainfallStation']
    $scope.selectedSchema = ['Well','Site','Water_Quality_Site','RainfallStation']
    $scope.queryLimit = 99999;

    $scope.offset = 0;
    $scope.limit = 10;

    $scope.sortType = 'name';
    $scope.sortReverse  = true;
    $scope.status = 'active';
    $scope.available = true;
    $scope.query = "{'name':{'$in': ['" + $scope.approvedSchema.join("','") +"'] }}";
    $scope.schemaQuery = "{'schema.title':{'$in': ['" + $scope.approvedSchema.join("','") +"'] }}"

    $scope.schemaBox = {val1:true,val2:true,val5:true,val4:true};
    $scope.ikewaiType ="";
    $scope.wellbox = true;
    $scope.searchField = {value:''}

    $scope.updateMap = function(){
      $scope.siteMarkers = $filter('filter')($scope[$scope._COLLECTION_NAME], {name: "Site"});
      $scope.wellMarkers = $filter('filter')($scope[$scope._COLLECTION_NAME], {name: "Well"});
      $scope.rfMarkers = $filter('filter')($scope[$scope._COLLECTION_NAME], {name: "RainfallStation"});
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
      if ($scope.rfMarkers.length > 0){
        $scope.layers.overlays['rainfall_stations']= {
                          name: 'Rainfall Stations',
                          type: 'group',
                          visible: true
                      }
        }
      angular.forEach($scope.siteMarkers, function(datum) {
          if(datum.name == "Site" && datum.value.loc != undefined && datum.value.name != undefined){
            if(datum.value.loc.type == 'Point'){
              $scope.marks["site"+datum.value.name.replace(/-/g,"")] = {lat: datum.value.latitude, lng: datum.value.longitude, 
                getMessageScope: function() { return $scope; },
                message: "<h5>Ike Wai Site</h5>ID: "+datum.value.id+"<br/>Name: "+datum.value.name+"<br/>Latitude: " + datum.value.latitude + "<br/>Longitude: " + datum.value.longitude+"</br>Description: "+datum.value.description+"<br/><a href='#' ng-click=\"openView('"+datum.uuid+"', 'lg')\" class='ng-binding'>View </a>", draggable:false, layer:'ikewai_sites'}
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
            $scope.marks["well"+datum.value.wid.replace(/-/g,"")] = {lat: parseFloat(datum.value.latitude), lng: parseFloat(datum.value.longitude),icon: {
              type: 'awesomeMarker',
              icon: 'tint',
              markerColor: 'gray'
          },  
          getMessageScope: function() { return $scope; },
          message: "<h5>Well</h5>ID: " + datum.value.wid + "<br/>" + "Well Name: " + datum.value.well_name + "<br/>" + "Latitude: " + datum.value.latitude + "<br/>" + "Longitude: " + datum.value.longitude +"<br/><a href='#' ng-click=\"openView('"+datum.uuid+"', 'lg')\" class='ng-binding'>View </a>", draggable:false, layer:'ikewai_wells'}
        }
      });
      angular.forEach($scope.rfMarkers, function(datum) {
        if(datum.value.latitude != undefined && datum.value.name !=undefined){
          $scope.marks["rf"+datum.value.skn] = {lat: parseFloat(datum.value.latitude), lng: parseFloat(datum.value.longitude), icon: {
            type: 'awesomeMarker',
            icon: 'cloud',
            markerColor: 'red'
        }, 
        getMessageScope: function() { return $scope; },
        message: "<h5>Rainfall Station</h5>ID: " + datum.value.skn + "<br/>" + "Name: " + datum.value.station_name + "<br/>" + "Latitude: " + datum.value.latitude + "<br/>" + "Longitude: " + datum.value.longitude+"<br/><a href='#' ng-click=\"openView('"+datum.uuid+"', 'lg')\" class='ng-binding'>View </a>", draggable:false, layer:'rainfall_stations'}
      }
    });
      angular.forEach($scope.waterQualitySiteMarkers, function(datum) {
          if(datum.value.latitude != undefined && datum.value.name !=undefined){
            $scope.marks["wq"+datum.value.name.replace(/-/g,"")] = {lat: parseFloat(datum.value.latitude), lng: parseFloat(datum.value.longitude), icon: {
              type: 'awesomeMarker',
              icon: 'tint',
              markerColor: 'green'
          },
          getMessageScope: function() { return $scope; },
          message: "<h5>Water Quality Site</h5>Name: " + datum.value.name + "<br/>Provider: " +datum.value.ProviderName+ "<br/>Measurments: " +datum.value.resultCount+"<br/>Latitude: " + datum.value.latitude + "<br/>Longitude: " + datum.value.longitude+"<br/><a href='#' ng-click=\"openView('"+datum.uuid+"', 'lg')\" class='ng-binding'>View </a>", draggable:false, layer:'water_quality_sites'}
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
        if ($scope.schemaBox.val4){
          typearray.push('RainfallStation')
        }
        typequery['name'] = {'$in': typearray}
        console.log($scope.ikewaiType)
        if ($scope.ikewaiType != ""){
          typequery['value.ikewai_type'] = {'$in': $scope.ikewaiType}
        }
        console.log(typequery)
        if(angular.fromJson($scope.drawnItems.toGeoJSON()).features[0]){
          if($scope.searchField.value == '')
          {
            $scope.query = "{$and: ["+JSON.stringify(typequery)+",{'value.loc': {$geoWithin: {'$geometry':"+angular.toJson(angular.fromJson($scope.drawnItems.toGeoJSON()).features[0].geometry).replace(/"/g,'\'')+"}}}]}";
          }
          else{
            $scope.query = "{$and: ["+JSON.stringify(typequery)+",{'$text':{ '$search':'"+$scope.searchField.value+"'}},{'value.loc': {$geoWithin: {'$geometry':"+angular.toJson(angular.fromJson($scope.drawnItems.toGeoJSON()).features[0].geometry).replace(/"/g,'\'')+"}}}]}";
          }
            //  $scope.query = "{$and: ["+JSON.stringify(typequery)+","+JSON.stringify(orquery)+", {'value.loc': {$geoWithin: {'$geometry':"+angular.toJson(angular.fromJson($scope.drawnItems.toGeoJSON()).features[0].geometry).replace(/"/g,'\'')+"}}}]}";
        }
        else { 
          if($scope.searchField.value != '')
          {         
            $scope.query = "{$and: ["+JSON.stringify(typequery)+",{'$text':{ '$search':'"+$scope.searchField.value+"'}}]}";
          }
          else{
            $scope.query = "{$and: ["+JSON.stringify(typequery)+"]}"
          }
          //$scope.query = "{$and: ["+JSON.stringify(typequery)+","+JSON.stringify(orquery)+"]}";
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
        if ($scope.schemaBox.val4){
          typearray.push('RainfallStation')
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
  $schemaProperties.RainfallStation = {};
  
  $scope.prepareForDownloadSearchResults = function() {
    if ($scope.downloadType.length == 0) {
      // shouldn't happen, but in case an empty value is passed for the download type
      alert ('Please select a download category');
      return false;
    }

    // get the UUID for the download type
    console.log("Search Result Types " + $scope.searchResultsTypes)
    angular.forEach($scope.searchResultsTypes, function(value, key){
      if (!$schemaProperties[value].uuid) {
        if (!$localStorage["schema_" + value]) {
          MetadataService.fetchSystemMetadataSchemaUuid(value)
            .then(function(data) {
              if (data) {
                $schemaProperties[value].uuid = data;
                console.log(data)
              } else {
                App.alert({
                  type: 'danger',
                  message: "Error - could not load Schema " + value + ".",
                  closeInSeconds: 15}
                );
              }
          })
        } else {
          console.log("local store "+$localStorage["schema_" + value])
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
          console.log("properties: " + $schemaProperties[$scope.downloadType.value].properties)
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
  // check search results for types found
  $scope.getSearchResultsTypes = function() {
    if ($scope.metadata) {
      $scope.searchResultsTypes = [];
      siteFound = false;
      wellFound = false;
      wqsFound = false;
      rfFound = false;
      for (var i = 0; i < $scope.metadata.length; i++) {
        var metadatum = $scope.metadata[i];
        if (metadatum.name == 'Site' && !siteFound) {
          siteFound = true;
        }
        if (metadatum.name == 'Well' && !wellFound) {
          wellFound = true;
        }
        if (metadatum.name == 'Water_Quality_Site' && !wqsFound) {
          wqsFound = true;
        }
        if (metadatum.name == 'RainfallStation' && !rfFound) {
          rfFound = true;
        }
      }
      if (siteFound) {      
        $scope.searchResultsTypes.push('Site');
      }
      if (wellFound) {      
        $scope.searchResultsTypes.push('Well');
      }
      if (wqsFound) {      
        $scope.searchResultsTypes.push('Water_Quality_Site');
      }
      if (rfFound) {      
        $scope.searchResultsTypes.push('RainfallStation');
      }
      // if the currently selected option is no longer an option, make the first option selected
      if ($scope.searchResultsTypes.indexOf($scope.downloadType.value) == -1) {
        if ($scope.searchResultsTypes[0]) {
          $scope.downloadType.value = $scope.searchResultsTypes[0];
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
            zoom: 6
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
    rainMarker: {
      type: 'awesomeMarker',
      icon: 'cloud-rain',
      markerColor: 'red'
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
    }
  });

  $scope.initializeMap = function(){
    leafletData.getMap("locationMap").then(function(map) {
      
      
      setTimeout(function() {
        map.invalidateSize();
      }, 0.1 * 1000);
      
      var drawnItems = new L.FeatureGroup();
      $scope.drawnItems = drawnItems
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
        var bounds = layer.getBounds()

        // Fit the map to the polygon bounds
        map.fitBounds(bounds)
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
  $scope.initializeMap();
/*
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
*/
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
