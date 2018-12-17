angular.module('AgaveToGo').controller('BasicSearchController', function ($scope, $state, $q, $translate, $uibModal, $rootScope, $localStorage, MetaController, FilesController, ActionsService, MessageService, MetadataService, FilesMetadataService) {
    $scope._COLLECTION_NAME = 'metadata';
    $scope._RESOURCE_NAME = 'metadatum';

    $scope.profile = $localStorage.activeProfile;
    $scope.get_editors = function(){
      $scope.editors = MetadataService.getAdmins();
      $scope.edit_perm = $scope.editors.indexOf($scope.profile.username) > -1;
    }
    $scope.get_editors();

    //Don't display metadata of these types
    $scope.ignoreMetadataType = ['published','stagged','PublishedFile','rejected'];
    //Don't display metadata schema types as options
    $scope.ignoreSchemaType = ['PublishedFile'];
    $scope.approvedSchema = ['Well','Site','Water_Quality_Site','Variable','DataDescriptor']
    $scope.queryLimit = 99999;

    $scope.offset = 0;
    $scope.limit = 10;

    $scope.sortType = 'name';
    $scope.sortReverse  = true;
    $scope.status = 'active';
    $scope.available = true;
    $scope.query = "{'name':{'$in': ['" + $scope.approvedSchema.join("','") +"'] }},{'_links.associationIds':1,'value.name':1,'name':1,'value.well_name':1,'value.wid':1}";
    $scope.filequery="{$or:[{'value.published':'True'},{'name':'PublishedFile'}]}";
    //$scope.schemaQuery = "{'schema.title':{'$in': ['" + $scope.approvedSchema.join("','") +"'] }}"

    $scope.schemaBox = {val1:true,val2:true,val5:true};
    $scope.wellbox = true;
    $scope.searchField = {value:''}
    $scope.wqs_id = MetadataService.fetchSystemMetadataUuid('Water_Quality_Site')

  $scope.parseFiles = function(){
      //fetch related file metadata objects
      $scope.files = []
      $scope.files_hrefs =[]
      $scope.wqsites = []
      angular.forEach($scope.filemetadata, function(val, key){
        if (val._links.associationIds.length > 0){
          angular.forEach(val._links.associationIds, function(value, key){
            if(value.href != null){
              if(value.title == "file" && value.href.includes('ikewai-annotated-data')){
                if( $scope.files_hrefs.indexOf(value.href) < 0){
                  $scope.files_hrefs.push(value.href)
                  $scope.files.push(value)
                }
              }
            }
          })
        }
        else if(val.name == "Water_Quality_Site" ){
          $scope.wqsites.push(val)
        }
      })
      $scope.requesting=false;
    }

     $scope.doSearch = function(){
       $scope.requesting=true;
       MetaController.listMetadata($scope.filequery,limit=10000,offset=0).then(
           function (response) {
             $scope.filemetadata= response.result;
             //angular.extend($scope.filemetadata, $scope.metadata);
             $scope.parseFiles();
          },
          function(response){
            MessageService.handle(response, $translate.instant('error_metadata_list'));
            $scope.requesting = false;
          }
       );
     }

    $scope.textSearch = function(){
      if ($scope.searchField.value != ''){
        $scope.filequery = "{$text:{$search:'"+$scope.searchField.value+"'}}";
      }
      else{
        $scope.filequery="{'name':'PublishedFile'}";
      }
      $scope.doSearch();
    }

    $scope.searchAll = function(){
      //alert($scope.filter)
      $scope.requesting = true;
        var orquery = {}
        var andquery = {}
        var fileandquery = {}
        var queryarray = []
        var andarray = []
        var fileandarray = []
        var innerquery = {}
        var typearray = []
        if ($scope.searchField.value != ''){
          angular.forEach($scope.metadataschema, function(value, key){
            //alert(angular.toJson(value))
            if($scope.approvedSchema.indexOf(value.schema.title) > -1){
              angular.forEach(value.schema.properties, function(val, key){
                var valquery = {}
                valquery['value.'+key] = {$regex: $scope.searchField.value, '$options':'i'}
                queryarray.push(valquery)
              })
            }
          })
          queryarray.push({'value.filename':{$regex: $scope.searchField.value, '$options':'i'}})
          orquery['$or'] = queryarray;
       }
        var typequery = {}

        if ($scope.schemaBox.val1){
          typearray.push('Site')
        }
        if ($scope.schemaBox.val2){
          typearray.push('Well')
        }
        if ($scope.schemaBox.val5){
          typearray.push('Water_Quality_Site')
        }
        typequery['name'] = {'$in': typearray}
        andarray.push(typequery)
        andarray.push(orquery)
        andquery['$and'] = andarray;
        $scope.query = JSON.stringify(andquery).replace(/"/g, "'");
        fileandarray.push({'name':'PublishedFile'})
        fileandarray.push(orquery)
        fileandquery['$and'] = fileandarray;
        $scope.filequery = JSON.stringify(fileandquery).replace(/"/g, "'");
        $scope.doSearch();
    }

    $scope.refresh = function() {
     // $scope.requesting = true;
      MetaController.listMetadataSchema(
				$scope.schemaQuery
			).then(function(response){
				$scope.metadataschema = response.result;
			})
      //$scope.doSearch();
    };

    $scope.searchTools = function(query){
      $scope.requesting = true;
      if (query !=''){
        $scope.query = query;
        jsonquery = angular.fromJson(query.replace(/'/g, '"'))
        jsonquery['$and'][0]['name']['$in']=['PublishedFile'];
        $scope.filequery = JSON.stringify(jsonquery);
      }
      else{
        $scope.query = "{'name':{'$in': ['" + $scope.approvedSchema.join("','") +"'] }},{'_links.associationIds':1,'value.name':1,'name':1,'value.well_name':1,'value.wid':1}";
        $scope.filequery ="{'name':'PublishedFile'}"
      }
      $scope.doSearch();
    };


    $scope.refresh();

    $rootScope.$on("metadataUpdated", function(){
      $scope.refresh();
    });

    $scope.confirmAction = function(resourceType, resource, resourceAction, resourceList, resourceIndex){
      ActionsService.confirmAction(resourceType, resource, resourceAction, resourceList, resourceIndex);
    };

    $scope.download = function(file_url){
      $scope.requesting = true;
      FilesMetadataService.downloadSelected(file_url).then(function(result){
        $scope.requesting = false;
      });
    }

    $scope.viewFileAnnotations = function(fileUuid,filePath){
        $state.go("filemetadata-multipleadd",{'fileUuids': fileUuid,'filePaths':filePath});
    }
/////////Modal Stuff/////////////////////

    $scope.openView = function (metadatumuuid, size) {
    	$scope.metadataUuid = metadatumuuid;
        var modalInstance = $uibModal.open({
          animation: $scope.animationsEnabled,
          templateUrl: 'views/modals/ModalViewMetadata.html',
          controller: 'ModalMetadataResourceDetailsController',
          scope: $scope,
          size: size,
          resolve: {

          }
        }
      );
    };

    $scope.openAnnotation = function (fileuuid, filepath) {
      $scope.fileuuid = fileuuid;
      $scope.filepath = filepath;//.split('ikewai-annotated-data/')[1].join('');
        var modalInstance = $uibModal.open({
          animation: $scope.animationsEnabled,
          templateUrl: 'views/filemetadata/resource/resource.html',
          controller: 'ModalFilemetadataResourceDetailsController',
          scope: $scope,
          size: 'lg',
          resolve: {

          }
        }
      );
    };
});
