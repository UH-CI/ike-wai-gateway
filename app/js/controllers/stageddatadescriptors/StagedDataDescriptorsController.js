angular.module('AgaveToGo').controller('StagedDataDescriptorsController', function ($scope, $state, $stateParams, $translate, $uibModal, $rootScope, $localStorage, MetaController, FilesController, ActionsService, MessageService, MetadataService) {
    $scope._COLLECTION_NAME = 'metadata',
    $scope._RESOURCE_NAME = 'metadatum';
    $scope.showModal = false;

    $scope.profile = $localStorage.activeProfile;
    $scope.get_editors = function(){
      $scope.editors = MetadataService.getAdmins();
      $scope.edit_perm = $scope.editors.indexOf($scope.profile.username) > -1;
    }
    $scope.get_editors();

    //Don't display metadata of these types
    $scope.ignoreMetadataType = ['published','stagged','staged','PublishedFile','rejected'];
    //Don't display metadata schema types as options
    $scope.ignoreSchemaType = ['PublishedFile'];
    $scope.approvedSchema = ['DataDescriptor']
    $scope.queryLimit = 99999;

    $scope.offset = 0;
    $scope.limit = 500;
    $scope.hasFiles = false;

    $scope.sortType = 'name';
    $scope.sortReverse  = true;
    $scope.status = 'active';
    $scope.available = true;
    $scope.query = "{'name':{'$in': ['" + $scope.approvedSchema.join("','") +"'] }}";
    $scope.schemaQuery = "{'schema.title':'DataDescriptor'}"

    $scope.schemaBox = {val1:true,val2:true,val5:true};
    $scope.wellbox = true;
    $scope.searchField = {value:''}

    $scope.searchAll = function(){
      $scope.requesting = true;
        var orquery = {}
        var andquery = {}
        var queryarray = []
        var andarray = []
        var innerquery = {}
        var typearray = []
        if ($scope.searchField.value != ''){
            console.log('searching')
            var vquery = {}
            vquery['owner'] = {$regex: $scope.searchField.value, '$options':'i'}
            queryarray.push(vquery)
              angular.forEach($scope.metadataschema.schema.properties, function(val, key){
                var valquery = {}
                valquery['value.'+key] = {$regex: $scope.searchField.value, '$options':'i'}
                queryarray.push(valquery)
              })
         
          orquery['$or'] = queryarray;
       }
        var typequery = {}
        var textquery = {'$text':{'$search':$scope.searchField.value}}
        if ($scope.schemaBox.val1){
          typearray.push('DataDescriptor')
        }
        typequery['name'] = {'$in': typearray}
        andarray.push(typequery)

        // limit results to DDs that are stagedToIkewai or stagedToHydroshare
        var stagedVals = {'$or':[{'value.stagedToIkewai':true},{'value.stagedToHydroshare':true}]};
        andarray.push(stagedVals);
        andarray.push(orquery)

        andquery['$and'] = andarray;
        $scope.query = JSON.stringify(andquery);
        console.log("JG Query: " + $scope.query);
        MetaController.listMetadata($scope.query,$scope.limit,$scope.offset).then(
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
          },
          function(response){
            MessageService.handle(response, $translate.instant('error_metadata_list'));
            $scope.requesting = false;
          }
      );
    }

    /*
    $scope.publishStagedDDToIkewai = function (ddUID) {
      var dd = "";
      $scope[$scope._COLLECTION_NAME].forEach(function (metadata) {
        if (metadata.uuid === ddUID) {
          //console.log("match: " + metadata.uuid);
          dd = metadata;
        }
      });
      //console.log("staged? " + dd.value.stagedToHydroshare);
      dd.value.stagedToIkewai = false;
      dd.value.pushedToIkewai = true;
      $scope.updateDataDescriptor(dd);
    }

    $scope.publishStagedDDToHydroshare = function (ddUID) {

    // TODO: Send the data off to Hydroshare.
      var dd = "";
      $scope[$scope._COLLECTION_NAME].forEach(function (metadata) {
        if (metadata.uuid === ddUID) {
          //console.log("match: " + metadata.uuid);
          dd = metadata;
        }
      });
      //console.log("staged? " + dd.value.stagedToHydroshare);
      dd.value.stagedToHydroshare = false;
      dd.value.pushedToHydroshare = true;
      $scope.updateDataDescriptor(dd);
    }
    */

    $scope.publishStagedDDToIkewai = function (dataDescriptor) {
      //console.log("staged? " + dd.value.stagedToHydroshare);
      dataDescriptor.value.stagedToIkewai = false;
      dataDescriptor.value.pushedToIkewai = true;
      $scope.updateDataDescriptor(dataDescriptor);
    }

    $scope.publishStagedDDToHydroshare = function (dataDescriptor) {
      
      // Send the data off to Hydroshare.
      //var userInfoURL = `https://www.hydroshare.org/hsapi/userInfo/?access_token=${$scope.accessToken}&format=json`;
      var hsURL = `${baseHSURL}/hsapi/resource/?access_token=${$scope.hydroshareAccessToken}`;

      // TODO: some of these have multiple entries (like creator), need to handle that
      var hsData = `{
          "title": "${dataDescriptor.title}",
          "author": "Jennifer Geis",
          "creator": "${dataDescriptor.creators.first_name} ${dataDescriptor.creators.last_name} ",
          "from_date": "2019-10-09",
          "to_date": "2019-10-10",
          "abstract": "some abstract description",
          "keywords": [
              "keyword1",
              "keyword2"
          ],
          "abstract": "abstract string",
          "resource_type": "CompositeResource"
      }`;
      // file=@/PATH/TO/A/FILE
      // metadata = '[{"coverage":{"type":"period", "value":{"start":"01/01/2000", "end":"12/12/2010"}}}, {"creator":{"name":"John Smith"}}, {"creator":{"name":"Lisa Miller"}}]'
      // extra_metadata = '{"key-1": "value-1", "key-2": "value-2"}'
      // "edit_groups": set(page.edit_groups.all()),
      // "view_groups": set(page.view_groups.all()),
      // "edit_users": set(page.edit_users.all()),
      // "view_users": set(page.view_users.all()),
      // "can_edit": (user in set(page.edit_users.all())) \
      //             or (len(set(page.edit_groups.all()).intersection(set(user.groups.all()))) > 0)
      /*
      console.log("hsURL: " + hsURL);
      $http({
          method: 'POST',
          url: hsURL,
          data: hsData
      }).then(function successCallback(response) {
          // JG TODO: need to add error checking, check for error result from HS as well
          console.log("success");
          $scope.responseData = response.data;
          //console.log("userInfo: " + $scope.userInfo);
          console.log("resource_id: " + $scope.responseData.resource_id);
          // format:  {"username":"jgeis@hawaii.edu","first_name":"Jennifer","last_name":"Geis","title":"Software Engineer","id":1501,"organization":"University of Hawaii","email":"jgeis@hawaii.edu"}
      }, function errorCallback(response) {
          alert("HydroshareOAuthController.submitToHydroshare Error. Try Again!");
      });


      //console.log("staged? " + dd.value.stagedToHydroshare);
      // mark the dd as being "pushedToHydroshare" and no longer staged.
      dataDescriptor.value.stagedToHydroshare = false;
      dataDescriptor.value.pushedToHydroshare = true;
      $scope.updateDataDescriptor(dataDescriptor);
      */
    }

    $scope.updateDataDescriptor = function (dataDescriptor) {
      console.log("JEN StagedDescriptorController: updateDataDescriptor");
      $scope.requesting = true;

      //MetadataService.fetchSystemMetadataSchemaUuid('DataDescriptor')
      //  .then(function (response) {
      var body = {};
      body.name = dataDescriptor.name;
      body.value = dataDescriptor.value;
      body.schemaId = dataDescriptor.schemaId;
      body.associationIds = dataDescriptor.associationIds;

      MetaController.updateMetadata(body, dataDescriptor.uuid)
        .then(function (response) {
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

      //});
      $scope.requesting = false;
      console.log("JEN StagedDescriptorController: updateDataDescriptor done");
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
               $scope[$scope._COLLECTION_NAME]=  $scope[$scope._COLLECTION_NAME].concat(response.result)
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

    $scope.refresh = function() {
      $scope.requesting = true;
      console.log("StagedDataDescriptorsController.refresh query: " + $scope.schemaQuery)
      MetadataService.fetchSystemMetadataSchemaUuid('DataDescriptor')
      .then(function(){
          uuid = $localStorage["schema_DataDescriptor"]
          //console.log(angular.toJson(uuid))
          MetaController.getMetadataSchema(uuid,1,0
    				
    			).then(function(response){
            console.log("METADATA SCHEMA: "+ angular.toJson(response))
    				$scope.metadataschema = response.result;
    				$scope.requesting = false;
    			})
          $scope.searchAll();
      })
    };

    $scope.searchTools = function(query){
      $scope.query = query;
      $scope.refresh();
    };


    $scope.refresh();

    $rootScope.$on("metadataUpdated", function(){
      $scope.refresh();
    });

/////////Modal Stuff/////////////////////



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
        keyboard : false,
        uuid: dataDescriptorUuid,
        profile: $scope.profile,
        resolve: {

        }
      });
      ga('create', 'UA-127746084-1', 'auto');
      ga('send', 'pageview', {
        page:'/app/views/datadescriptor/manager.html', 
        title:'`Ike Wai Gateway | Data Descriptor View' 
      });
    };
   
    // rejectType is either 'ikewai' or 'hydroshare'
    $scope.openRejectReasonModal = function (dataDescriptor, size, rejectType) {
      console.log("StagedDataDescriptorsController.openRejectReasonModal: " + dataDescriptor);
      $scope.rejectedDD = dataDescriptor; 
      $scope.rejectType = rejectType;
      var modalInstance = $uibModal.open({
        animation: $scope.animationsEnabled,
        templateUrl: 'views/modals/ModalRejectStagingRequestReason.html',
        controller: 'ModalRejectDataDescriptorStagingRequestController',
        scope: $scope,
        size: size,
        resolve: {

        }
      }
      );
    }

    $scope.$on("dd.staging.request.rejected", function (event, reason) {
      console.log("dd.staging.request.rejected: " + $scope.rejectedDD);
      $scope.requesting = true;
      var metadataType = ''
      if ($scope.rejectType === 'ikewai') {
        metadataType = 'stagedToIkewai'
        $scope.rejectedDD.value.rejectedFromIkewai = true;
        $scope.rejectedDD.value.stagedToIkewai = false;
      }
      else if ($scope.rejectType === 'hydroshare') {
        metadataType = 'stagedToHydroshare';
        $scope.rejectedDD.value.rejectedFromHydroshare = true;
        $scope.rejectedDD.value.stagedToHydroshare = false;
      }
      $scope.rejectedDD.value.rejectedReason = reason;
      console.log("metadataType: " + metadataType);
      console.log("reason: " + reason);
      $scope.updateDataDescriptor($scope.rejectedDD);
      
      /*
      var user_email = current_stagged.value.emails[$scope.rejectedUuid]
      var post_data = {}//to:"seanbc@hawaii.edu",from:"noReply-ikewai@hawaii.edu",subject:"Staged Updated",message:"User: "+ email+" has updated stagged files."};
      var url = $localStorage.tenant.baseUrl.slice(0, -1) + ':8080/email?to=' + user_email + '&from=noReply-ikewai@hawaii.edu&subject="Revise Staged File ' + href.split('system')[1] + '"&message="User: ' + user_email + ' your staged file ' + href.split('system')[1] + ' was flagged for review. \nPlease log into the Ike Wai Gateway and address the following: \n' + reason + '"';
      var options = {
        headers: { 'Authorization': 'Bearer ' + $localStorage.token.access_token }
      }
      $http.post(url, post_data, options)
        .success(function (data, status, headers, config) {
          console.log({ message: angular.toJson(data) })
          var url2 = $localStorage.tenant.baseUrl.slice(0, -1) + ':8080/email?to=uhitsci@gmail.com&from=noReply-ikewai@hawaii.edu&subject="Revise Staged File ' + href.split('system')[1] + '"&message="User: ' + user_email + ' your staged file ' + href.split('system')[1] + ' was flagged for review.\nPlease log into the Ike Wai Gateway and address the following: \n' + reason + '"';
          $http.post(url2, post_data, options)
            .success(function (data, status, headers, config) {
            })
            .error(function (data, status, header, config) {
              console.log({ error_message: angular.toJson(data) });
            });
        })
        .error(function (data, status, header, config) {
          console.log({ error_message: angular.toJson(data) });
        });
      $timeout(function () { $scope.getMetadatum() }, 400);
      $scope.getMetadatum();
      //$scope.requesting = false;
      */
    }); //end of '$scope.$on'

});
