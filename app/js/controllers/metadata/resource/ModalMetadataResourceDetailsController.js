angular.module('AgaveToGo').controller('ModalMetadataResourceDetailsController', function($scope, $uibModal, $modalInstance, $state, $translate, $timeout, $rootScope, MetaController, PostitsController, FilesMetadataService, ActionsService, MessageService) {

  $scope.close = function () {
    $modalInstance.close($scope.model);
  };

  $scope.metadatum = null;

  $scope.getModalMetadatum = function(){
    $scope.requesting = true;
    var uuid = this.$parent.metadataUuid;
    if (uuid !== '' && uuid) {
      MetaController.getMetadata(uuid)
        .then(
          function(response){
            $scope.metadatum = response.result;
            if($scope.metadatum.associationIds.length > 0){
              $scope.fetchFileMetadata("{$and:[{'name':'File'},{'uuid':{$in: ['"+$scope.metadatum.associationIds.join("','")+"']}}]}")
            }
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
        scope: $scope,
        size: size,
        metadataUuid: metadatumuuid,
        resolve: {

        }
      }
    );
  };

  $scope.getModalMetadatum();

  $rootScope.$on("metadataUpdated", function(){
    $scope.getModalMetadatum();
  });

});
