angular.module('AgaveToGo').controller('MetadataSchemasResourceDetailsController', function($scope, $stateParams, $state, $translate, MetaController, ActionsService, MessageService) {

  $scope.metadataschema = null;

  $scope.getMetadataSchema = function(){
    $scope.requesting = true;
    if ($stateParams.id !== ''){
      MetaController.listMetadataSchema("{'uuid':'"+$stateParams.id+"'}")
        .then(
          function(response){
            $scope.metadataschema = response.result[0];
            $scope.prettyProperties = JSON.stringify($scope.metadataschema, null, "     \n");
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
