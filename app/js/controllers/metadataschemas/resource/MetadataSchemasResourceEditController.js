angular.module('AgaveToGo').controller("MetadataSchemasResourceEditController", function($scope, $state, $stateParams, $translate, $window, WizardHandler, MetaController, MetadataService, ActionsService, MessageService) {

  $scope.metadataUuid = $stateParams.uuid;
  $scope.metadataschema = "";
  $scope.schemaString = "";
  $scope.wizview = "split";

  // TODO: need to be able to 
  // - add new fields
  // - remove fields
  // - edit fields

  $scope.refresh = function() {
    console.log("uuid: " + $scope.metadataUuid);
    if ($scope.metadataUuid){
      $scope.requesting = true;
      MetaController.getMetadataSchema($scope.metadataUuid)
        .then(function(schema_response){
          //console.log("response: " + angular.toJson(schema_response));
          result = schema_response.result;
          //console.log("result: " + angular.toJson(result));
          $scope.metadataschema = result.schema;
          //console.log("schema: " + angular.toJson($scope.metadataschema));
          $scope.schemaString = JSON.stringify($scope.metadataschema, undefined, 2);
          console.log("schemaString: " + $scope.schemaString);
          var formschema = {};
          formschema["type"]="object";
          formschema["properties"] = $scope.metadataschema.properties;
          //console.log("props: " + angular.toJson($scope.metadataschema.properties));
          /*
          $scope.schema = formschema;
          $scope.model ={};
          angular.forEach($scope.metadataschema.properties, function(value, key) {
            //console.log("Key: " + key + ", value: " + value);
            console.log($scope.metadataschema.properties[key]);
            $scope.model[key] = $scope.metadataschema.properties[key];
          });
          $scope.form = [
            "*",
            {
              type: "submit",
              title: "Save"
            }
          ];
          */
        }
      )
      $scope.requesting = false;
    }
    else{
      MessageService.handle(schema_response, $translate.instant('error_metadataschemas_get'));
    }
  }

  $scope.refresh();

  $scope.onSubmit = function(newSchemaString) {
    console.log("In on submit: " + $scope.metadataUuid + "\n" + newSchemaString);
    $scope.requesting = true;

    MetaController.updateMetadataSchema(newSchemaString,$scope.metadataUuid).then(
      function(response){
        App.alert({message: $translate.instant('success_metadata_schema_update') });
        //make sure default permissions are set
        MetadataService.addDefaultPermissions($scope.metadataUuid);
        $scope.requesting = false;
        //$window.history.back();
        $state.go('metadataschemas');
        //<a href="#/metadataschemas/"></a>
      },
      function(response){
        MessageService.handle(response, $translate.instant('error_metadata_update'));
        $scope.requesting = false;
      }
    )
  };



});
