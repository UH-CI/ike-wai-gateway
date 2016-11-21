angular.module('AgaveToGo').controller('MetadataResourceDetailsController', function($scope, $stateParams, $state, $translate, MetaController, PostitsController, FilesMetadataService, ActionsService, MessageService) {

  $scope.metadatum = null;

  $scope.getMetadatum = function(){
    $scope.requesting = true;
    if ($stateParams.id !== ''){
      MetaController.getMetadata($stateParams.id)
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
    } else {
      MessageService.handle(response, $translate.instant('error_metadata_details'));
      $scope.requesting = false;
    }
  };

  $scope.download = function(file_url){
    $scope.requesting = true;
    FilesMetadataService.downloadSelected(file_url).then(function(result){
      $scope.requesting = false;
    });
  }

  $scope.getMetadatum();

});
