angular.module('AgaveToGo').controller("ModalMetadataResourceCreateController", function($scope, $modalInstance, $state, $translate, $window, $rootScope, $timeout, $filter, MetaController, MetadataService, ActionsService, FilesMetadataService, MessageService, leafletDrawEvents) {


	$scope.close = function () {
	  $modalInstance.close();
	};

	$scope.model = {};

	$scope.schemaQuery ='';
	//$scope.approvedSchema = ['Well','Site','Person','Organization','Subject','Location','Variable'];
	$scope.approvedSchema = ['Well','Site','Water_Quality_Site','Person','Organization','Location','Variable'];
	var selectedSchemaUuid = '';

	$scope.initialize = function() {
		selectedSchemaUuid = this.$parent.selectedSchemaUuid;
		$scope.refresh();
	}

	$scope.changeSchema = function(schemauuid) {
		selectedSchemaUuid = schemauuid;
		$scope.refresh();
	}

	$scope.fetchMetadataSchema = function() {
		$scope.requesting = true;

		MetaController.getMetadataSchema(selectedSchemaUuid)
			.then(
				function(response){

					$scope.selectedmetadataschema = response.result;//[0];
					var formschema = {};
					formschema["type"]="object";
					formschema["properties"] = $scope.selectedmetadataschema.schema.properties;
					formschema["required"] = $scope.selectedmetadataschema.schema.required;
					$scope.schema = formschema;
					$scope.form = [
						"*"/*,
						{
							type: "submit",
							title: "Save"
						}*/
					];
					$scope.schema_selected = true;
					$scope.requesting = false;
				}
		);
	}

	$scope.refresh = function() {
		$scope.requesting = true;

		MetaController.listMetadataSchema(
			$scope.schemaQuery
		).then(function (response) {
			$scope.metadataschema = response.result;
			$scope.fetchMetadataSchema();
		})

		
	};


	$scope.onSubmit = function(form) {
		$scope.requesting = true;
		$scope.$broadcast('schemaFormValidate');
		// Then we check if the form is valid
		//alert(angular.toJson($scope.model))
		if (form.$valid) {

			var body = {};
			body.name = $scope.selectedmetadataschema.schema.title;
			body.value = $scope.model;
			body.schemaId = $scope.selectedmetadataschema.uuid;
			//check for latitude - if there then store a geojson point
			if($scope.model.latitude){
					body.value["loc"] = {"type":"Point", "coordinates":[$scope.model.longitude,$scope.model.latitude]}
					body.geospatial= true;
			}
			if($scope.model.polygon){
				body.value["loc"] = {"type":"Polygon", "coordinates": JSON.parse($scope.model.polygon)}
				body.geospatial= true;
			}

			//should be able to create metadata object with permissions set BUT not working at the moment
			//body.permissions = [{"username":"public","permission":"READ"},{"username":"seanbc","permission":"ALL"},{"username":"jgeis","permission":"ALL"},{"username":"ike-admin","permission":"ALL"}];

		 	MetaController.addMetadata(body)
				.then(
					function(response){
						$scope.metadataUuid = response.result.uuid;
						//add the default permissions for the system in addition to the owners
						MetadataService.addDefaultPermissions($scope.metadataUuid);

						var metaName = response.result.name;

						// don't do associations for any person or organization metadata objects
						//if (metaName != "Person" && metaName != "Organization" && metaName != "Subject") {
						if (metaName != "Person" 
								&& metaName != "Organization" 
								&& metaName != "Newspaper" 
								&& metaName != "Translator" 
								&& metaName != "Author") {
							//check if this is for a data descriptor object or just a new metadata creation
							if ($scope.data_descriptor_metadatum){
								console.log($scope.data_descriptor_metadatum)
								$scope.dd_object = [$scope.data_descriptor_metadatum]
								FilesMetadataService.addAssociations($scope.dd_object, $scope.metadataUuid)
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
							App.alert({message: "Successfully Created "+ " " + metaName,closeInSeconds: 5  });
							$rootScope.$broadcast('metadataUpdated');
							$scope.close();
						}
						//else if (metaName === "Person" || metaName === "Organization" || metaName === "Subject" ) {
						else if (metaName === "Person" 
						|| metaName === "Organization" 
						|| metaName === "Newspaper" 
						|| metaName === "Translator" 
						|| metaName === "Author") {
							$rootScope.$broadcast('metadataPersonOrgOrSubjectUpdated', { type: metaName, value: response.result});
							App.alert({message: "Successfully Created "+ " " + metaName,closeInSeconds: 5  });
						    $scope.close();
						}
					},
					function(response){
						MessageService.handle(response, $translate.instant('error_metadata_add'));
						$scope.requesting = false;
					}
				);
			}
			else{
				$scope.requesting = false;
			}

	};
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
	    drawOptions: {
	      position: "bottomright",
	      draw: {
	        polyline: true,
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
				console.log(angular.fromJson(drawnItems.toGeoJSON()).features[0].geometry)
		}
	    //drawControl.hideDrawTools();

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


	$scope.initialize();
});
