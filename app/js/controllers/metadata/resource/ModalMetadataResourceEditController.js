angular.module('AgaveToGo').controller("ModalMetadataResourceEditController", function($scope, $modalInstance, $state, $translate, $window, $rootScope, WizardHandler, MetaController, MetadataService, ActionsService, MessageService,leafletDrawEvents) {

  $scope.close = function () {
    $modalInstance.close();
  };

  $scope.metadatum = null;

  $scope.getModalMetadatum = function(){
	$scope.requesting = true;
	var uuid = this.$parent.metadataUuid;
    if (uuid){
	  $scope.requesting = true;
	  MetaController.getMetadata(uuid)
      .then(function(response){
        $scope.metadatum = response.result;
        console.log($scope.metadatum)
        if($scope.metadatum){
          $scope.metadatum = response.result;
          if ($scope.metadatum.name == 'Well' || $scope.metadatum.name == 'Site'){
              $scope.makeLocationMarkers($scope.metadatum)
          }
          if ($scope.metadatum.schemaId == null){
            console.log("missing schemaId")
            if($scope.metadatum.name == 'Well'){
            $scope.metadatum.schemaId = '5711039176026484250-242ac1110-0001-013'
            }
          }
          console.log('schemaId: '+ $scope.metadatum.schemaId)
          MetaController.getMetadataSchema($scope.metadatum.schemaId)
            .then(function(response){
              $scope.metadataschema = response.result;
              //$scope.metadataschema = schema_response.result;
              console.log('schema: '+angular.toJson($scope.metadataschema ))
              var formschema = {};
              formschema["type"]="object";
              formschema["properties"] = $scope.metadataschema.schema.properties;
              $scope.schema = formschema;
              $scope.model ={};
              angular.forEach($scope.metadataschema.schema.properties, function(value, key) {
                if($scope.metadataschema.schema.properties[key].type == "number"){
                  if($scope.metadatum.value[key] == '' || $scope.metadatum.value[key] == null || $scope.metadatum.value[key] == "na"){
                    //$scope.model[key] = null;
                    //do nothing
                  }
                  else{
                    $scope.model[key] = Number($scope.metadatum.value[key]);
                  }
                }
                else if ($scope.metadataschema.schema.properties[key].type == "string"){
                  if($scope.metadatum.value[key] == '' || $scope.metadatum.value[key] == null ){
                    $scope.model[key] = "";
                    //do nothing
                  }
                  else{
                    $scope.model[key] = String($scope.metadatum.value[key]);
                  }
                }
                else if ($scope.metadataschema.schema.properties[key].format == "date-time"){
                  if($scope.metadatum.value[key] == ''){
                    //$scope.model[key] = null;
                    //do nothing
                  }
                  else{
                    $scope.model[key] = null;
                  }
                }
                else{
                  $scope.model[key] = $scope.metadatum.value[key];
                }
              });
              $scope.form = [
                "*"/*,
                { type: "submit", title: "Save" },
                { type: "button", title: 'Cancel', onClick: "close()" }*/
              ];
            }
          )
        }
        else{
          MessageService.handle(schema_response, $translate.instant('error_metadataschemas_get'));
        }
        $scope.requesting = false;
      }
      );
    }
    else{
      //  MessageService.handle($translate.instant('error_filemetadata_get'));
    }
  }

  $scope.onSubmit = function(form) {
    $scope.requesting = true;
    //$scope.$broadcast('schemaFormValidate');
    // Then we check if the form is valid
    if (form.$valid) {
      var body = {};
      body.associationIds = $scope.metadatum.associationIds;
      body.name = $scope.metadatum.name;
      body.value = $scope.model;
      body.schemaId = $scope.metadatum.schemaId;
      angular.forEach(body.value, function(value, key) {
        if(value ==''){
          body.value[key] = null;
        }
      })

      //check for latitude - if there then store a geojson point
      if (body.value["latitude"] != null){
						body.value["loc"] = {"type":"Point", "coordinates":[body.value["longitude"],body.value["latitude"]]}
						body.geospatial= true;
			}
      if($scope.model.polygon){
        body.value["loc"] = {"type":"Polygon", "coordinates": JSON.parse(body.value.polygon)}
        body.geospatial= true;
      }

      MetaController.updateMetadata(body,$scope.metadataUuid)
        .then(
          function(response){
            //App.alert({message: $translate.instant('success_metadata_update') });
			      //make sure default permissions are set
			     	MetadataService.addDefaultPermissions($scope.metadataUuid);
            $scope.requesting = false;
            $rootScope.$broadcast('metadataUpdated');
			       //$window.history.back();
            //  $state.go('metadata',{id: $scope.metadataUuid});
          },
          function(response){
            MessageService.handle(response, $translate.instant('error_metadata_update'));
            $scope.requesting = false;
          }
        )
      }
    $scope.close();
  };

  $scope.makeLocationMarkers = function(datum){
      $scope.marks = {};
      if(datum.value.loc != undefined){
        if(datum.value.loc.type == 'Point'){
          if(datum.value.latitude != undefined && datum.value.wid !=undefined){
            $scope.marks[datum.value.wid.replace(/-/g,"")] = {lat: parseFloat(datum.value.latitude), lng: parseFloat(datum.value.longitude), message: "Well ID: " + datum.value.wid + "<br/>" + "Well Name: " + datum.value.well_name + "<br/>" + "Latitude: " + datum.value.latitude + "<br/>" + "Longitude: " + datum.value.longitude, draggable:false}
            $scope.savedItems = {
                 "id":100,
                 "geoJSON": {
                     "type": "Feature",
                     "geometry": {
                         "type": "Point",
                         "coordinates": datum.value.loc.coordinates

                     }
                 },
                 "message": "Well ID: " + datum.value.wid + "<br/>" + "Well Name: " + datum.value.well_name + "<br/>" + "Latitude: " + datum.value.latitude + "<br/>" + "Longitude: " + datum.value.longitude
             };
          }else{
            $scope.marks[datum.uuid.replace(/-/g,"")] = {lat: parseFloat(datum.value.latitude), lng: parseFloat(datum.value.longitude), message: "Site Name: " + datum.value.name + "<br/>" + "Description: " + datum.value.description + "<br/>" + "Latitude: " + datum.value.latitude + "<br/>" + "Longitude: " + datum.value.longitude, draggable:false}
            $scope.savedItems = {
                 "id":100,
                 "geoJSON": {
                     "type": "Feature",
                     "geometry": {
                         "type": "Point",
                         "coordinates": datum.value.loc.coordinates

                     }
                 },
                 "message": "Site Name: " + datum.value.name + "<br/>" + "Description: " + datum.value.description + "<br/>" + "Latitude: " + datum.value.latitude + "<br/>" + "Longitude: " + datum.value.longitude
             };
          }
        }else{
          //var myLayer = L.geoJSON().addTo(map);
          //myLayer.addData(datum.value.loc.coordinates);
          //$scope.leafletDirectiveMap
          console.log(angular.toJson(datum))
          $scope.savedItems = {
               "id":100,
               "geoJSON": {
                   "type": "Feature",
                   "geometry": {
                       "type": "Polygon",
                       "coordinates": datum.value.loc.coordinates

                   }
               }
           };

        /*  drawnItems.addLayer({
              data: datum.value.loc,
              style: {
                  fillColor: "green",
                  weight: 2,
                  opacity: 1,
                  color: 'green',
                  dashArray: '3',
                  fillOpacity: 0.5
              }
            })*/
         /*angular.extend($scope, {
            geojson: {
              data: datum.value.loc,
              style: {
                  fillColor: "green",
                  weight: 2,
                  opacity: 1,
                  color: 'green',
                  dashArray: '3',
                  fillOpacity: 0.5
              }
            }
          });*/
        }//close else
      
        L.geoJson($scope.savedItems.geoJSON, {
                style: function(feature) {
                    return {
                      fillColor: "green",
                      weight: 2,
                      opacity: 1,
                      color: 'green',
                      dashArray: '3',
                      fillOpacity: 0.5
                    };
                },
              onEachFeature: function (feature, layer) {
                drawnItems.addLayer(layer);

              }
            });
            angular.element('.leaflet-draw-toolbar-top').hide();
      //$scope.markers = $scope.marks
      }//close if
  }//close function

  $scope.getModalMetadatum();
  /******** LEAFLET **************/
  $scope.markers = [];
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
					google: {
						name: 'Google Satellite',
						url: 'http://www.google.com/maps/vt?lyrs=y@189&gl=en&x={x}&y={y}&z={z}',
						type: 'xyz'
					},
					googleStreet: {
						name: 'Google Roads',
						url: 'http://www.google.com/maps/vt?lyrs=m@189&gl=en&x={x}&y={y}&z={z}',
						type: 'xyz'
					},
					/*osm: {
					name: 'OpenStreetMap',
					url: 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
					type: 'xyz'
					}*/
					
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
      default:{
        attributionControl: false
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
          marker: true
        },
        edit: {
          featureGroup: drawnItems,
          remove: true
        }
      }
    }
  });

  /*$scope.$on('leafletDirectiveMap.click', function(event, args){
   //clear markers
   $scope.markers=[];
   //$scope.markers = $scope.marks;
   //add marker where click occured
   $scope.markers.push({
                lat: args.leafletEvent.latlng.lat,
                lng: args.leafletEvent.latlng.lng,
                message: "My Added Marker"
            });
   //set metadata form lat and long values
   $scope.model['longitude'] = args.leafletEvent.latlng.lng;
   $scope.model['latitude'] = args.leafletEvent.latlng.lat;

  });
  */

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

  var handle = {
    created: function(e,leafletEvent, leafletObject, model, modelName) {
      drawnItems.addLayer(leafletEvent.layer);
      //hide toolbar
      angular.element('.leaflet-draw-toolbar-top').hide();
      ///alert(angular.toJson(angular.fromJson(drawnItems.toGeoJSON()).features[0].geometry.coordinates));
      console.log(angular.toJson(angular.fromJson(drawnItems.toGeoJSON()).features[0].geometry.coordinates))
      if(String(angular.toJson(angular.fromJson(drawnItems.toGeoJSON()).features[0].geometry.type)) == '"Point"'){
        coordinates = angular.fromJson(drawnItems.toGeoJSON()).features[0].geometry.coordinates
        $scope.model['longitude'] = parseFloat(coordinates[0]);
        $scope.model['latitude'] = parseFloat(coordinates[1]);
        $scope.model['polygon'] = "";
    }
    else{
        centroid = drawnItems.getBounds().getCenter();

        $scope.model['longitude'] = centroid.lng;
        $scope.model['latitude'] = centroid.lat;
        $scope.model['polygon'] = angular.toJson(angular.fromJson(drawnItems.toGeoJSON()).features[0].geometry.coordinates);
    }
      //drawControl.hideDrawTools();

    },
    edited: function(arg) {},
    deleted: function(e,leafletEvent, leafletObject, model, modelName) {
    //  drawnItems.removeLayers(leafletEvent.layer);
      if (angular.fromJson(drawnItems.toGeoJSON()).features[0] == null){
        angular.element('.leaflet-draw-toolbar-top').show();
      }
    },
    drawstart: function(arg) {
      $scope.markers=[]
    },
    drawstop: function(arg) {},
    editstart: function(arg) {
      console.log(angular.toJson(angular.fromJson(drawnItems.toGeoJSON()).features[0].geometry.coordinates))
      if(String(angular.toJson(angular.fromJson(drawnItems.toGeoJSON()).features[0].geometry.type)) == '"Point"'){
        coordinates = angular.fromJson(drawnItems.toGeoJSON()).features[0].geometry.coordinates
        $scope.model['longitude'] = parseFloat(coordinates[0]);
        $scope.model['latitude'] = parseFloat(coordinates[1]);
        $scope.model['polygon'] = "";
      }
      else{
          centroid = drawnItems.getBounds().getCenter();

          $scope.model['longitude'] = centroid.lng;
          $scope.model['latitude'] = centroid.lat;
          $scope.model['polygon'] = angular.toJson(angular.fromJson(drawnItems.toGeoJSON()).features[0].geometry.coordinates);
      }
    },
    editstop: function(arg) {
      console.log(angular.toJson(angular.fromJson(drawnItems.toGeoJSON()).features[0].geometry.coordinates))
      if(String(angular.toJson(angular.fromJson(drawnItems.toGeoJSON()).features[0].geometry.type)) == '"Point"'){
        coordinates = angular.fromJson(drawnItems.toGeoJSON()).features[0].geometry.coordinates
        $scope.model['longitude'] = parseFloat(coordinates[0]);
        $scope.model['latitude'] = parseFloat(coordinates[1]);
        $scope.model['polygon'] = "";
      }
      else{
          centroid = drawnItems.getBounds().getCenter();

          $scope.model['longitude'] = centroid.lng;
          $scope.model['latitude'] = centroid.lat;
          $scope.model['polygon'] = angular.toJson(angular.fromJson(drawnItems.toGeoJSON()).features[0].geometry.coordinates);
      }
    },
    deletestart: function(arg) {
      /*drawnItems.clearLayers();
      if (angular.fromJson(drawnItems.toGeoJSON()).features[0] == null){
        angular.element('.leaflet-draw-toolbar-top').show();
      }*/
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
});
