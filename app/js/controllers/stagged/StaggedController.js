angular.module('AgaveToGo').controller('StaggedController', function($scope, $stateParams, $state, $translate, $timeout, $localStorage, $uibModal, MetaController, FilesMetadataService, MetadataService, MessageService) {

  $scope.metadatum = null;
  $scope.requesting = true;

  $scope.getMetadatum = function(){
    $scope.requesting = true;
    if ($stateParams.id !== ''){
      MetadataService.fetchSystemMetadataUuid('stagged')
        .then(function(stagged_uuid){
          MetaController.getMetadata(stagged_uuid)
            .then(
              function(response){
                $scope.metadatum = response.result;
                $scope.requesting = false;
              },
              function(response){
                MessageService.handle(response, $translate.instant('error_metadata_details'));
                $scope.requesting = false;
              }
            );
          },function(){
            MessageService.handle(response, $translate.instant('error_metadata_uuid'));
            $scope.requesting = false;
          });
    } else {
      MessageService.handle(response, $translate.instant('error_metadata_details'));
      $scope.requesting = false;
    }
  }

  $scope.openRejectReasonModal = function (fileUuid, size) {
      $scope.rejectedUuid = fileUuid;
      var modalInstance = $uibModal.open({
        animation: $scope.animationsEnabled,
        templateUrl: 'views/modals/ModalRejectStagingRequestReason.html',
        controller: 'ModalRejectStagingRequestController',
        scope: $scope,
        size: size,
        resolve: {

        }
      }
    );
  }

  $scope.$on("staging.request.rejected", function (event, args) {
    var reason = args;
    $scope.requesting = true;
    MetadataService.fetchSystemMetadataUuid('stagged')
      .then(function(stagged_uuid){
        FilesMetadataService.rejectStaggingRequest(stagged_uuid, $scope.rejectedUuid, reason).then(function(result){
        $scope.metadatum = null;
        //pause to let model update
        $timeout(function(){$scope.getMetadatum()}, 400);
        $scope.requesting = false;
      });
    },function(){
      MessageService.handle(response, $translate.instant('error_metadata_uuid'));
      $scope.requesting = false;
    });
  });

  $scope.publishStaggedFile = function(fileUuid, filepath){
    $scope.requesting = true;
    MetadataService.fetchSystemMetadataSchemaUuid('PublishedFile')
      .then(function(published_uuid){
        FilesMetadataService.publishStaggedFile(fileUuid, filepath).then(function(result){
           //pause to let model update
           $timeout(function(){$scope.getMetadatum()}, 300);
            $scope.requesting = false;
            App.alert( "File Published");
            //$scope.$broadcast('broadcastUpdate');
        })
      },function(){
        MessageService.handle(response, $translate.instant('error_fetching_metadata_schema'));
        $scope.requesting = false;
      });
  }
  $scope.$on('broadcastUpdate', function(event, args){
    $scope.getMetadatum();
    App.alert(args);
  });

  $scope.getMetadatum();
});
