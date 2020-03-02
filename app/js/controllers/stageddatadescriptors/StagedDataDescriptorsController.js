angular.module('AgaveToGo').controller('StagedDataDescriptorsController', function ($scope, $http, $state, $stateParams, $translate, $uibModal, $rootScope, $localStorage, MetaController, FilesController, ActionsService, MessageService, MetadataService) {
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

    $scope.getAuthors = function (dataDescriptor) {
      /* 
      ex: "creators":[{"first_name":"Kiana",
      "last_name":"Frank",
      "organization":"University of Hawaiʻi at Manoa",
      "phone":"(808) 956-0403",
      "email":"klfrank@hawaii.edu",
      "uuid":"5977219466484968985-242ac1110-0001-012"},

      {"first_name":"Diamond",
      "last_name":"Tachera",
      "organization":"University of Hawaiʻi at Manoa",
      "email":"diamondt@hawaii.edu",
      "uuid":"4865671556713222631-242ac1110-0001-012"}]
      */
      var arr = [];
      // our "creator" is HS's "author"
      var authors = dataDescriptor.value.creators;
      var spacer = ", ";
      angular.forEach(authors, function (author) {
        if (author != undefined) {
          // if either first or last is not set, don't use a comma
          if (author.first_name == undefined || author.last_name == undefined) {
            spacer = "";
            if (author.first_name == undefined) {
              author.first_name = "";
            }
            if (author.last_name == undefined) {
              author.last_name = "";
            }
          }
          arr.push(`"` + author.last_name + spacer + author.first_name + `"`);      
        }
      });
      console.log("author array: " + arr);
      var authorString = "";
      if (arr.length > 0) {
        authorString = `"authors": [${arr}],`;
      }
      return authorString;
      //return arr;
    }

    $scope.getFromDate = function(dataDescriptor) {
      //console.log("StagedDataDescriptorsController.getFromDate");
      var dString = "";
      var d = dataDescriptor.value.start_datetime;
      //console.log("from_date: " + d);
      if (d) {
        dString = `"from_date": "` + d + `",`;
      }
      //console.log("Start Date: " + dString);
      return dString;
    }

    $scope.getToDate = function(dataDescriptor) {
      //console.log("StagedDataDescriptorsController.getToDate");
      var dString = "";
      var d = dataDescriptor.value.end_datetime;
      //console.log("to_date: " + d);
      if (d) {
        dString = `"to_date": "` + d + `",`;
      }
      //console.log("To Date: " + dString);
      return dString;
    }

    $scope.getAbstract = function(dataDescriptor) {
      //console.log("StagedDataDescriptorsController.getAbstract");
      var s = "";
      var d = dataDescriptor.value.description;
      //console.log("abstract: " + d);
      if (d) {
        // strip off newlines as it make Hydroshare choke.
        s = `"abstract": "${d.replace(/(\r\n|\n|\r)/gm, "")}",`
      }
      //console.log("String: " + s);
      return s;
    }

    $scope.getKeywords = function(dataDescriptor) {
      /* format: "keywords": ["keyword1","keyword2"], */
      //console.log("StagedDataDescriptorsController.getKeywords");
      var s = "";
      var d = dataDescriptor.value.subjects;
      //console.log("subjects: " + JSON.stringify(d));
      if (d) {
        s = `"keywords": ${JSON.stringify(d)},`
      }
      //console.log("String: " + s);
      return s;
    }

    $scope.publishStagedDDToHydroshare = function (dataDescriptor) {
      console.log("StagedDataDescriptorsController.publishStagedDDToHydroshare: " + dataDescriptor.uuid);
      console.log("dataDescriptor: " + JSON.stringify(dataDescriptor));
      
      // Send the data off to Hydroshare.
      //var userInfoURL = `https://www.hydroshare.org/hsapi/userInfo/?access_token=${$scope.accessToken}&format=json`;
      baseHSURL = "https://www.hydroshare.org";

      // g6QWYGsTM1RdNG3110oS8Li41gtXgW
      var hsURL = `${baseHSURL}/hsapi/resource/?access_token=g6QWYGsTM1RdNG3110oS8Li41gtXgW`;
      //var hsURL = `${baseHSURL}/hsapi/resource/?access_token=${$rootScope.hydroshareAccessToken}`;
      console.log("hsURL: " + hsURL);

      // "creator" in Hydroshare's API is called "owner" on their interface.  
      // This is the user against whose quota the resource is counted in managing storage,
      // so for us, creator is 'ikewai.'  Need to make a creator object there and store the
      // reference here.  While technically, there can be multiple owners, for our case, we
      // will be the only one.

      // Meanwhile, our backend "creators" field is the match for HS's "authors" API field.
      // we use the term 'authors' on our interface as well, just not in the JSON.

      // "authors":"${dataDescriptor.creators.first_name} ${dataDescriptor.creators.last_name} ",

      // trying to figure out how to get all our user info into HS for authorship.
      // curl -X GET "https://www.hydroshare.org/hsapi/user/" -H "accept: application/json" -H "X-CSRFToken: CkpfWN0dmDKsZ3wYUlhjdIT7hyu0FCGh4XxUQlyvI537JCi1Yx9wzcmclKHJSdGz"
      /* {
          "username": "jgeis@hawaii.edu",
          "email": "jgeis@hawaii.edu",
          "first_name": "Jennifer",
          "id": 1501,
          "last_name": "Geis",
          "title": "Software Engineer",
          "organization": "University of Hawaii"
        }
      */

      // "authors": ["${$scope.getAuthorArray(dataDescriptor)}"],
      // "to_date": "2019-10-10",
      // "abstract": "some abstract description",
      //  "keywords": [
      //    "keyword1",
      //    "keyword2"
      //  ],

      // "creator": "ikewai",
      // ${$scope.getAuthors(dataDescriptor)}
      // ${$scope.getFromDate(dataDescriptor)}
      // ${$scope.getToDate(dataDescriptor)}
      // "availability": [ "public" ],

      /* 
      // THIS WORKS
      var hsData = `{
        "title": "some random title",
        "authors": ["Geis, Jennifer","Cleveland, Sean"],
        "creator": "ikewai",
        "to_date": "2019-10-10",
        "from_date": "2019-10-10",
        "abstract": "some abstract description",
        "keywords": [
          "keyword1",
          "keyword2"
        ],
        "availability": [ "public" ],
        "resource_type": "CompositeResource"
      }`;
      */

      /*
      // This works, the issue was the newline in the abstract
      var hsData = `{
        "title": "Diamond Tachera sampling rain water at UHH CC in August 2018",
        "creator": "ikewai",
        "authors": ["Geis, Jennifer","Cleveland, Sean"],
        "from_date": "2019-08-12",
        "abstract": "Diamond Tachera, Graduate Research Assistant, Dept. of Earth Sciences, SOEST, sampling rain water at the UH Hawaii Community College Pālamanui Campus in August 2018. Photo taken by Dr. Kiana Frank, Assistant Professor, PBRC",
        "keywords": ["sampling","rainwater","UHH","Hilo","Pālamanui","soest","pbrc","photo","ikewai"],
        "availability": [ "public" ],
        "resource_type": "CompositeResource"
      }`;
      */
      
      var hsData = `{
          "title": "${dataDescriptor.value.title}",
          "creator": "ikewai",
          ${$scope.getAuthors(dataDescriptor)}
          ${$scope.getFromDate(dataDescriptor)}
          ${$scope.getToDate(dataDescriptor)}
          ${$scope.getAbstract(dataDescriptor)}
          ${$scope.getKeywords(dataDescriptor)}
          "availability": [ "public" ],
          "resource_type": "CompositeResource"
      }`;

      console.log("request: " + hsData);

      // file=@/PATH/TO/A/FILE
      // metadata = '[{"coverage":{"type":"period", "value":{"start":"01/01/2000", "end":"12/12/2010"}}}, {"creator":{"name":"John Smith"}}, {"creator":{"name":"Lisa Miller"}}]'
      // extra_metadata = '{"key-1": "value-1", "key-2": "value-2"}'
      // "edit_groups": set(page.edit_groups.all()),
      // "view_groups": set(page.view_groups.all()),
      // "edit_users": set(page.edit_users.all()),
      // "view_users": set(page.view_users.all()),
      // "can_edit": (user in set(page.edit_users.all())) \
      //             or (len(set(page.edit_groups.all()).intersection(set(user.groups.all()))) > 0)
      
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

          // TODO: add the resource_id to the data descriptor!

          // userInfo format:  {"username":"jgeis@hawaii.edu","first_name":"Jennifer","last_name":"Geis","title":"Software Engineer","id":1501,"organization":"University of Hawaii","email":"jgeis@hawaii.edu"}
      }, function errorCallback(response) {
          alert("HydroshareOAuthController.submitToHydroshare Error. Try Again!");
      });

      
      //console.log("staged? " + dd.value.stagedToHydroshare);
      // mark the dd as being "pushedToHydroshare" and no longer staged.
      dataDescriptor.value.stagedToHydroshare = false;
      dataDescriptor.value.pushedToHydroshare = true;
      $scope.updateDataDescriptor(dataDescriptor);
      
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
