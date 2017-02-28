angular.module('AgaveToGo').controller('StudiesResourceDetailsController', function($scope, $stateParams, $state, $translate, $timeout, $filter, MetaController, PostitsController, FilesMetadataService, ActionsService, MessageService) {
  $scope._COLLECTION_NAME = 'metadata';
  $scope._RESOURCE_NAME = 'metadatum';


  $scope.queryLimit = 99999;

  $scope.offset = 0;
  $scope.limit = 10000;

  $scope.sortType = 'name';
  $scope.sortReverse  = true;
  $scope.status = 'active';
  $scope.available = true;

  $scope.metadatum = null;
  $scope.query = '';
  $scope.getMetadatum = function(){
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
      $scope.query = '{"uuid":{"$in":'+$scope.metadatum.associationIds+'}}';
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

});
