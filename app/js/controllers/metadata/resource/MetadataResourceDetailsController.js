angular.module('AgaveToGo').controller('MetadataResourceDetailsController', function($scope, $stateParams, $state, $translate, $timeout, MetaController, PostitsController, FilesMetadataService, ActionsService, MessageService) {

  $scope.metadatum = null;

  $scope.getMetadatum = function(){
    $scope.requesting = true;
    if ($stateParams.id !== ''){
      MetaController.getMetadata($stateParams.id)
        .then(
          function(response){
            $scope.metadatum = response.result;
            if($scope.metadatum.associationIds.length > 0){
              $scope.fetchFileMetadata("{$and:[{'name':'File'},{'associationIds':{$in: ['"+$scope.metadatum.uuid+"']}}]}")
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

  $scope.download = function(file_url){
    $scope.requesting = true;
    FilesMetadataService.downloadSelected(file_url).then(function(result){
      $scope.requesting = false;
    });
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

});
