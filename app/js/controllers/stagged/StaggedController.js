angular.module('AgaveToGo').controller('StaggedController', function($scope, $stateParams, $state, $translate, $timeout, $localStorage, MetaController, ActionsService, FilesMetadataService, MetadataService) {

  $scope.metadatum = null;
  $scope.requesting = true;
  $scope.getMetadatum = function(){
    $scope.requesting = true;
    if ($stateParams.id !== ''){
      MetaController.getMetadata(MetadataService.fetchSystemMetadataUuid('stagged'))
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

  $scope.rejectStaggingRequest = function(fileUuid){
      $scope.requesting = true;
      FilesMetadataService.rejectStaggingRequest(MetadataService.fetchSystemMetadataUuid('stagged'), fileUuid).then(function(result){
        $scope.metadatum = null;
        //pause to let model update
        $timeout(function(){$scope.getMetadatum()}, 300);
        $scope.requesting = false;
      });
    }

  $scope.publishStaggedFile = function(fileUuid, filepath){
    $scope.requesting = true;
    FilesMetadataService.publishStaggedFile(fileUuid, filepath).then(function(result){
       //pause to let model update
       $timeout(function(){$scope.getMetadatum()}, 300);
        $scope.requesting = false;
    })
  }
  $scope.$on('broadcastUpdate', function(event, args){
    $scope.getMetadatum();
    alert(angular.toJson(args))
    App.alert(args);
  });

  $scope.getMetadatum();
});
