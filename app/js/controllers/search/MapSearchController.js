angular.module('AgaveToGo').controller('MapSearchController', function ($scope, $state, $translate, $uibModal, $rootScope, $localStorage, $filter, MetaController, FilesController, ActionsService, MessageService, MetadataService, FilesMetadataService, leafletDrawEvents,leafletData) {
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
    $scope.approvedSchema = ['Well','Site','Water_Quality_Site','Variable','DataDescriptor','Timeseries','Observation']
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

    $scope.schemaBox = {val1:true,val2:true,val5:true};
    $scope.wellbox = true;
    $scope.searchField = {value:''}
    $scope.files_hrefs=[]
    $scope.file_uuids =[]

    $scope.sortType= 'href';
    $scope.sortReverse = false;

    $scope.wellSortType ='value.well_name'
    $scope.waterQualitySiteSortType ='value.water_quality_site_name'
    $scope.siteSortType ='value.name'
    $scope.varSortType ='value.variable_name'
    $scope.wellSortReverse = true;
    $scope.siteSortReverse = true;
    $scope.varSortReverse = false;
    $scope.filtered_files = []
    $scope.filtered_wqsites = []
    $scope.filtered_timeseries = []
    $scope.filtered_observations = []
    $scope.culled_metadata = []
    $scope.sites_to_search = []
    $scope.csv_json = []
    $scope.filtered_association_ids = [];

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
      $scope.sites_to_search = [] //clear sites
      $scope.filtered_association_ids =[]
      $scope.filtered_association_ids =[]
      angular.forEach($scope.filemetadata, function(val, key){
        $scope.metadata_hash[val.uuid] = val; //index all metadata by uuid
        //$scope.filtered_association_ids = $scope.filtered_association_ids.push(val.uuid)
        if (val.name == "Site" ){//|| val.name == "Well"){
          $scope.sites_to_search.push(val.uuid)
          $scope.culled_metadata.push(val)
        }
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
      $scope.filtered_wqsites = $scope.wqsites;
      console.log("Sites with associations:"+$scope.sites_to_search.length)
      console.log($scope.sites_to_search)
     // $scope.fetchFacetMetadata();
      $scope.observations_query="{'name':'Observation','associationIds':{$in: ['"+$scope.sites_to_search.join("','")+"']}}"
      $scope.timeseries_query="{'name':'Timeseries','associationIds':{$in: ['"+$scope.sites_to_search.join("','")+"']}}"
      console.log($scope.observations_query)
      MetaController.listMetadata($scope.observations_query,limit=1000,offset=0)
      .then(function(response){
        $scope.observations = response.result;
        console.log("OBS:"+$scope.observations )
        $scope.filtered_observations = $scope.observations;
        //$scope.downloadSearchResults();
        $scope.formatObservationsForTable($scope.filtered_observations)

      })
      MetaController.listMetadata($scope.timeseries_query,limit=1000,offset=0)
      .then(function(response){
        $scope.timeseries = response.result;
        console.log("Timeseries:"+$scope.timeseries )
        $scope.filtered_timeseries = $scope.timeseries;
        //angular.forEach($scope.timeseries, function(val, key){
//
  //      })
        $scope.fetchFacetMetadata();
      })
      
      
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
      new_filtered_wqsites = []
      new_filtered_timeseries= [];
      new_filtered_observations = [];
      new_obs_uuids = []
      new_files_uuids = []
      new_wqsites_uuids = []
      new_timeseries_uuids =[]
      $scope.filtered_association_ids =$scope.selectedMetadata ;
      if ($scope.selectedMetadata != ''){
        console.log("selected: "+ $scope.selectedMetadata)
        angular.forEach($scope.selectedMetadata, function(uuid){
  
          if (uuid != undefined){
            //Files
            angular.forEach($scope.metadata_file_hash[uuid] , function(file){
              //if (new_files_uuids.indexOf(file.uuid) < 0){
                new_files_uuids.push(file.uuid)
                new_filtered_files.push(file)
                $scope.filtered_association_ids = $scope.filtered_association_ids.concat(file.associationIds);
              //}
            })
          //WQ Sites  
            angular.forEach($scope.wqsites, function(wqs){
              if (wqs.uuid == uuid){
                if(new_wqsites_uuids.indexOf(wqs.uuid) < 0){
                  new_wqsites_uuids.push  (wqs.uuid)
                  new_filtered_wqsites.push(wqs)
                }
              }
              else if (wqs.associationIds.indexOf(uuid) > -1){
                if(new_wqsites_uuids.indexOf(wqs.uuid) < 0){
                  new_wqsites_uuids.push(wqs.uuid)
                  new_filtered_wqsites.push(wqs)
                }
              }
            })
            //Timeseries
            angular.forEach($scope.timeseries, function(ts){
              if (ts.associationIds.indexOf(uuid) > -1){
                if(new_timeseries_uuids.indexOf(ts.uuid) < 0){
                  new_timeseries_uuids.push(ts.uuid)
                 new_filtered_timeseries.push(ts)
                 $scope.filtered_association_ids = $scope.filtered_association_ids.concat(ts.associationIds);
                }
              }
            })
            //Observations
            angular.forEach($scope.observations, function(obs){
              if (obs.associationIds.indexOf(uuid) > -1){
                if(new_obs_uuids.indexOf(obs.uuid) < 0 ){ 
                  new_obs_uuids.push(obs.uuid)
                  new_filtered_observations.push(obs)
                  $scope.filtered_association_ids = $scope.filtered_association_ids.concat(obs.associationIds);
                }
              }
            })
          }
        })
        console.log("FILETERD FILES: "+new_filtered_files)
        $scope.filtered_files = new_filtered_files;
        $scope.filtered_wqsites = new_filtered_wqsites
        $scope.filtered_timeseries = new_filtered_timeseries;
        $scope.filtered_observations =new_filtered_observations;
        console.log("Subset: " + $scope.filtered_association_ids)
        $scope.updateMap(facet=true);
        $scope.requesting = false;
        //$scope.filequery = "{'uuid':{$in:['"+$scope.selectedMetadata.join('\',\'')+"']}}";

        //$scope.filequery ="{$and: [{'uuid':{$in:['"+$scope.selectedMetadata.join('\',\'')+"']}},{'name':{'$in':['Site','Well','Water_Quality_Site']}}, {'value.loc': {$geoWithin: {'$geometry':"+angular.toJson(angular.fromJson(drawnItems.toGeoJSON()).features[0].geometry).replace(/"/g,'\'')+"}}}]}"
      }
      else{
        $scope.filtered_files = $scope.files;
        $scope.filtered_wqsites = $scope.wqsites;
        $scope.filtered_timeseries = $scope.timeseries;
        $scope.filtered_observations = $scope.observations;
        $scope.requesting = false;
        //$scope.filequery = "{$or:[{'value.published':'True'},{'name':'PublishedFile'}]}";
      }
      //$scope.doSearch();
    }

    $scope.spatialSearch = function(){
        //if ($scope.selectedMetadata != ''){

          //$scope.filequery = "{'value.loc': {$geoWithin: {'$geometry':"+angular.toJson(angular.fromJson(drawnItems.toGeoJSON()).features[0].geometry).replace(/"/g,'\'')+"}}}";
          $scope.filequery = "{$and: [{'name':{'$in':['Site','Well','Water_Quality_Site']}}, {'value.loc': {$geoWithin: {'$geometry':"+angular.toJson(angular.fromJson($scope.drawnItems.toGeoJSON()).features[0].geometry).replace(/"/g,'\'')+"}}}]}";
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
        if ($scope.schemaBox.val5){
          typearray.push('Water_Quality_Site')
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
      //$scope.fetchFacetMetadata();
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
               /* osm: {
                name: 'OpenStreetMap',
                url: 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
                type: 'xyz'
                },*/
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

            },
            overlays:{

            }
        }
      });

      $scope.initializeMap = function(){
        leafletData.getMap("searchMap").then(function(map) {
          
          
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
            angular.element('#search_button').removeAttr("disabled");
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

    */

////////////////////////////
  
    $scope.updateMap = function(facet=false){
      $scope.site_uuids = []
      $scope.well_uuids = []
      if ($scope.culled_metadata && $scope.culled_metadata.length > 0){
        //console.log("culled_metadata length: " + $scope.culled_metadata.length)
        $scope.siteMarkers = $filter('filter')($scope.culled_metadata, {name: "Site"});
        $scope.wellMarkers = $filter('filter')($scope.culled_metadata, {name: "Well"});
        $scope.waterQualitySiteMarkers = $scope.filtered_wqsites;//$filter('filter')($scope.culled_metadata, {name: "Water_Quality_Site"});
        //console.log("site: "+$scope.siteMarkers.length +", well: "+$scope.wellMarkers.length +", wqs: "+$scope.waterQualitySiteMarkers.length)
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
        if ($scope.waterQualitySiteMarkers &&  $scope.waterQualitySiteMarkers.length > 0){
        $scope.layers.overlays['water_quality_sites']= {
                          name: 'Water Quality Sites',
                          type: 'group',
                          visible: true
                      }
        }
        angular.forEach($scope.siteMarkers, function(datum) {
            var render_site = false;
            if(facet){
              if($scope.filtered_association_ids.indexOf(datum.uuid) > -1){
                render_site = true;
              }
              else{
                render_site=false
              }
            }
            else{
              render_site = true;
            }
            if(render_site == true){
              if(datum.value.loc != undefined && datum.value.name != undefined){
                if(datum.value.loc.type == 'Point'){
                  $scope.marks[datum.value.name.replace(/-/g," ")] = {lat: parseFloat(datum.value.latitude), lng: parseFloat(datum.value.longitude), message: datum.value.description, draggable:false, layer:'ikewai_sites'}
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
           }
        });
        angular.forEach($scope.wellMarkers, function(datum) {
           // $scope.well_uuids.push(datum.uuid)
           var render_well = false;
            if(facet){
              if($scope.filtered_association_ids.indexOf(datum.uuid)> -1){
                render_well = true;
              }
              else{
                render_well=false
              }
            }
            else{
              render_well = true;
            }
            if(render_well == true){
              if(datum.value.latitude != undefined && datum.value.wid !=undefined){
                  $scope.marks[datum.value.wid.replace(/-/g,"")] ={lat: parseFloat(datum.value.latitude), lng: parseFloat(datum.value.longitude), message: "Well ID: " + datum.value.wid.replace(' ','-') + "<br/>" + "Well Name: " + datum.value.well_name + "<br/>" + "Latitude: " + datum.value.latitude + "<br/>" + "Longitude: " + datum.value.longitude, draggable:false, layer:'ikewai_wells'}
              }
            }
        });
        angular.forEach($scope.waterQualitySiteMarkers, function(datum) {
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
        $scope.facet_water_quality_sites =[];
        $scope.facet_variables =[]
        $scope.markers = [];
        site_uuids = []
        well_uuids =[]
        wq_uuids = []
        angular.forEach($scope.culled_metadata, function(datum){
            if(datum.name == 'Well'){
              if(well_uuids.indexOf(datum.uuid) < 0){
                well_uuids.push(datum.uuid)
                $scope.facet_wells.push(datum)
              }
                /*if(datum.value.latitude != undefined){
                    $scope.markers.push({lat: parseFloat(datum.value.latitude), lng: parseFloat(datum.value.longitude), message: "Well ID: " + datum.value.wid + "<br/>" + "Well Name: " + datum.value.well_name + "<br/>" + "Latitude: " + datum.value.latitude + "<br/>" + "Longitude: " + datum.value.longitude, draggable:false})
                }*/
            }else if(datum.name == 'Site'){
              if(site_uuids.indexOf(datum.uuid) < 0){
                site_uuids.push(datum.uuid)
                $scope.facet_sites.push(datum)
              }
                /*if(datum.value.latitude != undefined){
                    $scope.markers.push({lat: datum.value.latitude, lng: datum.value.longitude, message: datum.value.description, draggable:false})
                }*/
            }else if(datum.name == 'Water_Quality_Site'){
              if(wq_uuids.indexOf(datum.uuid) < 0){
                wq_uuids.push(datum.uuid)
                $scope.facet_water_quality_sites.push(datum)
              }
              /*if(datum.value.latitude != undefined){
                  $scope.markers.push({lat: datum.value.latitude, lng: datum.value.longitude, message: datum.value.description, draggable:false})
              }*/
          }

        })
        MetaController.listMetadata("{'name':'Variable','value.published':'True','associationIds':{$in:['"+ $scope.file_uuids.join('\',\'')+"']}}",limit=1000,offset=0)
        .then(function(response){
            $scope.facet_variables = response.result;
            angular.forEach($scope.timeseries, function(ts){
              angular.forEach(ts.value.variables, function(vr){
                console.log("timeseries-vars: " + angular.toJson(vr))
                $scope.exists=false;
                angular.forEach($scope.facet_variables, function(fvar){
                  if (fvar['uuid'] == vr['uuid']){
                    $scope.exists = true;
                    console.log(fvar)
                    console.log(vr)
                  }
                })
                if ($scope.exists == false){
                  $scope.facet_variables.push(vr)
                }
                
                
              })  
            })
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
            $scope.updateMap();
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

  $scope.formatObservationsForTable = function(theobs){
    $scope.test_obs = theobs;
    $scope.ts_hash = {}
    //loop through obs
    angular.forEach($scope.test_obs, function(obs) {
      //index by datetime
      //store siteid-var:value
      console.log(obs)
      var siteid = obs.value['site-id'];
      var dt = obs.value['datetime'];  
      if($scope.ts_hash[dt] == null){
        $scope.ts_hash[dt] = {}
      }
      //store observations keyed by datetime so all mathing datetimes are grouped
      angular.forEach(obs.value, function(val,key) {
        if (key != 'site-id' && key != 'datetime'){
          var newkey = siteid + "-"+ key
          $scope.ts_hash[dt][[newkey]] = val;
        }
      })
    })
    console.log("OBS_hash: " + angular.toJson($scope.ts_hash))
    //convert hash to array of hash objects with datetime as field with all measurement field
    //easier for csv conversion
    $scope.csv_json = []
    angular.forEach($scope.ts_hash, function(val,key) {
      var temp = val;
      temp['datetime']= key;
      $scope.csv_json.push(temp);
    })
    console.log("csv_hash: " + angular.toJson($scope.csv_json))
    //Define the header fields and what fields are being pulled 
    var dataFields = ['datetime'];
    angular.forEach($scope.csv_json, function(row) {
      angular.forEach(row, function(value, key) {
        if(dataFields.indexOf(key) < 0 ){
          dataFields.push(key);
        }
      })
    })
    $scope.header = dataFields;
  }

  $scope.downloadCSVObservations = function(){
    $scope.downloadObservations($scope.filtered_observations)
  }
  $scope.downloadObservations = function(theobs){
    $scope.requesting = true;
    $scope.test_obs = theobs;
    $scope.ts_hash = {}
    //loop through obs
    angular.forEach($scope.test_obs, function(obs) {
      //index by datetime
      //store siteid-var:value
      console.log(obs)
      var siteid = obs.value['site-id'];
      var dt = obs.value['datetime'];  
      if($scope.ts_hash[dt] == null){
        $scope.ts_hash[dt] = {}
      }
      //store observations keyed by datetime so all mathing datetimes are grouped
      angular.forEach(obs.value, function(val,key) {
        if (key != 'site-id' && key != 'datetime'){
          var newkey = siteid + "-"+ key
          $scope.ts_hash[dt][[newkey]] = val;
        }
      })
    })
    console.log("OBS_hash: " + angular.toJson($scope.ts_hash))
    //convert hash to array of hash objects with datetime as field with all measurement field
    //easier for csv conversion
    $scope.csv_json = []
    angular.forEach($scope.ts_hash, function(val,key) {
      var temp = val;
      temp['datetime']= key;
      $scope.csv_json.push(temp);
    })
    console.log("csv_hash: " + angular.toJson($scope.csv_json))
    //Define the header fields and what fields are being pulled 
    var dataFields = ['datetime'];
    angular.forEach($scope.csv_json, function(row) {
      angular.forEach(row, function(value, key) {
        if(dataFields.indexOf(key) < 0 ){
          dataFields.push(key);
        }
      })
    })
    $scope.header = dataFields;
    console.log()
    console.log(dataFields)
    // START populating csv content
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
    $scope.metadata = $scope.csv_json;
    for (var i = 0; i < $scope.metadata.length; i++) {
      var metadatum = $scope.metadata[i];
        for (var c = 0; c < dataFields.length; c++) {
          var keyName = dataFields[c].split('.');
          var tempDataObject = metadatum;
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

    // START download data to file
    // from: https://stackoverflow.com/questions/38462894/how-to-create-and-save-file-to-local-filesystem-using-angularjs
    var filename = 'Observations.csv';
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
    $scope.requesting = false
  }
  $scope.load_test = function(){
    $.getJSON("/assets/obs.json", function(json) {
      console.log(json); // this will show the info it in firebug console
      //$scope.test_obs = json.result;
      $scope.downloadObservations(json.result)
    });
  }



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
