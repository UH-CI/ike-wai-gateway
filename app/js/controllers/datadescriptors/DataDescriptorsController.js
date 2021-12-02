angular.module('AgaveToGo').controller('DataDescriptorsController', function ($scope, $state, $stateParams, $translate, $uibModal, $rootScope, $localStorage, MetaController, FilesController, ActionsService, MessageService, MetadataService) {
  $scope._COLLECTION_NAME = 'metadata',
    $scope._RESOURCE_NAME = 'metadatum';
  $scope.showModal = false;

  $scope.profile = $localStorage.activeProfile;
  $scope.get_editors = function () {
    $scope.editors = MetadataService.getAdmins();
    $scope.edit_perm = $scope.editors.indexOf($scope.profile.username) > -1;
  }
  $scope.get_editors();

  //Don't display metadata of these types
  $scope.ignoreMetadataType = ['published', 'stagged', 'staged', 'PublishedFile', 'rejected'];
  //Don't display metadata schema types as options
  $scope.ignoreSchemaType = ['PublishedFile'];
  $scope.approvedSchema = ['DataDescriptor']
  $scope.queryLimit = 99999;

  $scope.offset = 0;
  $scope.limit = 500;
  $scope.hasFiles = false;

  $scope.sortType = 'name';
  $scope.sortReverse = true;
  $scope.status = 'active';
  $scope.available = true;
  $scope.query = "{'name':{'$in': ['" + $scope.approvedSchema.join("','") + "'] }}";
  //$scope.schemaQuery = "{'schema.title':{'$in': ['" + $scope.approvedSchema.join("','") +"'] }}"
  $scope.schemaQuery = "{'schema.title':'DataDescriptor'}"

  $scope.schemaBox = { val1: true, val2: true, val5: true };
  $scope.wellbox = true;
  $scope.searchField = { value: '' }

  // ikewai or hydroshare. Used to show correct buttons.
  $scope.pushLocation = "";

  $scope.searchAll = function () {
    $scope.requesting = true;
    var orquery = {}
    var andquery = {}
    var queryarray = []
    var andarray = []
    var innerquery = {}
    var typearray = []
    if ($scope.searchField.value != '') {
      console.log('searching')
      var vquery = {}
      vquery['owner'] = { $regex: $scope.searchField.value, '$options': 'i' }
      queryarray.push(vquery)
      angular.forEach($scope.metadataschema.schema.properties, function (val, key) {
        var valquery = {}
        valquery['value.' + key] = { $regex: $scope.searchField.value, '$options': 'i' }
        queryarray.push(valquery)
      })

      orquery['$or'] = queryarray;
    }
    var typequery = {}
    var textquery = { '$text': { '$search': $scope.searchField.value } }
    if ($scope.schemaBox.val1) {
      typearray.push('DataDescriptor')
    }
    typequery['name'] = { '$in': typearray }
    andarray.push(typequery)
    andarray.push(orquery)
    //if($scope.searchField.value){
    //  andarray.push(textquery)
    //}
    andquery['$and'] = andarray;
    $scope.query = JSON.stringify(andquery);

    MetaController.listMetadata($scope.query, $scope.limit, $scope.offset).then(
      function (response) {
        if (response.result.length == $scope.limit) {
          $scope.can_fetch_more = true;
        } else {
          $scope.can_fetch_more = false;
        }
        $scope.totalItems = response.result.length;
        $scope.pagesTotal = Math.ceil(response.result.length / $scope.limit);
        $scope[$scope._COLLECTION_NAME] = response.result;
        $scope.requesting = false;
        $scope.getPushedToAnnotatedRepoStatus();
      },
      function (response) {
        MessageService.handle(response, $translate.instant('error_metadata_list'));
        $scope.requesting = false;
      }
    );
  }

  // A loophole was discovered where a user could push a file to the annotated repo,
  // which marks the associated data descriptor as "published" but then associate the
  // data descriptor with another file which hasn't been pushed to the repo.  The data
  // descriptor was getting shown as ready to push to Hydroshare/Ikewai even though not
  // all of the files are in the annotated repo.  So, we are going to start ignoring the
  // pushed status of the data descriptor and rely on the files pushed status.  Hence this method.
  $scope.getPushedToAnnotatedRepoStatus = function() {
    // for each data descriptor, need:
    //    count of all non-ikewai-annotated-repo system files
    //    count of all ikewai-annotated-repo system file.  
    //    if the numbers don't match, override that dataDescriptor's published value.
    var dataDescriptors = $scope[$scope._COLLECTION_NAME];
    angular.forEach(dataDescriptors, function (dataDescriptor) {
      // At first I wrote this to only evaluate if the datadescriptor.value.published property equaled true,
      // but then what happens if the user makes another change to the dd and save it?  Now this value gets saved.
      // so, I got rid of that evaluation and now set this based on if there are any annotated files at all,
      // and if the number of annotated files matches the number of non-annotated associated files.
      //if (dataDescriptor.value.published === 'True') {
        console.log("Entry: " + dataDescriptor);
        var myDataCount = 0;
        var annotatedCount = 0;
        angular.forEach(dataDescriptor._links.associationIds, function (item) {
          // rel: "2755951868659691030-242ac113-0001-002"
          // href: "https://ikeauth.its.hawaii.edu/files/v2/media/system/mydata-jgeis//jgeis/KiraAndSugarGlider.jpg"
          // title: "file"

          // rel: "5743004110090137110-242ac113-0001-002"
          // href: "https://ikeauth.its.hawaii.edu/files/v2/media/system/ikewai-annotated-data//new_data/KiraAndSugarGlider.jpg"
          // title: "file"
          if (item.title === 'file') {
            // found there was a file item with a null href, so had to add this value check.
            if (item.href) {
              if (item.href.includes("media/system/mydata")) { myDataCount += 1;}
              else if (item.href.includes("media/system/ikewai-annotated-data")) { annotatedCount += 1;}
            }
          }
        });
        if (annotatedCount > 0 && (myDataCount === annotatedCount)) {
          dataDescriptor.value.published = 'True';
        }
        else {
          dataDescriptor.value.published = 'False';
        }
      //}
    });
  }

  $scope.fetchMoreMetadata = function () {
    $scope.offset = $scope.offset + $scope.limit
    $scope.requesting = true
    MetaController.listMetadata($scope.query, $scope.limit, $scope.offset)
      .then(
        function (response) {
          if (response.result.length == $scope.limit) {
            $scope.can_fetch_more = true;
          } else {
            $scope.can_fetch_more = false;
          }
          $scope[$scope._COLLECTION_NAME] = $scope[$scope._COLLECTION_NAME].concat(response.result)
          $scope.totalItems = $scope[$scope._COLLECTION_NAME].length;
          $scope.pagesTotal = Math.ceil($scope[$scope._COLLECTION_NAME].length / $scope.limit);
          $scope.requesting = false;
        },
        function (response) {
          MessageService.handle(response, $translate.instant('error_metadata_list'));
          $scope.requesting = false;
        }
      );
  }

  $scope.refresh = function () {
    $scope.requesting = true;
    console.log("DataDescriptorsController.refresh query: " + $scope.schemaQuery)
    MetadataService.fetchSystemMetadataSchemaUuid('DataDescriptor')
      .then(function () {
        uuid = $localStorage["schema_DataDescriptor"]
        //console.log(angular.toJson(uuid))
        MetaController.getMetadataSchema(uuid, 1, 0

        ).then(function (response) {
          console.log("METADATA SCHEMA: " + angular.toJson(response))
          $scope.metadataschema = response.result;
          $scope.requesting = false;
        })
        $scope.searchAll();
      })
  };

  $scope.searchTools = function (query) {
    $scope.query = query;
    $scope.refresh();
  };


  $scope.refresh();

  $rootScope.$on("metadataUpdated", function () {
    $scope.refresh();
  });

  $scope.confirmDelete = function (metadatum) {
    MetaController.deleteMetadata(metadatum.uuid)
      .then(
        function (response) {
          $scope.metadata.splice($scope.metadata.indexOf(metadatum), 1)
          App.alert({ message: 'Data Descriptor Successfully Deleted.', closeInSeconds: 5 });
        },
        function (response) {
          App.alert({ type: 'danger', message: 'Error Deleting Data Descriptor!', closeInSeconds: 5 });
        }
      )
  }


  /////////Modal Stuff/////////////////////



  $scope.openCreate = function (selectedSchemaUuid, size) {
    $scope.selectedSchemaUuid = selectedSchemaUuid;
    //$state.go("datadescriptor",{'uuid': selectedSchemaUuid, 'action': 'create'}); 
    $scope.uuid = selectedSchemaUuid;
    $scope.action = "create";
    var modalInstance = $uibModal.open({
      animation: $scope.animationsEnabled,
      //templateUrl: 'views/modals/ModalViewDataDescriptor.html',
      templateUrl: 'views/datadescriptor/manager.html',
      controller: 'DataDescriptorController',
      scope: $scope,
      size: size,
      backdrop: 'static',
      keyboard: false,
      uuid: selectedSchemaUuid,
      profile: $scope.profile,
      resolve: {

      }
    });
    ga('create', 'UA-127746084-1', 'auto');
    ga('send', 'pageview', {
      page: '/app/views/datadescriptor/manager.html',
      title: '`Ike Wai Gateway | Data Descriptor Create'
    });
  };

  $scope.openClone = function (dataDescriptorUuid, size) {
    //$state.go("datadescriptor",{'uuid': dataDescriptorUuid, 'action': 'clone'}); 
    $scope.uuid = dataDescriptorUuid;
    $scope.action = "clone";
    var modalInstance = $uibModal.open({
      animation: $scope.animationsEnabled,
      //templateUrl: 'views/modals/ModalViewDataDescriptor.html',
      templateUrl: 'views/datadescriptor/manager.html',
      controller: 'DataDescriptorController',
      scope: $scope,
      size: size,
      backdrop: 'static',
      keyboard: false,
      uuid: dataDescriptorUuid,
      profile: $scope.profile,
      resolve: {

      }
    });
    ga('create', 'UA-127746084-1', 'auto');
    ga('send', 'pageview', {
      page: '/app/views/datadescriptor/manager.html',
      title: '`Ike Wai Gateway | Data Descriptor Clone'
    });
  };

  $scope.openEdit = function (dataDescriptorUuid, size) {
    $scope.metadataUuid = dataDescriptorUuid;
    //$state.go("datadescriptor",{'uuid': dataDescriptorUuid, 'action': 'edit'}); 
    $scope.uuid = dataDescriptorUuid;
    $scope.action = "edit";
    var modalInstance = $uibModal.open({
      animation: $scope.animationsEnabled,
      //templateUrl: 'views/modals/ModalViewDataDescriptor.html',
      templateUrl: 'views/datadescriptor/manager.html',
      controller: 'DataDescriptorController',
      scope: $scope,
      size: size,
      backdrop: 'static',
      keyboard: false,
      uuid: dataDescriptorUuid,
      profile: $scope.profile,
      resolve: {

      }
    });
    ga('create', 'UA-127746084-1', 'auto');
    ga('send', 'pageview', {
      page: '/app/views/datadescriptor/manager.html',
      title: '`Ike Wai Gateway | Data Descriptor Edit'
    });
  };

  // metadatumUuid is really dataDescriptorUuid, but since I'm modifying
  // an old method and don't want a bunch of arbitrary changes to show 
  // during a comparison, I just do an assignment on the first line.
  $scope.addClone = function (dataDescriptorUuid) {
    //console.log("JEN DDC: DataDescriptorsController.addClone from dd: " + dataDescriptorUuid);
    metadatumUuid = dataDescriptorUuid;
    if (metadatumUuid) {
      $scope.requesting = true;
      MetaController.getMetadata(metadatumUuid)
        .then(function (response) {
          $scope.metadatum = response.result;
          var body = {};
          body.name = $scope.metadatum.name;
          body.value = $scope.metadatum.value;
          body.value.title = body.value.title + "_Clone"
          body.value.published = "False"
          body.schemaId = $scope.metadatum.schemaId;

          // clear out any of the stage/push/doi stuff as this is supposed to be a new data descriptor
          body.value.ikewaiPushed = "False";
          body.value.pushedToIkewai = false;
          body.value.pushedToIkewaiDate = "";
          body.value.hydroPushed = "False";
          body.value.pushedToHydroshare = false;
          body.value.pushedToHydroshareDate = "";
          body.value.stagedToIkewai = false;
          body.value.stagedToHydroshare = false;
          body.value.stagedToHydroshareDate = "";
          body.value.rejectedFromHydroshare = false;
          body.value.rejectedReasonHydroshare = "";
          body.value.rejectedFromIkewai = false;
          body.value.rejectedReasonIkewai = "";
          body.value.hydroshareResourceId = "";
          body.value.hasDOI = false;
          body.value.doi = "";
          body.value.gotDOIDate = "";
          body.value.published = "False";

          if ($stateParams.fileUuids) {
            body.associationIds = $stateParams.fileUuids
          }
          body.associationIds = [];
          //copy metadata associations
          angular.forEach($scope.metadatum._links.associationIds, function (associationId, key) {
            console.log(associationId.title)
            if (associationId.title == 'metadata') {
              body.associationIds.push(associationId.rel)
            }
          });
          MetaController.addMetadata(body)
            .then(
              function (response) {
                //$modalInstance.close();
                $scope.new_metadataUuid = response.result.uuid;
                $scope.ddUuid = $scope.new_metadataUuid;
                MetadataService.addDefaultPermissions($scope.new_metadataUuid);
                App.alert({
                  message: $translate.instant('success_metadata_add') + ' ' + body.name,
                  closeInSeconds: 5
                });

                $scope.requesting = false;
                //$scope.openEditMetadata($scope.new_metadataUuid,'lg')
                console.log("clone made, new dd: " + $scope.new_metadataUuid);

                $scope.openEdit($scope.new_metadataUuid, 'lg')
                //$state.go('datadescriptor', {
                //  uuid: $scope.new_metadataUuid,
                //  "action": "edit"
                //});

                //$scope.openEditDataDescriptor($scope.new_metadataUuid,'lg');

              },
              function (response) {
                MessageService.handle(response, $translate.instant('error_metadata_add'));
                $scope.requesting = false;
              }
            )
        })
    } else {
      App.alert({
        type: 'danger',
        message: $translate.instant('Error accessing existing Data Descriptor!'),
        closeInSeconds: 5
      });
    }
    //$scope.close();
    $scope.requesting = false;
  }

  $scope.updateDataDescriptor = function (dataDescriptor) {
    console.log("DataDescriptorsController: updateDataDescriptor: " + dataDescriptor.uuid);
    $scope.requesting = true;

    //MetadataService.fetchSystemMetadataSchemaUuid('DataDescriptor')
    //  .then(function (response) {
    var body = {};
    body.name = dataDescriptor.name;
    body.value = dataDescriptor.value;
    body.schemaId = dataDescriptor.schemaId;
    body.associationIds = dataDescriptor.associationIds;

    MetaController.updateMetadata(body, dataDescriptor.uuid)
      .then(
        function (response) {
          //$scope.metadataUuid = response.result.uuid;
          App.alert({
            message: "Success",
            closeInSeconds: 5
          });
        },
        function (response) {
          MessageService.handle(response, $translate.instant('error_metadata_add'));
          $scope.requesting = false;
        }
      );
    $scope.requesting = false;
    console.log("DataDescriptorsController: updateDataDescriptor done");
  }

  $scope.unstageFromIkewai = function (dataDescriptor) {
    console.log("DataDescriptorsController.unstageFromIkewai: " + dataDescriptor);
    $scope.requesting = true;
    if (typeof dataDescriptor !== "undefined") {
      if (dataDescriptor.value.stagedToIkewai) {
        dataDescriptor.stagedToIkewai = false;
        dataDescriptor.value.stagedToIkewai = false;
        console.log("JG: Setting unstageFromIkewai: " + dataDescriptor);
        $scope.updateDataDescriptor(dataDescriptor);
      }
    }
    $scope.requesting = false;
  }

  $scope.unstageFromHydroshare = function (dataDescriptor) {
    console.log("DataDescriptorsController.unstageFromHydroshare: " + dataDescriptor.uuid);
    $scope.requesting = true;
    if (typeof dataDescriptor !== "undefined") {
      if (dataDescriptor.value.stagedToHydroshare) {
        dataDescriptor.stagedToHydroshare = false;
        dataDescriptor.value.stagedToHydroshare = false;
        console.log("JG: Setting unstageFromHydroshare: " + dataDescriptor);
        //$scope.datadescriptor = $scope.data_descriptor_metadatum.value;
        $scope.updateDataDescriptor(dataDescriptor);
      }
    }
    $scope.requesting = false;
  }

  $scope.openStageHydroshare = function (dataDescriptorUuid, size) {
    console.log("DataDescriptorsController.openStageHydroshare");
    $scope.uuid = dataDescriptorUuid;
    $scope.action = "push";
    $scope.pushLocation = "hydroshare";
    var modalInstance = $uibModal.open({
      animation: $scope.animationsEnabled,
      //templateUrl: 'views/modals/ModalViewDataDescriptor.html',
      templateUrl: 'views/datadescriptor/manager.html',
      controller: 'DataDescriptorController',
      scope: $scope,
      size: size,
      backdrop: 'static',
      keyboard: false,
      uuid: dataDescriptorUuid,
      profile: $scope.profile,
      resolve: {

      }
    });
    ga('create', 'UA-127746084-1', 'auto');
    ga('send', 'pageview', {
      page: '/app/views/datadescriptor/manager.html',
      title: '`Ike Wai Gateway | Push to Hydroshare'
    });
  };

  $scope.openStageIkewai = function (dataDescriptorUuid, size) {
    $scope.uuid = dataDescriptorUuid;
    $scope.action = "push";
    $scope.pushLocation = "ikewai";
    var modalInstance = $uibModal.open({
      animation: $scope.animationsEnabled,
      //templateUrl: 'views/modals/ModalViewDataDescriptor.html',
      templateUrl: 'views/datadescriptor/manager.html',
      controller: 'DataDescriptorController',
      scope: $scope,
      size: size,
      backdrop: 'static',
      keyboard: false,
      uuid: dataDescriptorUuid,
      profile: $scope.profile,
      resolve: {

      }
    });
    ga('create', 'UA-127746084-1', 'auto');
    ga('send', 'pageview', {
      page: '/app/views/datadescriptor/manager.html',
      title: '`Ike Wai Gateway | Push to Ikewai.org'
    });
  };

  $scope.openViewDataDescriptor = function (dataDescriptorUuid, size) {
    $scope.uuid = dataDescriptorUuid;
    $scope.action = "view";
    var modalInstance = $uibModal.open({
      animation: $scope.animationsEnabled,
      //templateUrl: 'views/modals/ModalViewDataDescriptor.html',
      templateUrl: 'views/datadescriptor/manager.html',
      controller: 'DataDescriptorController',
      scope: $scope,
      size: size,
      backdrop: 'static',
      keyboard: false,
      uuid: dataDescriptorUuid,
      profile: $scope.profile,
      resolve: {

      }
    });
    ga('create', 'UA-127746084-1', 'auto');
    ga('send', 'pageview', {
      page: '/app/views/datadescriptor/manager.html',
      title: '`Ike Wai Gateway | Data Descriptor View'
    });
  };

  $scope.addOldAssociations = function () {
    console.log("Starting")
    var assocs = []
    angular.forEach($scope.metadata, function (value, key) {
      MetadataService.removeAssociation(value.uuid, value.uuid)
      /* MetaController.listMetadata("{'associationIds':'"+value.uuid+"'}",1000,0)
         .then(function (response) {
             assocs = []
             angular.forEach(response.result, function(val,key){
               if(val.name == 'File'){
                  angular.forEach(val._links.associationIds, function(v,key){
                      //if(v.title == 'file'){
                          assocs.push(v.rel)
                      //}
                      MetadataService.addAssociation(value.uuid, v.rel)   
                  })
               }else{
                 assocs.push(val.uuid)
                 MetadataService.addAssociation(value.uuid, val.uuid)   
               }
             })
             console.log("New Associations "+angular.toJson(value.value.title)+": " + angular.toJson(assocs))
         })
         */
    })
  }
});
