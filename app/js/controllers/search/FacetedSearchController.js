angular.module('AgaveToGo').controller('FacetedSearchController', function ($scope, $state, $translate, $uibModal, $rootScope, $localStorage, MetaController, FilesController, ActionsService, MessageService, MetadataService, FilesMetadataService) {
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
    $scope.approvedSchema = ['Well','Site','Variable','DataDescriptor']
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

    $scope.schemaBox = {val1:true,val2:true};
    $scope.wellbox = true;
    $scope.searchField = {value:''}
    $scope.files_hrefs=[]
    $scope.file_uuids =[]

    $scope.sortType= 'href';
    $scope.sortReverse = false;

    $scope.wellSortType ='value.well_name'
    $scope.siteSortType ='value.name'
    $scope.varSortType ='value.variable_name'
    $scope.wellSortReverse = true;
    $scope.siteSortReverse = true;
    $scope.varSortReverse = false;
    
    $scope.parseFiles = function(){
      //fetch related file metadata objects
      $scope.files = []
      $scope.files_hrefs =[]
      $scope.file_uuids =[]
      angular.forEach($scope.filemetadata, function(val, key){
        if (val._links.associationIds.length > 0){
          angular.forEach(val._links.associationIds, function(value, key){
            if(value.href != null){
              if(value.title == "file" && value.href.includes('ikewai-annotated-data')){
                if( $scope.files_hrefs.indexOf(value.href) < 0){
                  $scope.files_hrefs.push(value.href)
                  $scope.files.push(value)
                  $scope.file_uuids.push(value.rel)
                }
              }
            }
          })
        }
      })
      $scope.fetchFacetMetadata();
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
      if ($scope.selectedMetadata != null){
        $scope.filequery = "{$and:[{$text:{$search:'"+$scope.searchField.value+"'},{'value.published':'True'}]}";
      }
      else{
        $scope.filequery="{$or:[{'value.published':'True'},{'name':'PublishedFile'}]}";
      }
      $scope.doSearch();
    }

    $scope.facetSearch = function(){
      if ($scope.selectedMetadata != ''){
        $scope.filequery = "{'uuid':{$in:['"+$scope.selectedMetadata.join('\',\'')+"']}}";
      }
      else{
        $scope.filequery = "{$or:[{'value.published':'True'},{'name':'PublishedFile'}]}";
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
      $scope.requesting = true;
      MetaController.listMetadataSchema($scope.schemaQuery)
      .then(function(response){
				$scope.metadataschema = response.result;
      })
      $scope.fetchFacetMetadata();
      $scope.doSearch();
    };
    
    $scope.fetchFacetMetadata = function(){
      MetaController.listMetadata("{'name':'Well','value.published':'True','associationIds':{$in:['"+$scope.file_uuids.join('\',\'')+"']}}",limit=1000,offset=0)
        .then(function(response){
            $scope.facet_wells = response.result;
           // alert(angular.toJson($scope.facet_wells))
        })
      MetaController.listMetadata("{'name':'Site','value.published':'True','associationIds':{$in:['"+ $scope.file_uuids.join('\',\'')+"']}}",limit=1000,offset=0)
        .then(function(response){
            $scope.facet_sites = response.result;
        })
    MetaController.listMetadata("{'name':'Variable','value.published':'True','associationIds':{$in:['"+ $scope.file_uuids.join('\',\'')+"']}}",limit=1000,offset=0)
        .then(function(response){
            $scope.facet_variables = response.result;
        })
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


    $scope.selectedMetadata=[]
    // Toggle selection for a given fruit by name
     $scope.toggleSelectedMetadata = function(uuid) {
    var idx = $scope.selectedMetadata.indexOf(uuid);

    // Is currently selected
    if (idx > -1) {

        $scope.selectedMetadata.splice(idx, 1);

    }

    // Is newly selected
    else {
      $scope.selectedMetadata.push(uuid);
    }
  };
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
});
