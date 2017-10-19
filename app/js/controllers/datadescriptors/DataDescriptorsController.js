angular.module('AgaveToGo').controller('DataDescriptorsController', function ($scope, $state, $translate, $uibModal, $rootScope, $localStorage, MetaController, FilesController, ActionsService, MessageService, MetadataService) {
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
    $scope.ignoreMetadataType = ['published','stagged','PublishedFile','rejected'];
    //Don't display metadata schema types as options
    $scope.ignoreSchemaType = ['PublishedFile'];
    $scope.approvedSchema = ['DataDescriptor']
    $scope.queryLimit = 99999;

    $scope.offset = 0;
    $scope.limit = 10;
    $scope.hasFiles = false;

    $scope.sortType = 'name';
    $scope.sortReverse  = true;
    $scope.status = 'active';
    $scope.available = true;
    $scope.query = "{'name':{'$in': ['" + $scope.approvedSchema.join("','") +"'] }}";
    //$scope.schemaQuery = "{'schema.title':{'$in': ['" + $scope.approvedSchema.join("','") +"'] }}"
    $scope.schemaQuery = "{'schema.title':'DataDescriptor' }}"

    $scope.schemaBox = {val1:true,val2:true};
    $scope.wellbox = true;
    $scope.searchField = {value:''}

    $scope.searchAll = function(){
      //alert($scope.filter)
      $scope.requesting = true;
        var orquery = {}
        var andquery = {}
        var queryarray = []
        var andarray = []
        var innerquery = {}
        var typearray = []
        if ($scope.searchField.value != ''){
          angular.forEach($scope.metadataschema, function(value, key){
            //alert(angular.toJson(value))
            if($scope.approvedSchema.indexOf(value.schema.title) > -1){
              angular.forEach(value.schema.properties, function(val, key){
                var valquery = {}
                valquery['value.'+key] = {$regex: $scope.searchField.value}
                queryarray.push(valquery)
              })
            }
          })
          orquery['$or'] = queryarray;
       }
        var typequery = {}

        if ($scope.schemaBox.val1){
          typearray.push('DataDescriptor')
        }
        typequery['name'] = {'$in': typearray}
        andarray.push(typequery)
        andarray.push(orquery)
        andquery['$and'] = andarray;
        $scope.query = JSON.stringify(andquery);

        MetaController.listMetadata($scope.query,limit=100,offset=0).then(
          function (response) {
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

    $scope.refresh = function() {
      $scope.requesting = true;
      MetaController.listMetadataSchema(
				$scope.schemaQuery
			).then(function(response){
				$scope.metadataschema = response.result;
				$scope.requesting = false;
			})
      MetaController.listMetadata(
        $scope.query,limit=100,offset=0
      )
        .then(
          function (response) {
            $scope.totalItems = response.result.length;        
            //angular.forEach(response.result, function(val, key){
            //    console.log("values: " + $scope.profile.username + ", " + val.owner);
            //    var r = $scope.profile.username == val.owner;
            //    console.log("result: " + r);
            //});
            $scope.pagesTotal = Math.ceil(response.result.length / $scope.limit);
            $scope[$scope._COLLECTION_NAME] = response.result;
            $scope.requesting = false;
          },
          function(response){
            MessageService.handle(response, $translate.instant('error_metadata_list'));
            $scope.requesting = false;
          }
      );

    };

    $scope.searchTools = function(query){
      $scope.query = query;
      $scope.refresh();
    };


    $scope.refresh();

    $rootScope.$on("metadataUpdated", function(){
      $scope.refresh();
    });
    
    $scope.confirmDelete = function(metadatum){
         MetaController.deleteMetadata(metadatum.uuid)
           .then(
               function(response){
                 $scope.metadata.splice($scope.metadata.indexOf(metadatum),1)
                 App.alert({message: 'Data Descriptor Successfully Deleted.',closeInSeconds: 5  });
               },
               function(response){
                 App.alert({type: 'danger',message: 'Error Deleting Data Descriptor!',closeInSeconds: 5  });
               }
           )
    }


/////////Modal Stuff/////////////////////


    $scope.openCreate = function (schemauuid, size) {
      $scope.selectedSchemaUuid = schemauuid;
      $state.go("datadescriptor",{'uuid': schemauuid, 'action': 'create'}); 
      /*
        var modalInstance = $uibModal.open({
          animation: $scope.animationsEnabled,
          templateUrl: 'views/modals/ModalCreateMetadata.html',
          controller: 'ModalMetadataResourceCreateController',
          scope: $scope,
          size: size,
          schemaUuid: schemauuid,
          resolve: {

          }
        }
      );
      */
    };

    $scope.openClone = function (dataDescriptorUuid, size) {
      $scope.selectedSchemaUuid = dataDescriptorUuid;
      $state.go("datadescriptor",{'uuid': dataDescriptorUuid, 'action': 'clone'}); 
      /*
        var modalInstance = $uibModal.open({
          animation: $scope.animationsEnabled,
          templateUrl: 'views/modals/ModalCreateMetadata.html',
          controller: 'ModalMetadataResourceCreateController',
          scope: $scope,
          size: size,
          schemaUuid: schemauuid,
          resolve: {

          }
        }
      );
      */
    };

    /*
    $scope.openEdit = function (metadatumuuid, size) {
      $scope.metadataUuid = metadatumuuid;
        var modalInstance = $uibModal.open({
          animation: $scope.animationsEnabled,
          templateUrl: 'views/modals/ModalEditMetadata.html',
          controller: 'ModalMetadataResourceEditController',
          scope: $scope,
          size: size,
          resolve: {

          }
        }
      );
    };
    */

    
    $scope.openEdit = function (metadatumuuid, size) {
      $scope.metadataUuid = metadatumuuid;
      $state.go("datadescriptor",{'uuid': metadatumuuid, 'action': 'edit'}); 
/*
        var modalInstance = $uibModal.open({
          animation: $scope.animationsEnabled,
          templateUrl: 'views/filemetadata/manager.html',
          controller: 'FileMetadataController',
          scope: $scope,
          size: size,
          resolve: {

          }
        }
      );
*/
    };
    

    $scope.openView = function (metadatumuuid, size) {
      $scope.metadataUuid = metadatumuuid;
      $state.go("datadescriptor",{'uuid': metadatumuuid, 'action': 'view'}); 
      /*
        var modalInstance = $uibModal.open({
          animation: $scope.animationsEnabled,
          templateUrl: 'views/modals/ModalViewMetadata.html',
          controller: 'FileMetadataController',
          scope: $scope,
          size: size,
          resolve: {

          }
        }
      );
      */
    };
});
