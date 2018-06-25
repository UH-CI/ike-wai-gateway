angular.module('AgaveToGo').service('MetadataService',['$uibModal', '$rootScope', '$localStorage', '$location', '$state', '$timeout', '$q', '$translate', 'PostitsController', 'MetaController', 'MessageService', function($uibModal, $rootScope, $localStorage, $location, $state, $timeout, $q, $translate, PostitsController, MetaController, MessageService){

  this.getAdmins = function(){
    return ['seanbc','jgeis','omeier'];
  }


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

    //return the value for the system metatdata (stagged, rejected, published) uuid
    //store it in $localStorage so we can cache it
    this.fetchSystemMetadataUuid = function(type){
      var promises = [];
      if ($localStorage[type] == null){
          promises.push(MetaController.listMetadata("{'name':'"+type+"'}",limit=1,offset=0)
          .then(function(response){
            $localStorage[type] = response.result[0].uuid;
            return $localStorage[type];
          },function(response){
              MessageService.handle(response, $translate.instant('Error Could Not Fetch System Metatadata: '+type));
          }));
      }

      var deferred = $q.defer();

      return $q.all(promises).then(
        function(data) {
          return $localStorage[type];
        },
        function(data) {
          deferredHandler(data, deferred, $translate.instant('error_fetching_system_schema_uuid'));

      });
    }

    //return the value for the system metatdata (File, Well etc) uuid
    this.fetchSystemMetadataSchemaUuid = function(type){
      var promises = [];
      console.log("fetching")
      if ($localStorage["schema_"+type] == null){
          promises.push(MetaController.listMetadataSchema()
          .then(function(response){
            angular.forEach(response.result, function(value, key){
              $localStorage["schema_"+value.schema.title] = value.uuid;
              console.log(value.schema.title)
            })
          },function(response){
              MessageService.handle(response, $translate.instant('Error Could Not Fetch System Metatadata Schema: '+type));
          }));
      }else{
        console.log(type +":is not null - " + $localStorage["schema_"+type])
      }

      var deferred = $q.defer();

      return $q.all(promises).then(
        function(data) {
          return $localStorage["schema_"+type];
        },
        function(data) {
          deferredHandler(data, deferred, $translate.instant('error_fetching_system_schema_uuid'));

      });
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
              App.alert({message: $translate.instant('success_metadata_assocation_removed'),closeInSeconds: 5 });
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
      //return true;
    }


    this.addAssociation = function(metadataUuid, uuidToAdd, callback){

      var promises = [];
      var self = this;
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
              App.alert({message: $translate.instant('success_metadata_assocation_add') + ' ' + body.name,closeInSeconds: 5 });
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
      //return true;
    }

    this.addPublicPermission = function(uuidToAdd){
      MetaController.addMetadataPermission('{"username":"public","permission":"READ"}',uuidToAdd);
    }
    this.resolveApprovedStatus = function(uuidToAdd){
      var self = this;
      user = $localStorage.activeProfile;
      MetaController.getMetadata(uuidToAdd)
      .then(function(response){
        //Ignore DataDescriptors - we don't want these added to unapproved because they are not public until published as annotated
        if(response.result.name != 'DataDescriptor' && response.result.name != 'File' && response.result.name != 'AnnotatedFile'){
          if (self.getAdmins().indexOf(user.username) > -1) {
            MetaController.addMetadataPermission('{"username":"public","permission":"READ"}',uuidToAdd);
            self.fetchSystemMetadataUuid('unapproved')
              .then(function(resp){
                MetaController.getMetadata(resp)
                  .then(function(response){
                    var metadatum = response.result;
                    var body = {};
                    body.associationIds = metadatum.associationIds;
                    body.associationIds.splice(body.associationIds.indexOf(uuidToAdd), 1);
                    body.name = metadatum.name;
                    body.value = metadatum.value;
                    body.schemaId = metadatum.schemaId;
                    MetaController.updateMetadata(body,resp)
                    .then(
                      function(response){
                       // App.alert({message: $translate.instant('success_metadata_assocation_removed'),closeInSeconds: 5 });
                      },
                      function(response){
                       // MessageService.handle(response, $translate.instant('error_metadata_remove'));
                      }

                    )
                  }
                )
              })
          }
          else {
            //add this to unapproved if user is not an admin
            self.fetchSystemMetadataUuid('unapproved')
              .then(function(response){
                metadataUuid = response
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
                       // App.alert({message: $translate.instant('success_metadata_assocation_add') + ' ' + body.name,closeInSeconds: 5 });
                      },
                      function(response){
                       // MessageService.handle(response, $translate.instant('error_metadata_add_assocation'));
                      }

                    )
                  }
                )
              })
          }
        }
      })
    }
    //For now we do this - in the future the bulk update API will make this one callback
    //Also when Groups are in place this can be simplified as well
    this.addDefaultPermissions = function(metadataUuid){
      this.resolveApprovedStatus(metadataUuid);
      MetaController.addMetadataPermission('{"username":"seanbc","permission":"ALL"}',metadataUuid);
      MetaController.addMetadataPermission('{"username":"jgeis","permission":"ALL"}',metadataUuid);
      MetaController.addMetadataPermission('{"username":"omeier","permission":"ALL"}',metadataUuid);
      MetaController.addMetadataPermission('{"username":"ike-admin","permission":"ALL"}',metadataUuid);
      $rootScope.$broadcast('permissionsUpdated',{message:"Permissions Updated Successfully."});
    }
}]);
