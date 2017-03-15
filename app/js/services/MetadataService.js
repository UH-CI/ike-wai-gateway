angular.module('AgaveToGo').service('MetadataService',['$uibModal', '$rootScope', '$localStorage', '$location', '$state', '$timeout', '$q', '$translate', 'PostitsController', 'MetaController', 'MessageService', function($uibModal, $rootScope, $localStorage, $location, $state, $timeout, $q, $translate, PostitsController, MetaController, MessageService){

  function deferredHandler(data, deferred, errorMessage) {
      if (!data || typeof data !== 'object') {
          return deferred.reject('Bridge response error, please check the docs');
      }
      if (data.result && data.result.error) {
          return deferred.reject(data);
      }
      if (data.error) {
          return deferred.reject(data);
      }
      if (errorMessage) {
          return deferred.reject(errorMessage);
      }
      return deferred.resolve(data);
  }

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
              App.alert({message: $translate.instant('success_metadata_assocation_removed') });
            },
            function(response){
              MessageService.handle(response, $translate.instant('error_metadata_remove'));
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
          deferredHandler(data, deferred, $translate.instant('error_metadata_remove'));

      });
      return true;
    }
    this.addAssociation = function(metadataUuid, uuidToAdd){
      var promises = [];
  	  MetaController.getMetadata(metadataUuid)
        .then(function(response){
          var metadatum = response.result;
          var body = {};
          body.associationIds = metadatum.associationIds;
          if (body.associationIds.indexOf(uuidToAdd) < 0) {
            body.associationIds.push(uuidToAdd);
          }
          body.name = metadatum.name;
          body.value = metadatum.value;
          body.schemaId = metadatum.schemaId;
          MetaController.updateMetadata(body,metadataUuid)
          .then(
            function(response){
              App.alert({message: $translate.instant('success_metadata_assocation_add') + ' ' + body.name });
            },
            function(response){
              MessageService.handle(response, $translate.instant('error_metadata_add_assocation'));
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
          deferredHandler(data, deferred, $translate.instant('error_metadata_add_assocation'));

      });
      return true;
    }

    this.getAdmins = function(){
      return ['seanbc','jgeis'];
    }
}]);
