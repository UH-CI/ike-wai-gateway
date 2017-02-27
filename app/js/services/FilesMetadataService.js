angular.module('AgaveToGo').service('FilesMetadataService',['$uibModal', '$rootScope', '$localStorage', '$location', '$state', '$timeout', '$q', '$translate', 'PostitsController', 'MetaController', 'FilesController','MetadataService', 'MessageService', function($uibModal, $rootScope, $localStorage, $location, $state, $timeout, $q, $translate, PostitsController, MetaController, FilesController, MetadataService, MessageService){

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

  this.broadcastMe = function(){
   $rootScope.$broadcast('broadcastUpdate');
  };

  this.download = function(file_href, callback) {

        var data = {
            force: "true"
        };

        var postitIt = new PostItRequest();
        postitIt.setMaxUses(2);
        postitIt.setMethod("GET");
        postitIt.setUrl([file_href, $.param(data)].join('?'));

        return PostitsController.addPostit(postitIt)
            .then(function(resp) {

                  var link = document.createElement('a');
                  link.setAttribute('download', null);
                  link.setAttribute('href', resp._links.self.href);
                  link.style.display = 'none';
                  document.body.appendChild(link);
                  link.click();

                  document.body.removeChild(link);

                return callback(resp.data);

            });
    };

    this.downloadSelected = function(fileUrlsSelected){
      var self = this;
      var promises = [];
      angular.forEach(fileUrlsSelected, function(file_url){
        promises.push(
          self.download(file_url, function(value){
            //self.files.push(value);
          })
        );
      });

      var deferred = $q.defer();

      return $q.all(promises).then(
        function(data) {
          deferredHandler(data, deferred);

        },
        function(data) {
          deferredHandler(data, deferred, $translate.instant('error_downloading_files'));

      });
      return true;
    };

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

    this.addPublishedAssociation = function(metadataUuid, uuidToAdd){
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
          body.published = 'True';
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
    this.setFilePublished = function(fileUuid){
      var promises = [];
      //fetch published metadata record
      MetaController.getMetadata('4516085960163594726-242ac1110-0001-012')
        .then(function(response){
          var metadatum = response.result;
          var body = {};
          body.associationIds = metadatum.associationIds;
          if (body.associationIds.indexOf(fileUuid) < 0) {
            body.associationIds.push(fileUuid);
          }
          MetaController.updateMetadata(body,'4516085960163594726-242ac1110-0001-012')
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

    this.createPublishedFileMetadata = function(newfile_uuid, newpath, oldfile_uuid, associations){
      var promises = [];
      body = {};
      split_filepath = newpath.split("/");
      body.name = "PublishedFile";
      body.associationIds = associations;
      body.associationIds.push(newfile_uuid);
      body.associationIds.push(oldfile_uuid);
      body.value= {"file-uuid":newfile_uuid,"oldfile-uuid":oldfile_uuid,"filename":split_filepath[split_filepath.length -1],"path":newpath};
      body.schemaId = '6890279147825992166-242ac1110-0001-013';
      body.published="True";
      MetaController.addMetadata(body)
        .then(
          function(response){
            metadataUuid = response.result.uuid;
            App.alert({message: $translate.instant('success_metadata_add') + metadataUuid });
            //add the default permissions for the system in addition to the owners
            MetadataService.addDefaultPermissions(metadataUuid);
          },
          function(response){
            MessageService.handle(response, $translate.instant('error_metadata_add'));
          }
        );

    }

    this.publishStaggedFile = function(fileUuid, filepath)
    {
      var self = this;
      filepath_str = filepath.split('/')
      filename = filepath_str[filepath_str.length-1]
      newpath = "new_data/" + filename;
      var promises = [];
      var associations = [];
      FilesController.importFileItem(filepath, newpath, "ikewai-archive")
        .then(function(response){
          //success - get the newfiles uuid
          newfile_uuid = response.result.uuid;
          console.log("new-uuid: " + newfile_uuid )
          console.log("old-uuid: " + fileUuid)
          //fetch all metadata objects associated with oldfile
          MetaController.listMetadata('{"associationIds":"' +  fileUuid+ '"}',1000,0)
            .then(function(response){
              angular.forEach(response.result, function(metadatum){
                console.log(metadatum.name)
                if(metadatum.name != 'stagged'){
                  //associate newfile with oldfiles metadatum object
                  self.addPublishedAssociation(metadatum.uuid, newfile_uuid);
                  associations.push[metadatum.uuid]
                }
              })
              //create a a File Metadata Object, assocaiate metadata objects
              self.createPublishedFileMetadata(newfile_uuid, newpath, fileUuid, associations);
              //add original file to Published object
              self.addAssociation('4516085960163594726-242ac1110-0001-012',fileUuid);
              //remove original file from Stagged object
              self.removeAssociation('484964208339784166-242ac1110-0001-012', fileUuid)
            })
        },
        function(response){
          //failed
          MessageService.handle(response, $translate.instant('error_file_publish'));
        }
      )
      var deferred = $q.defer();

      return $q.all(promises).then(
        function(data) {
          deferredHandler(data, deferred);
          $rootScope.$broadcast('broadcastUpdate',{message:"Files Published Successfully."});
        },
        function(data) {
          deferredHandler(data, deferred, $translate.instant('error_file_publish'));

      });
      return true;
    }

    this.rejectStaggingRequest = function(metadataUuid, uuidToReject){
      var promises = [];
  	  MetaController.getMetadata(metadataUuid)
        .then(function(response){
          var metadatum = response.result;
          var body = {};
          body.associationIds = metadatum.associationIds;
          body.associationIds.splice(body.associationIds.indexOf(uuidToReject), 1);
          body.name = metadatum.name;
          body.value = metadatum.value;
          //rejected = [angular.toJson(body.value)];
          body.schemaId = metadatum.schemaId;
          if (body.value.rejected.indexOf[uuidToReject] < 0){
            body.value.rejected.push(uuidToReject);
          }
          //alert(angular.toJson(rejected))
        //  body.value.rejected = rejected
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
