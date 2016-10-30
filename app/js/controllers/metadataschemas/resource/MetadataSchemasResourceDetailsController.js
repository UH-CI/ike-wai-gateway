angular.module('AgaveToGo').controller('MetadataSchemasResourceDetailsController', function($scope, $stateParams, $state, $translate, MetaController, ActionsService, MessageService) {

  $scope.metadataschema = null;

  $scope.getMetadataSchema = function(){
    $scope.requesting = true;
    if ($stateParams.id !== ''){
      MetaController.getMetadataSchema($stateParams.id)
        .then(
          function(response){
            $scope.metadataschema = response.result;
            $scope.requesting = false;
          },
          function(response){
            MessageService.handle(response, $translate.instant('error_metadataschemas_details'));
            $scope.requesting = false;
          }
        );
    } else {
      MessageService.handle(response, $translate.instant('error_metadataschemas_details'));
      $scope.requesting = false;
    }
  };

  $scope.getMetadataSchema();

});
