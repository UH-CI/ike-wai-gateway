angular.module('AgaveToGo').controller('MetadataController', function ($scope, $state, $filter,$translate, $uibModal, $rootScope, $localStorage, MetaController, FilesController, ActionsService, MessageService, MetadataService, leafletDrawEvents) {
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

    $scope.approvedSchema = ['Well','Site','Water_Quality_Site','Variable','Person','Timeseries_Template','DataDescriptor','Organization']
    $scope.selectedSchema = ['Well','Site','Water_Quality_Site','Variable','Person','Timeseries_Template','DataDescriptor','Organization']

    $scope.queryLimit = 99999;

    $scope.offset = 0;
    $scope.limit = 10;

    $scope.sortType = 'name';
    $scope.sortReverse  = true;
    $scope.status = 'active';
    $scope.available = true;
    $scope.query = "{'name':{'$in': ['" + $scope.approvedSchema.join("','") +"'] }}";
    $scope.schemaQuery = "{'schema.title':{'$in': ['" + $scope.approvedSchema.join("','") +"'] }}"

    $scope.schemaBox = {val1:false,val2:false,val3:false,val4:false,val5:false,val6:false,val7:false,val8:false,val9:false};
    $scope.wellbox = true;
    $scope.searchField = {value:''}

    $scope.searchAll = function(){
      //alert($scope.filter)
      $scope.requesting = true;
        var orquery = {}
        var andquery = {}
        var queryarray = []
        var andarray = []
        var innerquery = {}
        var typearray = []
        var typequery = {}

        if ($scope.schemaBox.val1){
          typearray.push('Site')
        }
        if ($scope.schemaBox.val2){
          typearray.push('Well')
        }
        if ($scope.schemaBox.val3){
          typearray.push('Variable')
        }
        if ($scope.schemaBox.val4){
          typearray.push('Person')
        }
        if ($scope.schemaBox.val5){
          typearray.push('Water_Quality_Site')
        }
        if ($scope.schemaBox.val6){
          typearray.push('Timeseries')
        }
        if ($scope.schemaBox.val7){
          typearray.push('Timeseries_Template')
        }
        if ($scope.schemaBox.val8){
          typearray.push('DataDescriptor')
        }
        if ($scope.schemaBox.val9){
          typearray.push('Organization')
        }
        // if no schema types are selected, select all
        if (typearray.length == 0) {
          typearray.push('Site');
          typearray.push('Well');
          typearray.push('Variable');
          typearray.push('Person');
          typearray.push('Water_Quality_Site');
          typearray.push('Timeseries');
          typearray.push('Timeseries_Template');
          typearray.push('DataDescriptor');
          typearray.push('Organization');
        }
        // had to move this down here so we only retrieved the fields of schemas that were actually selected.
        // note that this will still fail if too many schema types are selected as the query gets too big.
        if ($scope.searchField.value != ''){
          angular.forEach($scope.metadataschema, function(value, key) {
            if(typearray.indexOf(value.schema.title) > -1 && $scope.approvedSchema.indexOf(value.schema.title) > -1){
              angular.forEach(value.schema.properties, function(val, key){
                var valquery = {}
                valquery['value.'+key] = {$regex: $scope.searchField.value}
                queryarray.push(valquery)
              })
            }
          })
          orquery['$or'] = queryarray;
       }

        typequery['name'] = {'$in': typearray}
        andarray.push(typequery)
        andarray.push(orquery)
        andquery['$and'] = andarray;
        $scope.query = JSON.stringify(andquery);

        MetaController.listMetadata($scope.query,limit=10000,offset=0).then(
          function (response) {
            $scope.totalItems = response.result.length;
            $scope.pagesTotal = Math.ceil(response.result.length / $scope.limit);
            $scope[$scope._COLLECTION_NAME] = response.result;

            $scope.siteMarkers = $filter('filter')($scope[$scope._COLLECTION_NAME], {name: "Site"});
            $scope.wellMarkers = $filter('filter')($scope[$scope._COLLECTION_NAME], {name: "Well"});
            $scope.waterQualitySiteMarkers = $filter('filter')($scope[$scope._COLLECTION_NAME], {name: "Water_Quality_Site"});
            //{ "value": {"latitude": '!!' }});
            $scope.marks = {};
            angular.forEach($scope.siteMarkers, function(datum) {
                if(datum.value.loc != undefined){
                $scope.marks[datum.value.name.replace("-"," ")] = {lat: datum.value.latitude, lng: datum.value.longitude, message: datum.value.description, draggable:false}
              }
            });
            angular.forEach($scope.wellMarkers, function(datum) {
                if(datum.value.latitude != undefined && datum.value.wid !=undefined){
                $scope.marks[datum.value.wid.replace(/-/g," ")] = {lat: datum.value.latitude, lng: datum.value.longitude, message: "Well ID: " + datum.value.wid + "<br/>" + "Well Name: " + datum.value.well_name + "<br/>" + "Latitude: " + datum.value.latitude + "<br/>" + "Longitude: " + datum.value.longitude, draggable:false}
              }
            });
            angular.forEach($scope.waterQualitySiteMarkers, function(datum) {
              if(datum.value.latitude != undefined && datum.value.wid !=undefined){
                $scope.marks[datum.value.name.replace("-"," ")] = {lat: datum.value.latitude, lng: datum.value.longitude, message: datum.value.description, draggable:false}
              }
          });
            $scope.markers = $scope.marks
            $scope.requesting = false;
          },
          function(response){
            // changed because the message would never go away and it got irritating fast.
            //MessageService.handle(response, $translate.instant('error_metadata_list'));
            App.alert({type: 'danger',message: $translate.instant('error_metadata_list'),closeInSeconds: 5 });
            $scope.requesting = false;
          }
      );
    }

     $scope.spatialSearch = function(){
        //if ($scope.selectedMetadata != ''){
  	     $scope.requesting = true;
          $scope.query = "{$and: [{'name': {'$in':['Well','Site','Water_Quality_Site']}}, {'value.loc': {$geoWithin: {'$geometry':"+angular.toJson(angular.fromJson(drawnItems.toGeoJSON()).features[0].geometry).replace(/"/g,'\'')+"}}}]}";
          $scope.query = "{$and: [{'name': {'$in':['Landuse']}}, {'value.loc': {$geoWithin: {'$geometry':"+angular.toJson(angular.fromJson(drawnItems.toGeoJSON()).features[0].geometry).replace(/"/g,'\'')+"}}}]}";

        //else{
        //  $scope.filequery = "{$or:[{'value.published':'True'},{'name':'PublishedFile'}]}";
        //}
         MetaController.listMetadata($scope.query,limit=10000,offset=0).then(
          function (response) {
            $scope.totalItems = response.result.length;
            $scope.pagesTotal = Math.ceil(response.result.length / $scope.limit);
            $scope[$scope._COLLECTION_NAME] = response.result;

            $scope.siteMarkers = $filter('filter')($scope[$scope._COLLECTION_NAME], {name: "Site"});
            $scope.waterQualitySiteMarkers = $filter('filter')($scope[$scope._COLLECTION_NAME], {name: "Water_Quality_Site"});
            $scope.wellMarkers = $filter('filter')($scope[$scope._COLLECTION_NAME], {name: "Well"});
            //{ "value": {"latitude": '!!' }});
            $scope.marks = {};
            angular.forEach($scope.siteMarkers, function(datum) {
                if(datum.value.loc != undefined){
                $scope.marks[datum.value.name.replace("-"," ")] = {lat: datum.value.latitude, lng: datum.value.longitude, message: datum.value.description, draggable:false}
              }
            });
            angular.forEach($scope.waterQualitySiteMarkers, function(datum) {
              if(datum.value.loc != undefined){
              $scope.marks[datum.value.name.replace("-"," ")] = {lat: datum.value.latitude, lng: datum.value.longitude, message: datum.value.description, draggable:false}
            }
          });
            angular.forEach($scope.wellMarkers, function(datum) {
                if(datum.value.latitude != undefined && datum.value.wid !=undefined){
                $scope.marks[datum.value.wid.replace(/-/g," ")] = {lat: datum.value.latitude, lng: datum.value.longitude, message: "Well ID: " + datum.value.wid + "<br/>" + "Well Name: " + datum.value.well_name + "<br/>" + "Latitude: " + datum.value.latitude + "<br/>" + "Longitude: " + datum.value.longitude, draggable:false}
              }
            });
            $scope.markers = $scope.marks
            $scope.requesting = false;
          },
          function(response){
            MessageService.handle(response, $translate.instant('error_metadata_list'));
            $scope.requesting = false;
          }
         )
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
      $scope.refresh();
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
        circle: {
          showArea: true,
          metric: false,
          shapeOptions: {
            color: '#662d91'
          }
        },
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
          size: 'lg',
          schemaUuid: schemauuid,
          resolve: {

          }
        }
      );
    };

 /*   $scope.openEdit = function (metadatumuuid, size) {
    	$scope.metadataUuid = metadatumuuid;
        var modalInstance = $uibModal.open({
          animation: $scope.animationsEnabled,
          templateUrl: 'views/modals/ModalEditMetadata.html',
          controller: 'ModalMetadataResourceEditController',
                       ModalMetadataResourceEditController
          scope: $scope,
          size: size,
          resolve: {

          }
        }
      );
    };
    */
      $scope.openEdit= function (metadatumuuid, size) {
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

    $scope.confirmAction = function (resourceType, resource, resourceAction, resourceList, resourceIndex) {
      //resource.id = resource.uuid;
      ActionsService.confirmAction(resourceType, resource, resourceAction, resourceList, resourceIndex);
    }

    $scope.deleteMetadata = function (metadatum) {
      $scope.confirmAction("meta", metadatum, 'delete', $scope[$scope._COLLECTION_NAME])
    }

});
