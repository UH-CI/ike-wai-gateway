angular.module('AgaveToGo').controller('StagedDataDescriptorsController', function ($scope, $http, $filter, $state, $stateParams, $translate, $uibModal, $q, $rootScope, $localStorage, MetaController, FilesController, ActionsService, MessageService, MetadataService) {
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

    $scope.locations = {};
    $scope.files = {};
    
    $scope.getFiles = function (dataDescriptor) {
      $scope.files[dataDescriptor.uuid] = [];
      console.log("StagedDataDescriptorsController.getFiles: " + dataDescriptor.uuid);
      var query = "{$and:[{'name':{'$in':['PublishedFile','File']}},{'associationIds':'" + dataDescriptor.uuid + "'}]}";
      console.log("getAssociations query: " + query);
      var limit = 100;
      var deferred = $q.defer();
      deferred.resolve(MetaController.listMetadata(query, limit, 0).then(
        function (response) {
          console.log("getFiles:" + dataDescriptor.uuid + ": " + response);
          $scope.filemetadata = response.result;
          angular.forEach($scope.filemetadata, function (associatedData) {
            console.log("fetchMetadata:" + associatedData);
            if (associatedData.name === 'File') {
              console.log('File: ' + associatedData.value);
              $scope.files[dataDescriptor.uuid].push(associatedData);
            }
          });
          $scope.requesting = false;
        },
        function (response) {
          MessageService.handle(response, $translate.instant('error_filemetadata_list'));
          $scope.requesting = false;
        }
      ));
      return deferred.promise;
    };

    $scope.getAssociations = function (dataDescriptor) {
      $scope.locations[dataDescriptor.uuid] = [];
      console.log("StagedDataDescriptorsController.getAssociations: " + dataDescriptor.uuid);
      if (dataDescriptor._links.associationIds){
        var query = "{'uuid':{'$in':['"+ dataDescriptor.associationIds.join("','") + "']}}";
        console.log("getAssociations query: " + query);
        var limit = 100;
        var deferred = $q.defer();
        deferred.resolve(MetaController.listMetadata(query, limit, 0).then(
          function (response) {
            console.log("getAssociations:" + dataDescriptor.uuid + ": " + response);
            $scope.filemetadata = response.result;
    
            //$scope.makeLocationMarkers($scope.filemetadata);
            angular.forEach($scope.filemetadata, function (associatedData) {
              console.log("fetchMetadata:" + associatedData);
              if (associatedData.name === 'Well' || 
                  associatedData.name === 'Site' || 
                  associatedData.name === 'Water_Quality_Site' || 
                  associatedData.name === 'RainfallStation') {
                console.log('Location: ' + associatedData);
                $scope.locations[dataDescriptor.uuid].push(associatedData);
              }
              if (associatedData.name === 'File') {
                console.log('File: ' + associatedData.value);
              }
              else if (value.name === 'Variable') {
                console.log('Variable: ' + associatedData.value);
              }
            });
            $scope.requesting = false;
          },
          function (response) {
            MessageService.handle(response, $translate.instant('error_filemetadata_list'));
            $scope.requesting = false;
          }
        ));
        return deferred.promise;
      }
    };
  

    // This gets us all DataDescriptors that are marked as stagedToIkewai or stagedToHydroshare
    // doesn't get location information
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
            angular.forEach($scope[$scope._COLLECTION_NAME], function (value, key) {
              $scope.getAssociations(value);
              $scope.getFiles(value);
            });

            $scope.requesting = false;
            //$scope.makeLocationMarkers(response.result);
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

    $scope.getCreators = function (dataDescriptor) {
      console.log("StagedDataDescriptorsController.getCreators");
      // need to produce something like this for each creator:
      // {"creator":{"name":"Sean Cleveland", "email":"seanbc@hawaii.edu","description":"/user/1337/"}}
      var result = '';
      // our "creator" is HS's "author"
      var creators = dataDescriptor.value.creators;
      var spacer = " ";
      angular.forEach(creators, function (creator) {
        var creatorString = '';
        if (creator != undefined) {
          // if either first or last is not set, don't use a comma
          if (creator.first_name == undefined || creator.last_name == undefined) {
            spacer = "";
            if (creator.first_name == undefined) {
              creator.first_name = "";
            }
            if (creator.last_name == undefined) {
              creator.last_name = "";
            }
          }
          var emailString = "";
          if (creator.email != undefined) {
            emailString = `",email": "${creator.email}"`;
          }

          // make sure there's at least a first name or a last name
          if (creator.first_name != "" && creator.last_name != "") {
            creatorString += `{"name":"` + creator.first_name + spacer + creator.last_name + emailString + `}`;
            //arr.push(`{"name":"${creator.last_name}${spacer}${creator.first_name}"${emailString}}`);
          } 
          if (creatorString.length > 0) {
            result = `,{"creator":` + creatorString + `}`;
          }
        }
      });
      return result;
    }

    $scope.getContributors = function (dataDescriptor) {
      console.log("StagedDataDescriptorsController.getContributors");
      // need to produce something like this for each contributor:
      // {"contributor": {"name": "Diamond Tachera", "email": "diamondt@hawaii.edu","organization": "University of Hawaii"}},
      var result = '';
      // our "contributor" is HS's "author"
      var contributors = dataDescriptor.value.contributors;
      var spacer = " ";
      angular.forEach(contributors, function (contributor) {
        var contributorString = '';
        if (contributor != undefined) {
          // if either first or last is not set, don't use a comma
          if (contributor.first_name == undefined || contributor.last_name == undefined) {
            spacer = "";
            if (contributor.first_name == undefined) {
              contributor.first_name = "";
            }
            if (contributor.last_name == undefined) {
              contributor.last_name = "";
            }
          }
          var emailString = "";
          if (contributor.email != undefined) {
            emailString = `,"email": "${contributor.email}"`;
          }
          var orgString = "";
          if (contributor.organization != undefined) {
            orgString = `,"organization": "${contributor.organization}"`;
          }

          // make sure there's at least a first name or a last name
          if (contributor.first_name != "" && contributor.last_name != "") {
            contributorString += `{"name":"` + contributor.first_name + spacer + contributor.last_name + emailString + orgString + `"}`;
            //arr.push(`{"name":"${contributor.first_name}${spacer}${contributor.last_name}"${emailString}${orgString}`);
          } 
          if (contributorString.length > 0) {
            result = `,{"contributor":` + contributorString + `}`;
          }
        }
      });
      return result;
    }

   /*
   * Returns something like: 
   * {"coverage": {
   *   "type":"box", 
   *   "value": {
   *     "units": 
   *     "Decimal degrees",
   *     "east": "-76.30288",
   *     "northlimit": "39.896164",
   *     "eastlimit": "-76.291824",
   *     "southlimit": "39.882217",
   *     "westlimit": "-76.31393"
   *   }
   *  }
   * },
   * OR (can't have both box and point at same time)
   * {"coverage":{"type":"point", "value": {"east": "56.45678", "north": "12.6789", "units": "decimal deg"}}}
   * 
   * Where to get point info in metadata object:
   * "value" : {
      "ikewai_type" : [ ],
      "name" : "Manana Trailhead_Rain_Collector",
      "id" : "Manana Trailhead",
      "latitude" : 21.4300833,
      "longitude" : -157.9380333,
      "loc" : {
        "type" : "Point",
        "coordinates" : [ -157.9380333, 21.4300833 ]
      }
    },
    longitude = east, latitude = north
   */
  $scope.getLocations = function(dataDescriptor) {
    console.log("StagedDataDescriptorsController.getLocations");
  
    var ddLocations = $scope.locations[dataDescriptor.uuid];
    var result = '';
    angular.forEach(ddLocations, function(datum) {
      console.log("Datum: " + datum);
      if (datum.name == "Site") {
        if (datum.value.loc != undefined && datum.value.name != undefined) {
          if (datum.value.loc.type == 'Point') {
            if (datum.value.latitude != undefined && datum.value.longitude != undefined) {
              // ex1: {"coverage":{"type":"point", "value": {"east": "56.45678", "north": "12.6789", "units": "decimal deg", "name": "12232"}}}
              // ex2: {"coverage":{"type":"point", "value":{"units": "Decimal degrees","east": "-84.0465","north": "49.6791","name": "12232","projection": "WGS 84 EPSG:4326"}}}
              result += ',{"coverage":{"type":"point", "value": {"east": "' + datum.value.longitude + 
              '", "north": "' + datum.value.latitude + 
              '", "units": "Decimal Degrees", "name": "' + datum.value.name + '"}}}';
            }
          }
          else {
            // polygons aren't handled by HS right now, only boxes and points
          }
        }
      }
      else if (datum.name == "Well") {
        if (datum.value.latitude != undefined && datum.value.longitude != undefined) {
          result += ',{"coverage":{"type":"point", "value": {"east": "' + datum.value.longitude + 
          '", "north": "' + datum.value.latitude + 
          '", "units": "Decimal Degrees", "name": "' + datum.value.well_name + '"}}}';
        }
      }
      else if (datum.name == "Water_Quality_Site") {
        if (datum.value.latitude != undefined && datum.value.longitude != undefined) {
          result += ',{"coverage":{"type":"point", "value": {"east": "' + datum.value.longitude + 
          '", "north": "' + datum.value.latitude + 
          '", "units": "Decimal Degrees", "name": "' + datum.value.name + '"}}}';
        }
      }
      else if (datum.name == "RainfallStation") {
        if(datum.value.latitude != undefined && datum.value.name != undefined) {
          result += ',{"coverage":{"type":"point", "value": {"east": "' + datum.value.longitude + 
          '", "north": "' + datum.value.latitude + 
          '", "units": "Decimal Degrees", "name": "' + datum.value.station_name + '"}}}';
        }
      }
    });
    return result;
  }


   /*
   * Returns something like: {"coverage":{"type":"period", "value":{"start":"01/01/2000", "end":"12/12/2010"}}}
   */
   $scope.getDates = function(dataDescriptor) {
      console.log("StagedDataDescriptorsController.getDates");
      var result = "";
      var spacer = ","
      var start = dataDescriptor.value.start_datetime;
      var end = dataDescriptor.value.end_datetime;

      // if both are not defined, we're done
      if (start == undefined && end == undefined) {
        return "";
      }
      // if one is not defined, set spacer to empty string as we don't want the comma anymore
      else if (!start || !end) {
        spacer = "";
      }
      // if not defined or not a value, set it to an empty string, else surround the value with needed text
      if (!start) {
        start = "";
      }
      else {
        start = `"start": "` + start + `"`;
      }
      // if not defined or not a value, set it to an empty string, else surround the value with needed text
      if (!end) {
        end = "";
      }
      else {
        end = `"end": "` + end + `"`;
      }
      if (start || end) {
        result = `,{"coverage":{"type":"period", "value":{` + start + spacer + end + '}}}';
      }
      //console.log("Date string: " + result);
      return result;
    }

    /*
      // should produce something like this, but all on one line
      "metadata": '[{
        "fundingagency":{"agency_name":"National Science Foundation","award_title":"‘Ike Wai: Securing Hawaii’s Water Future Award","award_number":"OIA-1557349","agency_url":"http://www.nsf.gov"}},
        {"contributor": {"name": "Diamond Tachera", "email": "diamondt@hawaii.edu","organization": "University of Hawaii"}},
        {"coverage":{"type":"box", "value":{"units": "Decimal degrees","east": "-76.30288","northlimit": "39.896164","eastlimit": "-76.291824","southlimit": "39.882217","westlimit": "-76.31393"}}},
        {"coverage":{"type":"period", "value":{"start":"01/01/2000", "end":"12/12/2010"}}},
        {"creator":{"name":"Jennifer Geis", "description":"/user/1501/","order":"2"}},
        {"creator":{"name":"Sean Cleveland", "description":"/user/1337/","order":"1"}
      }]',
    */
    $scope.getMetadata = function(dataDescriptor) {
      console.log("StagedDataDescriptorsController.getMetadata");
      var result = "";
      // funding agency will not change so can be hardcoded
      var d = 
        '{"fundingagency":{"agency_name":"National Science Foundation","award_title":"‘Ike Wai: Securing Hawaii’s Water Future Award","award_number":"OIA-1557349","agency_url":"http://www.nsf.gov"}}';
      d += $scope.getCreators(dataDescriptor);
      d += $scope.getContributors(dataDescriptor);
      d += $scope.getLocations(dataDescriptor);
      d += $scope.getDates(dataDescriptor);
      //console.log("metadata: " + d);
      if (d) {
        // strip off newlines as it makes Hydroshare choke.
        result = `,"metadata": '[${d.replace(/(\r\n|\n|\r)/gm, "")}]'`
      }
      //console.log("String: " + s);
      return result;
    }
    
    $scope.getAbstract = function(dataDescriptor) {
      //console.log("StagedDataDescriptorsController.getAbstract");
      var result = "";
      var d = dataDescriptor.value.description;
      //console.log("abstract: " + d);
      if (d) {
        // strip off newlines as it make Hydroshare choke.
        result = `,"abstract": "${d.replace(/(\r\n|\n|\r)/gm, "")}"`
      }
      //console.log("String: " + s);
      return result;
    }

    $scope.getKeywords = function(dataDescriptor) {
      /* format: "keywords": ["keyword1","keyword2"], */
      //console.log("StagedDataDescriptorsController.getKeywords");
      var result = "";
      var d = dataDescriptor.value.subjects;
      //console.log("subjects: " + JSON.stringify(d));
      if (d) {
        result = `,"keywords": ${JSON.stringify(d)}`
      }
      //console.log("String: " + s);
      return result;
    }

    // called when user goes to publish a DataDescriptor to Hydroshare
    // need to still get the location info for that DD
    $scope.publishStagedDDToHydroshare = function (dataDescriptor) {
      console.log("StagedDataDescriptorsController.publishStagedDDToHydroshare: " + dataDescriptor.uuid);
      console.log("dataDescriptor: " + JSON.stringify(dataDescriptor));
      
      //var deferred = $q.defer();
      //$scope.fetchMetadata("{'uuid':'" + dataDescriptor.uuid + "'}", 100).then(function (response){


      // I made a group 'ikewai': https://www.hydroshare.org/group/153

      // Send the data off to Hydroshare.
      //var userInfoURL = `https://www.hydroshare.org/hsapi/userInfo/?access_token=${$scope.accessToken}&format=json`;
      baseHSURL = "https://www.hydroshare.org";

      // g6QWYGsTM1RdNG3110oS8Li41gtXgW
      var hsURL = `${baseHSURL}/hsapi/resource/?access_token=n8y9G8YOoYx96TxvPnQZfBhAsW9Z7r`;
      //var hsURL = `${baseHSURL}/hsapi/resource/?access_token=g6QWYGsTM1RdNG3110oS8Li41gtXgW`;
      //var hsURL = `${baseHSURL}/hsapi/resource/?access_token=${$rootScope.hydroshareAccessToken}`;
      console.log("hsURL: " + hsURL);

      // "creator" in Hydroshare's API is called "owner" on their interface.  
      // This is the user against whose quota the resource is counted in managing storage,
      // so for us, creator is 'ikewai.'  Need to make a creator object there and store the
      // reference here.  While technically, there can be multiple owners, for our case, we
      // will be the only one.

      // Meanwhile, our backend "creators" field is the match for HS's "authors" API field.
      // we use the term 'authors' on our interface as well, just not in the JSON.

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

      

      // need to figure out how to get Hawaiian language stuff in there and variables and comments
      var hsData = `{
        "title": "${dataDescriptor.value.title}"
        ${$scope.getMetadata(dataDescriptor)}
        ${$scope.getAbstract(dataDescriptor)}
        ${$scope.getKeywords(dataDescriptor)}
        ,"availability":"public"
        ,"resource_type": "CompositeResource"
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
      
      // do the actual post to Hydroshare
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
          var resourceId = $scope.responseData.resource_id;
          //console.log("userInfo: " + $scope.userInfo);
          console.log("resource_id: " + resourceId);

          // put the hydroshare resourceId on the dataDescriptor
          dataDescriptor.value.hydroshareResourceId = resourceId;
          // userInfo format:  {"username":"jgeis@hawaii.edu","first_name":"Jennifer","last_name":"Geis","title":"Software Engineer","id":1501,"organization":"University of Hawaii","email":"jgeis@hawaii.edu"}
      }, function errorCallback(response) {
          alert("HydroshareOAuthController.submitToHydroshare Error. Try Again!");
      });
      */
      // temporarily commented out for testing
      /*
      //console.log("staged? " + dd.value.stagedToHydroshare);
      // mark the dd as being "pushedToHydroshare" and no longer staged.
      dataDescriptor.value.stagedToHydroshare = false;
      dataDescriptor.value.pushedToHydroshare = true;
      $scope.updateDataDescriptor(dataDescriptor);
      */ 

      //});
      //return deferred.promise;
    }

    $scope.updateDataDescriptor = function (dataDescriptor) {
      console.log("JEN StagedDescriptorController: updateDataDescriptor");
      $scope.requesting = true;

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
            //console.log("METADATA SCHEMA: "+ angular.toJson(response))
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
