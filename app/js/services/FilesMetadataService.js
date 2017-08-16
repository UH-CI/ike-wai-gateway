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

  this.updateFileObject = function(fileobject){
    var body={};
    //associate system file with this metadata File object
    body.associationIds = fileobject.associationIds;
    body.name = 'File';
    body.value= {};
    body.value['filename'] = fileobject._links.associationIds[0].href.split('system')[1];
    body.value['path'] = fileobject._links.associationIds[0].href.split('system')[1];
    //File Schema uuid
    body.schemaId = fileobject.schemaId;
    MetaController.updateMetadata(body,fileobject.uuid)
      .then(
        function(response){
          //ok
        },
        function(response){
          MessageService.handle(response, $translate.instant('error_metadata_add'));
          $scope.requesting = false;
        }
      );
  }

  this.createFileMetadataObject = function(fileUuid, callback){
    var self = this;
    MetadataService.fetchSystemMetadataSchemaUuid('File')
    .then(function(file_schema_uuid){
      MetaController.listMetadata("{$and:[{'name':'File'},{'associationIds':'"+fileUuid+"'}]}").then(
        function(resp){
          var fileobj = resp.result;
          //check if fileobj is empty if so the create new obj
          if (fileobj == ""){
            var body={};
            //associate system file with this metadata File object
            body.associationIds = [fileUuid];
            body.name = 'File';
            body.value = {};
            //File Schema uuid
            body.schemaId = file_schema_uuid;
            MetaController.addMetadata(body)
              .then(
                function(response){
                  //add the default permissions for the system in addition to the owners
                  MetadataService.addDefaultPermissions(response.result.uuid);
                  self.updateFileObject(response.result)
                  return callback(response.data);
                },
                function(response){
                  MessageService.handle(response, "Error creating metadata file object!");
                }
              );
          }
        }
      )
    },function(response){
      App.alert(response, "Erorr Fetch System Metadata Schema UUID.")
    });
  }




  this.createFileMetadataObjects = function(fileUuids, broadcastEvent ='doNothing'){
    var self = this;
    var promises = [];
    angular.forEach(fileUuids, function(fileUuid){
      promises.push(
        self.createFileMetadataObject(fileUuid, function(value){
        })
      );
    });

    var deferred = $q.defer();

    return $q.all(promises).then(
      function(data) {
        deferredHandler(data, deferred);
        if (broadcastEvent != 'doNothing'){
          $rootScope.$broadcast(broadcastEvent,{message:"Files Associated Successfully."});
        }
      },
      function(data) {
        deferredHandler(data, deferred, "Error Creating File Metadata Objects");

    });
    return true;
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
          var index = body.associationIds.indexOf(uuidToRemove);
          body.associationIds.splice(index, 1);
          body.name = metadatum.name;
          body.value = metadatum.value;
          body.schemaId = metadatum.schemaId;
          if (body.name === "rejected") {
            body.value.title = metadatum.value.title;
            body.value.reasons = metadatum.value.reasons;
            body.value.reasons.splice(index, 1);
          }
          promises.push(MetaController.updateMetadata(body,metadataUuid))
          var deferred = $q.defer();

          return $q.all(promises).then(
            function(data) {
              $rootScope.$broadcast('associationRemoved',{message:"File Associations Removed Successfully."});
              return true;
          },
          function(data) {
            deferredHandler(data, deferred, "Error Removing File Metadata Associations");
              return false;
          });
        }
      )
      
    }

    this.addAssociation = function(metadataUuid, uuidToAdd){
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
              App.alert({message: $translate.instant('success_metadata_add_assocation'),closeInSeconds: 5 });
            },
            function(response){
              MessageService.handle(response, $translate.instant('error_metadata_add_assocation'));
            }

          )
        }
      )
    }

    this.addAssociations = function(fileObjects, metadatumUuid){

        var self = this;
        var promises = [];
        angular.forEach(fileObjects, function(value, key){
          promises.push(
            self.addAssociation(value.uuid, metadatumUuid, function(value){
            })
          );
        });

        var deferred = $q.defer();

        return $q.all(promises).then(
          function(data) {
            deferredHandler(data, deferred);
            $rootScope.$broadcast('associationsUpdated',{message:"Files Associated Successfully."});
          },
          function(data) {
            deferredHandler(data, deferred, "Error Creating File Metadata Associations");
        });
        return true;
    }

    this.removeAssociations = function(fileObjects, metadatumUuid){
        var self = this;
        var promises = [];
        angular.forEach(fileObjects, function(value, key){
          promises.push(
            self.removeAssociation(value.uuid, metadatumUuid, function(value){
            })
          );
        });

        var deferred = $q.defer();

        return $q.all(promises).then(
          function(data) {
            deferredHandler(data, deferred);
            //$rootScope.$broadcast('associationsUpdated',{message:"File Associations Removed Successfully."});
          },
          function(data) {
            //deferredHandler(data, deferred, "Error Removing File Metadata Associations");
        });
    }

    //add new association to published file
    //set permissions to public as well.
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
          body.value['published'] = 'True';
          MetaController.updateMetadata(body,metadataUuid)
          .then(
            function(response){
              MetadataService.addPublicPermission(metadataUuid);
              App.alert({message: $translate.instant('success_metadata_update_assocation'),closeInSeconds: 5 });
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
          deferredHandler(data, deferred, $translate.instant('error_metadata_update_assocation'));

      });
      return true;
    }

    this.createPublishedFileMetadata = function(newfile_uuid, newpath, oldfile_uuid, associations){
      var promises = [];
      MetadataService.fetchSystemMetadataSchemaUuid('PublishedFile')
        .then(function(published_schema_uuid){
          body = {};
          split_filepath = newpath.split("/");
          body.name = "PublishedFile";
          body.associationIds = associations;
          body.associationIds.push(newfile_uuid);
          body.value= {"file-uuid":newfile_uuid,"oldfile-uuid":oldfile_uuid,"filename":split_filepath[split_filepath.length -1],"path":newpath};
          body.schemaId = published_schema_uuid;
          body.published="True";
          promises.push(MetaController.addMetadata(body)
            .then(
              function(response){
                console.log('PublishedFile: '+response.result.uuid)
                metadataUuid = response.result.uuid;
                App.alert({message: $translate.instant('success_metadata_add') + metadataUuid ,closeInSeconds: 5});
                //add the default permissions for the system in addition to the owners
                MetadataService.addDefaultPermissions(metadataUuid);
                MetadataService.resolveApprovedStatus(metadataUuid);//if not public make it so
              },
              function(response){
                MessageService.handle(response, $translate.instant('error_metadata_add'));
              }
            ));
          });
        var deferred = $q.defer();

        return $q.all(promises).then(
          function(data) {

          },
          function(data) {
            deferredHandler(data, deferred, $translate.instant('error_fetching_system_schema_uuid'));

        });
    }

    this.publishStaggedFile = function(fileUuid, filepath)
    {
      var self = this;
      filepath_str = filepath.split('/')
      filename = filepath_str[filepath_str.length-1]
      newpath = "new_data/" + filename;
      var promises = [];
      var associations = [];

      FilesController.importFileItem(filepath, newpath, "ikewai-annotated-data")
        .then(function(response){
          //success - get the newfiles uuid
          newfile_uuid = response.result.uuid;
          console.log("new-uuid: " + newfile_uuid )
          console.log("old-uuid: " + fileUuid)
          //fetch all file objects associated with oldfile
          MetaController.listMetadata('{$and: [{"name":"File"},{"associationIds":"' +  fileUuid+ '"}]}',1000,0)
            .then(function(response){
              angular.forEach(response.result, function(value){
                  //loop through File metadata associations
                  angular.forEach(value.associationIds, function(val,index){
                    //associate newfile with oldfiles metadatum object
                    if( associations.indexOf(val) < 0){
                     associations.push(val)
                     self.addPublishedAssociation(val, newfile_uuid);
                   }
                 })
              })
              //create a a File Metadata Object, assocaiate metadata objects
              promises.push(self.createPublishedFileMetadata(newfile_uuid, newpath, fileUuid, associations));
              promises.push(
                MetadataService.fetchSystemMetadataUuid('published')
                  .then(function(published_uuid){
                    MetadataService.addAssociation(published_uuid,fileUuid);
                    console.log('published: '+published_uuid+' , FileUUID: '+fileUuid)
                  }
                )
              );
              promises.push(
                MetadataService.fetchSystemMetadataUuid('stagged')
                  .then(function(stagged_uuid){
                    self.removeAssociation(stagged_uuid, fileUuid);
                  }
                )
              );
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
    }

    this.rejectStaggingRequest = function(metadataUuid, uuidToReject, reason){
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
          if (body.value.rejected.indexOf(uuidToReject) < 0){
            body.value.rejected.push(uuidToReject);
          }
          //self.addToRejected(uuidToReject, reason);
          //alert(angular.toJson(rejected))
        //  body.value.rejected = rejected
          MetaController.updateMetadata(body,metadataUuid)
          .then(
            function(response){
              
              // put the rejected uuid and reason in the rejected metadata container object
              // get the metadata object that holds all rejected file ids.
              MetadataService.fetchSystemMetadataUuid('rejected')
               .then(function(rejected_uuid){
                //MetadataService.addAssociation(rejected_uuid, uuidToReject);

  	            MetaController.getMetadata(rejected_uuid)
                  .then(function(response){

                    var metadatum = response.result;
                    var body = {};
                    body.name = metadatum.name;
                    body.value = metadatum.value;
                    body.schemaId = metadatum.schemaId;
                    body.associationIds = metadatum.associationIds;
                    body.value.title = metadatum.value.title;
                    body.value.reasons = metadatum.value.reasons;
                    if (typeof body.value.reasons === 'undefined') {
                      body.value.reasons = [];
                    }
                    if (body.associationIds.indexOf(uuidToReject) < 0){
                      body.associationIds.push(uuidToReject);
                      body.value.reasons.push(reason);
                    }
                    MetaController.updateMetadata(body,rejected_uuid)
                      .then(
                        function(response){
                          //App.alert({message: $translate.instant('success_metadata_update'),closeInSeconds: 5 });
                        },
                        function(response){
                          //MessageService.handle(response, $translate.instant('error_metadata_update_assocation'));
                        }
                      )

                });
              });
              App.alert({message: $translate.instant('success_metadata_update'),closeInSeconds: 5 });
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
          deferredHandler(data, deferred, $translate.instant('error_metadata_update_assocation'));

      });
      return true;
    }
}]);
