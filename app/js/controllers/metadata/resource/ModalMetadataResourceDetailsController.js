angular.module('AgaveToGo').controller('ModalMetadataResourceDetailsController', function($scope, $uibModal, $modalInstance, $state, $translate, $timeout, $window, $rootScope, $localStorage, MetaController, PostitsController, FilesMetadataService, ActionsService, MessageService, MetadataService) {
  $scope.profile = $localStorage.activeProfile;

    //Set the order fields should display
  $scope.order={};
  $scope.order['Variable'] =['id','variable_name','category','sample_medium','data_type','speciation','unit','value_type']
  $scope.order['Well'] =['wid','island','well_name','old_name','yr_drilled','driller','latitude','longitude','gps','utm','owner_user','land_owner','pump_installer','old_number','well','casing_dia','ground_el','well_depth','solid_case','perf_case','use','init_head','salinity','init_cl','test_date','test_gpm','test_ddwon','test_chlor','test_temp','test_unit','temp_f','temp_c','pump_gpm','draft_mgy','head_feet','pump_yr','draft_yr','bot_hole','bot_solid','bot_perf','SPEC_CAPAC','pump_mgd','draft_mgd','pump_depth','surveyor','t']
  $scope.order['Site'] =['name','latitude','longitude','polygon','description','county','state']
  $scope.order['Person'] =['first_name','last_name','email','orcid','organization','address','phone','url']
  $scope.order['Organization'] = ['name','email','address','phone','url']
  $scope.order['Water_Quality_Site'] = ['name','latitude','longitude','description','MonitoringLocationName','siteUrl','MonitoringLocationTypeName','ProviderName','activityCount','HUCEightDigitCode','ResolvedMonitoringLocationTypeName','OrganizationFormalName','OrganizationIdentifier','resultCount','MonitoringLocationIdentifier','variables','keywords']
  //$scope.order['Subject'] = ['word','uuid','short_heirarchy','full_heirarchy','display']

  $scope.get_editors = function(){
    $scope.editors = MetadataService.getAdmins();
    $scope.edit_perm = $scope.editors.indexOf($scope.profile.username) > -1;
  }
  $scope.get_editors();

  $scope.close = function () {
    $modalInstance.close($scope.model);
  };

  $scope.metadatum = null;

  $scope.getModalMetadatum = function(){
    $scope.requesting = true;

    if (this.$parent.metadataUuid !== undefined && this.$parent.metadataUuid !== '') {
      var uuid = this.$parent.metadataUuid;
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

  $scope.openEdit = function (metadatumuuid, size) {
	    //$scope.close(); // if I close this modal, the new one's buttons don't work
      $uibModal.open({
        animation: $scope.animationsEnabled,
        templateUrl: 'views/modals/ModalEditMetadata.html',
        controller: 'ModalMetadataResourceEditController',
        scope: this.$parent,
        size: size,
        metadataUuid: metadatumuuid,
        resolve: {

        }
      }
    );
    $scope.close();

  };

  $scope.getModalMetadatum();

  $rootScope.$on("metadataUpdated", function(){
    $scope.getModalMetadatum();
  });

  $scope.download = function(file_url){
    $scope.requesting = true;
    FilesMetadataService.downloadSelected(file_url).then(function(result){
      $scope.requesting = false;
    });
  }

  $scope.removeMetadataAssociation = function(fileobject){
    $scope.requesting = true;
    var unAssociate = $window.confirm('Are you sure you want to remove the metadata/file association?');
    //$scope.confirmAction(metadatum.name, metadatum, 'delete', $scope[$scope._COLLECTION_NAME])
    if (unAssociate) {
      FilesMetadataService.removeAssociations([fileobject], this.$parent.metadataUuid).then(function(result){
        $scope.metadatum = null;
        //pause to let model update
        $rootScope.$broadcast('associationsUpdated')
        $rootScope.$broadcast('metadataUpdated')
        $timeout(function(){$scope.getModalMetadatum()}, 300);
        $scope.requesting = false;
      });
    }
  }

  //MAP STUFF
    $scope.metadata_markers = {};

    $scope.makeLocationMarkers = function(datum){
        $scope.marks = {};
        if(datum.value.loc != undefined){
          if(datum.value.loc.type == 'Point'){
            if(datum.value.latitude != undefined && datum.value.wid !=undefined){
              $scope.marks[datum.value.wid.replace(/-/g,"")] = {lat: parseFloat(datum.value.latitude), lng: parseFloat(datum.value.longitude), message: "Well ID: " + datum.value.wid + "<br/>" + "Well Name: " + datum.value.well_name + "<br/>" + "Latitude: " + datum.value.latitude + "<br/>" + "Longitude: " + datum.value.longitude, draggable:false}
            }else{
              $scope.marks[datum.uuid.replace(/-/g,"")] = {lat: parseFloat(datum.value.latitude), lng: parseFloat(datum.value.longitude), message: "Site Name: " + datum.value.name + "<br/>" + "Description: " + datum.value.description + "<br/>" + "Latitude: " + datum.value.latitude + "<br/>" + "Longitude: " + datum.value.longitude, draggable:false}
            }
          }else{
            //var myLayer = L.geoJSON().addTo(map);
            //myLayer.addData(datum.value.loc.coordinates);
            //$scope.leafletDirectiveMap
            angular.extend($scope, {
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
            });
          }//close else
        }//close if
        $scope.metadata_markers = $scope.marks
    }//close function

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
