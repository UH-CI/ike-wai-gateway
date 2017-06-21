angular.module('AgaveToGo').controller('MetadataResourceUnapprovedController', function ($scope, $state, $translate, $uibModal, $rootScope, $localStorage, MetaController, FilesController, ActionsService, MessageService, MetadataService, FilesMetadataService) {

    $scope.profile = $localStorage.activeProfile;
    $scope.get_editors = function(){
      $scope.editors = MetadataService.getAdmins();
      $scope.edit_perm = $scope.editors.indexOf($scope.profile.username) > -1;
    }
    $scope.get_editors();
    $scope.queryLimit = 99999;

    $scope.offset = 0;
    $scope.limit = 10;

    $scope.sortType = 'name';
    $scope.sortReverse  = true;
    $scope.status = 'active';
    $scope.available = true;
    $scope.query = "{'name': 'unapproved'}";

    $scope.refresh = function() {
      $scope.requesting = true;

      MetaController.listMetadata(
        $scope.query,limit=1000,offset=0
      )
        .then(
          function (response) {
            $scope.unapproved = response.result[0];
            var assocIds = [];
            angular.forEach($scope.unapproved.associationIds, function(value, key){
              assocIds.push(value)
            })
            //alert(assocIds)
            MetaController.listMetadata("{'uuid':{'$in': ['" + assocIds.join("','") +"'] }}",limit=1000,offset=0)
              .then(function(resp){
                $scope.metadata = resp.result
            })
            $scope.requesting = false;
          },
          function(response){
            MessageService.handle(response, $translate.instant('error_metadata_list'));
            $scope.requesting = false;
          }
      );

    };

    $scope.refresh();

    $rootScope.$on("metadataUpdated", function(){
      $scope.refresh();
    });

    $scope.confirmAction = function(resourceType, resource, resourceAction, resourceList, resourceIndex){
      ActionsService.confirmAction(resourceType, resource, resourceAction, resourceList, resourceIndex);
    };

    $scope.approveMetadata = function(metadtaUuid){
      //An admin doing this will remove the unapproved association and add public access
      MetadataService.addDefaultPermissions(metadtaUuid)
        .then(function(response){
          $scope.refresh();
        }
      )
    }

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
