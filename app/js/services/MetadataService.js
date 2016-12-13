angular.module('AgaveToGo').service('MetadataService',['$uibModal', '$rootScope', '$localStorage', '$location', '$state', '$timeout', '$q', '$translate', 'PostitsController', 'MetaController', 'MessageService', function($uibModal, $rootScope, $localStorage, $location, $state, $timeout, $q, $translate, PostitsController, MetaController, MessageService){

    //For now we do this - in the future the bulk update API will make this one callback
    //Also when Groups are in place this can be simplified as well
    this.addDefaultPermissions = function(metadataUuid){
      MetaController.addMetadataPermission('{"username":"public","permission":"READ"}',metadataUuid);
      MetaController.addMetadataPermission('{"username":"seanbc","permission":"ALL"}',metadataUuid);
      MetaController.addMetadataPermission('{"username":"jgeis","permission":"ALL"}',metadataUuid);
      MetaController.addMetadataPermission('{"username":"ike-admin","permission":"ALL"}',metadataUuid);
    }
    this.removeAssociation = function(metadataUuid, uuidToRemove){
      var promises = [];
  	  MetaController.getMetadata(metadataUuid)
        .then(function(response){
          var metadatum = response.result;
          var body = {};
          body.associationIds = metadatum.associationIds;
          body.associationIds.splice(body.associationIds.indexOf(uuidToRemove), 1);
          body.name = metadatum.name;
          body.value = metadatum.value;
          body.schemaId = metadatum.schemaId;
          MetaController.updateMetadata(body,metadataUuid)
          .then(
            function(response){
              App.alert({message: $translate.instant('success_metadata_assocation_removed') + ' ' + metadataUuid });
            },
            function(response){
              MessageService.handle(response, $translate.instant('error_metadata_update_assocation'));
            }

          )
        }
      )
      var deferred = $q.defer();

      return $q.all(promises).then(
        function(data) {
          deferredHandler(data, deferred);

        },
        function(data) {
          deferredHandler(data, deferred, $translate.instant('error_metadata_update_association'));

      });
      return true;
    }
}]);
