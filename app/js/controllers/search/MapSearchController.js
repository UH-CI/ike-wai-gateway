angular.module('AgaveToGo').controller('MapSearchController', function ($scope, $state, $translate, $uibModal, $rootScope, $localStorage, $filter, MetaController, FilesController, ActionsService, MessageService, MetadataService, FilesMetadataService, leafletDrawEvents) {
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
    $scope.approvedSchema = ['Well','Site','Variable','DataDescriptor']
    $scope.queryLimit = 99999;

    $scope.offset = 0;
    $scope.limit = 10;

    $scope.sortType = 'name';
    $scope.sortReverse  = true;
    $scope.status = 'active';
    $scope.available = true;
    $scope.query = "{'name':{'$in': ['" + $scope.approvedSchema.join("','") +"'] }},{'_links.associationIds':1,'value.name':1,'name':1,'value.well_name':1,'value.wid':1}";
    $scope.filequery="{$or:[{'value.published':'True'},{'name':'PublishedFile'}]}";
    //$scope.schemaQuery = "{'schema.title':{'$in': ['" + $scope.approvedSchema.join("','") +"'] }}"

    $scope.schemaBox = {val1:true,val2:true};
    $scope.wellbox = true;
    $scope.searchField = {value:''}
    $scope.files_hrefs=[]
    $scope.file_uuids =[]

    $scope.sortType= 'href';
    $scope.sortReverse = false;

    $scope.wellSortType ='value.well_name'
    $scope.siteSortType ='value.name'
    $scope.varSortType ='value.variable_name'
    $scope.wellSortReverse = true;
    $scope.siteSortReverse = true;
    $scope.varSortReverse = false;
    $scope.filtered_files = []
    $scope.culled_metadata = []


    $scope.parseFiles = function(){
      //fetch related file metadata objects
      $scope.files = []
      $scope.files_hrefs =[]
      $scope.file_uuids =[]
      $scope.wqsites = []
      $scope.file_hash ={}
      $scope.metadata_hash={}
      $scope.metadata_file_hash = {}
      $scope.facet_count = {} //store number of file  associated as count
      $scope.culled_metadata = []
      $scope.culled_metadata_uuids = []
      angular.forEach($scope.filemetadata, function(val, key){
        $scope.metadata_hash[val.uuid] = val; //index all metadata by uuid
        if (val._links.associationIds.length > 0){
          angular.forEach(val._links.associationIds, function(value, key){
            if(value.href != null){
              if(value.title == "file" && value.href.includes('ikewai-annotated-data')){
                if($scope.culled_metadata_uuids.indexOf(val.uuid) < 0){
                    $scope.culled_metadata.push(val)
                    $scope.culled_metadata_uuids.push(val.uuid)
                    $scope.facet_count[val.uuid] = 1
                    $scope.metadata_file_hash[val.uuid] = [value];
                }
                else{
                  $scope.metadata_file_hash[val.uuid].push(value)
                  $scope.facet_count[val.uuid] = $scope.facet_count[val.uuid] +1;
                }
                if( $scope.files_hrefs.indexOf(value.href) < 0){
                  $scope.files_hrefs.push(value.href)
                  $scope.files.push(value)
                  $scope.file_uuids.push(value.rel)
                  $scope.file_hash[value.rel] = value;
                }
              }
            }
          })
        }
        else if(val.name == "Water_Quality_Site" ){
          if(val.value.resultCount >0){
            $scope.culled_metadata.push(val)
            $scope.wqsites.push(val)
          }
        }
      })
      $scope.filtered_files = $scope.files;
      $scope.fetchFacetMetadata();
      $scope.requesting=false;
    }

     $scope.doSearch = function(){
       $scope.requesting=true;
       MetaController.listMetadata($scope.filequery,limit=10000,offset=0).then(
           function (response) {
             $scope.filemetadata= response.result;
             //angular.extend($scope.filemetadata, $scope.metadata);
             $scope.parseFiles();
          },
          function(response){
            MessageService.handle(response, $translate.instant('error_metadata_list'));
            $scope.requesting = false;
          }
       );
     }


    $scope.textSearch = function(){
      if ($scope.selectedMetadata != null){
        $scope.filequery = "{$and:[{$text:{$search:'"+$scope.searchField.value+"'},{'value.published':'True'}]}";
      }
      else{
        $scope.filequery="{$or:[{'value.published':'True'},{'name':'PublishedFile'}]}";
      }
      $scope.doSearch();
    }

    //This should just take existing results and filter them - not a new search
    $scope.facetSearch = function(){
      $scope.requesting = true;
      new_filtered_files = []
      if ($scope.selectedMetadata != ''){
        angular.forEach($scope.selectedMetadata, function(uuid){
          if (uuid != undefined){
            angular.forEach($scope.metadata_file_hash[uuid] , function(file){
              new_filtered_files.push(file)
            })
          }
        })
        console.log(new_filtered_files)
        $scope.filtered_files = new_filtered_files;
        $scope.requesting = false;
        //$scope.filequery = "{'uuid':{$in:['"+$scope.selectedMetadata.join('\',\'')+"']}}";

        //$scope.filequery ="{$and: [{'uuid':{$in:['"+$scope.selectedMetadata.join('\',\'')+"']}},{'name':{'$in':['Site','Well','Water_Quality_Site']}}, {'value.loc': {$geoWithin: {'$geometry':"+angular.toJson(angular.fromJson(drawnItems.toGeoJSON()).features[0].geometry).replace(/"/g,'\'')+"}}}]}"
      }
      else{
        $scope.filtered_files = $scope.files;
        $scope.requesting = false;
        //$scope.filequery = "{$or:[{'value.published':'True'},{'name':'PublishedFile'}]}";
      }
      //$scope.doSearch();
    }

    $scope.spatialSearch = function(){
        //if ($scope.selectedMetadata != ''){

          //$scope.filequery = "{'value.loc': {$geoWithin: {'$geometry':"+angular.toJson(angular.fromJson(drawnItems.toGeoJSON()).features[0].geometry).replace(/"/g,'\'')+"}}}";
          $scope.filequery = "{$and: [{'name':{'$in':['Site','Well','Water_Quality_Site']}}, {'value.loc': {$geoWithin: {'$geometry':"+angular.toJson(angular.fromJson(drawnItems.toGeoJSON()).features[0].geometry).replace(/"/g,'\'')+"}}}]}";
        //else{
        //  $scope.filequery = "{$or:[{'value.published':'True'},{'name':'PublishedFile'}]}";
        //}
        $scope.doSearch();
      }

    $scope.searchAll = function(){
      //alert($scope.filter)
      $scope.requesting = true;
        var orquery = {}
        var andquery = {}
        var fileandquery = {}
        var queryarray = []
        var andarray = []
        var fileandarray = []
        var innerquery = {}
        var typearray = []
        if ($scope.searchField.value != ''){
          angular.forEach($scope.metadataschema, function(value, key){
            //alert(angular.toJson(value))
            if($scope.approvedSchema.indexOf(value.schema.title) > -1){
              angular.forEach(value.schema.properties, function(val, key){
                var valquery = {}
                valquery['value.'+key] = {$regex: $scope.searchField.value, '$options':'i'}
                queryarray.push(valquery)
              })
            }
          })
          queryarray.push({'value.filename':{$regex: $scope.searchField.value, '$options':'i'}})
          orquery['$or'] = queryarray;
       }
        var typequery = {}

        if ($scope.schemaBox.val1){
          typearray.push('Site')
        }
        if ($scope.schemaBox.val2){
          typearray.push('Well')
        }
        typequery['name'] = {'$in': typearray}
        andarray.push(typequery)
        andarray.push(orquery)
        andquery['$and'] = andarray;
        $scope.query = JSON.stringify(andquery).replace(/"/g, "'");
        fileandarray.push({'name':'PublishedFile'})
        fileandarray.push(orquery)
        fileandquery['$and'] = fileandarray;
        $scope.filequery = JSON.stringify(fileandquery).replace(/"/g, "'");
        $scope.doSearch();
    }

    $scope.refresh = function() {
      $scope.requesting = true;
      MetaController.listMetadataSchema($scope.schemaQuery)
      .then(function(response){
				$scope.metadataschema = response.result;
      })
      $scope.fetchFacetMetadata();
      $scope.requesting = false;
      //$scope.doSearch();
    };

    var intersection = function(){
      return Array.from(arguments).reduce(function(previous, current){
        return previous.filter(function(element){
          return current.indexOf(element) > -1;
        });
      });
    };

    $scope.updateMap = function(){
      if ($scope.culled_metadata && $scope.culled_metadata.length > 0){
        console.log("culled_metadata length: " + $scope.culled_metadata.length)
        $scope.siteMarkers = $filter('filter')($scope.culled_metadata, {name: "Site"});
        $scope.wellMarkers = $filter('filter')($scope.culled_metadata, {name: "Well"});
        $scope.wqsMarkers = $filter('filter')($scope.culled_metadata, {name: "Water_Quality_Site"});
              console.log("site: "+$scope.siteMarkers.length +", well: "+$scope.wellMarkers.length +", wqs: "+$scope.wqsMarkers.length)
        $scope.marks = {};
        $scope.layers.overlays = {};
        if ($scope.siteMarkers && $scope.siteMarkers.length > 0){
          $scope.layers.overlays['ikewai_sites']={
                          name: 'Ike Wai Sites',
                          type: 'group',
                          visible: true
                      }
        }
        if ($scope.wellMarkers && $scope.wellMarkers.length > 0){
          $scope.layers.overlays['ikewai_wells']={
                          name: 'Ike Wai Wells',
                          type: 'group',
                          visible: true
                      }
        }
        if ($scope.wqsMarkers &&  $scope.wqsMarkers.length > 0){
        $scope.layers.overlays['water_quality_sites']= {
                          name: 'Water Quality Sites',
                          type: 'group',
                          visible: true
                      }
        }
        angular.forEach($scope.siteMarkers, function(datum) {
            if(datum.value.loc != undefined && datum.value.name != undefined){
              if(datum.value.loc.type == 'Point'){
                $scope.marks[datum.value.name.replace("-"," ")] = {lat: parseFloat(datum.value.latitude), lng: parseFloat(datum.value.longitude), message: datum.value.description, draggable:false, layer:'ikewai_sites'}
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
            $scope.marks[datum.value.wid.replace(/-/g,"")] ={lat: parseFloat(datum.value.latitude), lng: parseFloat(datum.value.longitude), message: "Well ID: " + datum.value.wid.replace(' ','-') + "<br/>" + "Well Name: " + datum.value.well_name + "<br/>" + "Latitude: " + datum.value.latitude + "<br/>" + "Longitude: " + datum.value.longitude, draggable:false, layer:'ikewai_wells'}
          }
        });
        angular.forEach($scope.wqsMarkers, function(datum) {
            if(datum.value.latitude != undefined && datum.value.name !=undefined){
            $scope.marks[datum.value.name.replace(/-/g," ")] = {lat: parseFloat(datum.value.latitude), lng: parseFloat(datum.value.longitude), message:  "Name: " + datum.value.name + "<br/>" + "Latitude: " + datum.value.latitude + "<br/>" + "Longitude: " + datum.value.longitude, draggable:false, layer:'water_quality_sites'}
          }
        });
        $scope.markers = $scope.marks
      }
    }

    $scope.fetchFacetMetadata = function(){
        $scope.facet_wells =[]
        $scope.facet_sites =[]
        $scope.facet_variables =[]
        $scope.markers = [];
        angular.forEach($scope.culled_metadata, function(datum){
            if(datum.name == 'Well'){
                $scope.facet_wells.push(datum)
                /*if(datum.value.latitude != undefined){
                    $scope.markers.push({lat: parseFloat(datum.value.latitude), lng: parseFloat(datum.value.longitude), message: "Well ID: " + datum.value.wid + "<br/>" + "Well Name: " + datum.value.well_name + "<br/>" + "Latitude: " + datum.value.latitude + "<br/>" + "Longitude: " + datum.value.longitude, draggable:false})
                }*/
            }else if(datum.name == 'Site'){
                $scope.facet_sites.push(datum)
                /*if(datum.value.latitude != undefined){
                    $scope.markers.push({lat: datum.value.latitude, lng: datum.value.longitude, message: datum.value.description, draggable:false})
                }*/
            }

        })
        $scope.updateMap();
        MetaController.listMetadata("{'name':'Variable','value.published':'True','associationIds':{$in:['"+ $scope.file_uuids.join('\',\'')+"']}}",limit=1000,offset=0)
        .then(function(response){
            $scope.facet_variables = response.result;
            angular.forEach($scope.facet_variables, function(datum){
              $scope.metadata_hash[datum.uuid] = datum;
              file_uuids = intersection(datum.associationIds, $scope.file_uuids)
              $scope.facet_count[datum.uuid] = file_uuids.length;
              angular.forEach(file_uuids, function(file_uuid){
                if ($scope.metadata_file_hash[datum.uuid] == undefined){
                  $scope.metadata_file_hash[datum.uuid] = [$scope.file_hash[file_uuid]]
                }else{
                  $scope.metadata_file_hash[datum.uuid].push($scope.file_hash[file_uuid])
                }
              })
              /*if ($scope.facet_count[datum.uuid] == undefined){
                $scope.facet_count[datum.uuid] =1
              }else{
                $scope.facet_count[datum.uuid] = $scope.facet_count[datum.uuid] +1;
              }*/
            })
        })
    };

    $scope.searchTools = function(query){
      $scope.requesting = true;
      if (query !=''){
        $scope.query = query;
        jsonquery = angular.fromJson(query.replace(/'/g, '"'))
        jsonquery['$and'][0]['name']['$in']=['PublishedFile'];
        $scope.filequery = JSON.stringify(jsonquery);
      }
      else{
        $scope.query = "{'name':{'$in': ['" + $scope.approvedSchema.join("','") +"'] }},{'_links.associationIds':1,'value.name':1,'name':1,'value.well_name':1,'value.wid':1}";
        $scope.filequery ="{'name':'PublishedFile'}"
      }
      $scope.doSearch();
    };


    $scope.refresh();

    $rootScope.$on("metadataUpdated", function(){
      $scope.refresh();
    });

    $scope.confirmAction = function(resourceType, resource, resourceAction, resourceList, resourceIndex){
      ActionsService.confirmAction(resourceType, resource, resourceAction, resourceList, resourceIndex);
    };

    $scope.download = function(file_url){
      $scope.requesting = true;
      FilesMetadataService.downloadSelected(file_url).then(function(result){
        $scope.requesting = false;
      });
    }


    $scope.selectedMetadata=[]
    // Toggle selection for a given fruit by name
     $scope.toggleSelectedMetadata = function(uuid) {
    var idx = $scope.selectedMetadata.indexOf(uuid);

    // Is currently selected
    if (idx > -1) {

        $scope.selectedMetadata.splice(idx, 1);

    }

    // Is newly selected
    else {
      $scope.selectedMetadata.push(uuid);
    }
  };
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
    angular.element('#search_button').removeAttr("disabled");
    //drawControl.hideDrawTools();
    //alert(angular.toJson(angular.fromJson(drawnItems.toGeoJSON()).features[0].geometry));
  },
  edited: function(arg) {},
  deleted: function(arg) {
    if (angular.fromJson(drawnItems.toGeoJSON()).features[0] == null){
      angular.element('.leaflet-draw-toolbar-top').show();
      angular.element('#search_button').attr("disabled", "disabled");
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
    $scope.viewFileAnnotations = function(fileUuid,filePath){
        $state.go("filemetadata-multipleadd",{'fileUuids': fileUuid,'filePaths':filePath});
    }

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

    $scope.openAnnotation = function (fileuuid, filepath) {
    	$scope.fileuuid = fileuuid;
      $scope.filepath = filepath;//.split('ikewai-annotated-data/')[1].join('');
        var modalInstance = $uibModal.open({
          animation: $scope.animationsEnabled,
          templateUrl: 'views/filemetadata/resource/resource.html',
          controller: 'ModalFilemetadataResourceDetailsController',
          scope: $scope,
          size: 'lg',
          resolve: {

          }
        }
      );
    };
});
