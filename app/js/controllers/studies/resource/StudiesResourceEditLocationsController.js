angular.module('AgaveToGo').controller('StudiesResourceEditLocationsController', function($scope, $stateParams, $state, $translate, $timeout, $filter, MetaController, PostitsController, FilesMetadataService, ActionsService, MessageService, MetadataService) {
  $scope._COLLECTION_NAME = 'metadata';
  $scope._RESOURCE_NAME = 'metadatum';
  $scope.model = {};


  $scope.queryLimit = 99999;

  $scope.offset = 0;
  $scope.limit = 10000;

  $scope.sortType = 'name';
  $scope.sortReverse  = true;
  $scope.status = 'active';
  $scope.available = true;

  $scope.metadatum = null;
  $scope.query = '';
  $scope.marks={};
  $scope.fetchMetadataSchema = function(schemauuid) {
    $scope.requesting = true;
    MetaController.getMetadataSchema(schemauuid)
      .then(
        function(response){
          $scope.selectedmetadataschema = response.result;
          var formschema = {};
          formschema["type"]="object";
          formschema["properties"] = $scope.selectedmetadataschema.schema.properties;
          formschema["required"] = $scope.selectedmetadataschema.schema.required;
          $scope.schema = formschema;
          $scope.form = [
            "*",
            {
              type: "submit",
              title: "Save"
            }
          ];
          $scope.schema_selected = true;
          $scope.requesting = false;
        }
    );
  }
  $scope.fetchSchemaList = function(){
    MetaController.listMetadataSchema(
    ''//{"$or":[{"title":"Well"},{"title":"Site"}]}'
  ).then(function(response){
    $scope.metadataschema =  response.result;
    $scope.requesting = false;
  })
  }

  $scope.getMetadatum = function(){
    $scope.fetchSchemaList();
    $scope.requesting = true;
    if ($stateParams.id !== ''){
      MetaController.getMetadata($stateParams.id)
        .then(
          function(response){
            $scope.metadatum = response.result;
            $scope.requesting = false;
            $scope.fetchLocations();

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
  $scope.fetchLocations = function(){

    if($scope.metadatum.associationIds.length == 0){
      $scope.query = '{"uuid":{"$in":[]}}';
    }
    else{
      $scope.query = '{"uuid":{"$in":'+angular.toJson($scope.metadatum.associationIds)+'}}';
    }
    MetaController.listMetadata(
      $scope.query
    )
      .then(
        function (response) {
          $scope.totalItems = response.result.length;
          $scope.pagesTotal = Math.ceil(response.result.length / $scope.limit);
          $scope[$scope._COLLECTION_NAME] = response.result;
          $scope.siteMarkers = $filter('filter')($scope[$scope._COLLECTION_NAME], {name: "Site"});
          $scope.wellMarkers = $filter('filter')($scope[$scope._COLLECTION_NAME], {name: "Well"});
          //{ "value": {"latitude": '!!' }});
          $scope.marks = {};
          angular.forEach($scope.siteMarkers, function(datum) {
              if(datum.value.loc != undefined){
              $scope.marks[datum.uuid.replace(/-/g," ")] = {lat: datum.value.latitude, lng: datum.value.longitude, message: "Study Name: " + datum.value.name + "<br/>" + "Description: " + datum.value.description + "<br/>" + "Latitude: " + datum.value.latitude + "<br/>" + "Longitude: " + datum.value.longitude, draggable:false}
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
    );

  }

  $scope.unAssociateMetadata = function(fileUuid){
    $scope.requesting = true;
    FilesMetadataService.removeAssociation($scope.metadatum.uuid, fileUuid).then(function(result){
      $scope.metadatum = null;
      //pause to let model update
      $timeout(function(){$scope.getMetadatum()}, 300);
      $scope.requesting = false;
    });
  }

  $scope.getMetadatum();

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

  $scope.markers = new Array();

 $scope.$on('leafletDirectiveMap.click', function(event, args){
   //clear markers
   $scope.markers=[];
   $scope.markers = $scope.marks;
   //add marker where click occured
   $scope.markers['newlocation']={
                lat: args.leafletEvent.latlng.lat,
                lng: args.leafletEvent.latlng.lng,
                message: "My Added Marker"
            };
   //set metadata form lat and long values
   $scope.model['longitude'] = args.leafletEvent.latlng.lng;
   $scope.model['latitude'] = args.leafletEvent.latlng.lat;

 });

  $scope.onSubmit = function(form) {

    $scope.$broadcast('schemaFormValidate');
    // Then we check if the form is valid
    if (form.$valid) {
      $scope.requesting = true;
      var body = {};
      body.name = $scope.selectedmetadataschema.schema.title;
      body.value = $scope.model;
      body.schemaId = $scope.selectedmetadataschema.uuid;
      //check for latitude - if there then store a geojson point
      if($scope.model.latitude){
          body.value["loc"] = {"type":"Point", "coordinates":[$scope.model.latitude,$scope.model.longitude]}
          body.geospatial= true;
      }
      MetaController.addMetadata(body)
        .then(
          function(response){
            $scope.metadataUuid = response.result.uuid;
            App.alert({message: $translate.instant('success_metadata_add') + $scope.metadataUuid });
            //add the default permissions for the system in addition to the owners
            MetadataService.addDefaultPermissions($scope.metadataUuid);
            MetadataService.addAssociation($stateParams.id, $scope.metadataUuid)
            $scope.requesting = false;
            $state.reload();
            //$state.go('metadata',{id: $scope.metadataUuid});
          },
          function(response){
            MessageService.handle(response, $translate.instant('error_metadata_add'));
            $scope.requesting = false;
          }
        );
      }
  };
});
