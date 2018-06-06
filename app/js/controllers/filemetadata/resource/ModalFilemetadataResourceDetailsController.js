angular.module('AgaveToGo').controller('ModalFilemetadataResourceDetailsController', function($scope, $uibModal, $modalInstance, $state, $translate, $timeout, $window, $rootScope, $localStorage, MetaController, PostitsController, FilesMetadataService, ActionsService, MessageService, MetadataService) {


  $scope.loadFilemetadata = function(){
    if (this.$parent.fileuuid !== undefined && this.$parent.fileuuid !== '' && this.$parent.filepath !== undefined && this.$parent.filepath !== '') {
      $scope.fileUuids = this.$parent.fileuuid;
      $scope.filePaths = this.$parent.filepath;
    }
  }
  $scope.loadFilemetadata()

  $scope.profile = $localStorage.activeProfile;

  $scope.query = "{'name':'DataDescriptor'}"
  $scope.schemaQuery ="{'schema.title':'DataDescriptor'}";
  $scope.approvedSchema = ['DataDescriptor'];
  $scope.selectedSchema = ['DataDescriptor'];

  $scope.fetchMetadataSchema = function(schemauuid) {
    $scope.requesting = true;
    if (schemauuid) {
    MetaController.getMetadataSchema(schemauuid)
      .then(
        function(response){
          $scope.selectedmetadataschema = response.result;
          var formschema = {};
          formschema["type"]="object";
          formschema["properties"] = $scope.selectedmetadataschema.schema.properties;
          $scope.schema = formschema;
          $scope.form = [
            "*",
            {
              type: "submit",
              title: "Save"
            }
          ];
          $scope.schema_selected = true;
          $scope.requesting = false;
        }
    );
    }
    else{
      $scope.requesting = false;
    }
  }

  $scope.populateAssociatedMetadata = function(){
    $scope.allAssociationIds = []
    angular.forEach($scope.fileMetadataObjects, function(value, key) {
      $scope.allAssociationIds.push(value.associationIds)
    })
    if ($scope.allAssociationIds.length > 0){
      $scope.matchingAssociationIds = $scope.allAssociationIds.shift().filter(function(v) {
        return $scope.allAssociationIds.every(function(a) {
            return a.indexOf(v) !== -1;
        });
      });
    }
    //alert(angular.toJson($scope.matchingAssociationIds))
    $scope.matchingMetadata =[];
    if ($scope.matchingAssociationIds){
      MetaController.listMetadata("{'uuid':{$in :['"+$scope.matchingAssociationIds.join("','")+"']}}").then(function(response){
        $scope.matchingMetadata = response.result;
      })
    }
  }

  $scope.fetchDataDescriptors = function(){
    $scope.requesting = true;
    //find DataDescriptors that are associated with all fileUuids
    $scope.DataDescriptorIds=[];
    MetaController.listMetadata("{'name':'DataDescriptor','associationIds':{$all :['"+$scope.fileUuids+"']}}").then(
      function (response) {
        $scope.matchingDataDescriptors = response.result;
        angular.forEach($scope.matchingDataDescriptors, function(value, key) {
            $scope.DataDescriptorIds.push(value.uuid)
        })
        $scope.requesting = false;
      }
    )
  }

  $scope.fetchDataDescriptors();

  $scope.fetchFileMetadataObjects = function(){
    $scope.requesting = true;
    MetaController.listMetadata("{$and:[{'name':'File'},{'associationIds':{$in :['"+$scope.fileUuids+"']}}]}").then(

      function (response) {
        $scope.fileMetadataObjects = response.result;
        //alert($scope.fileMetadataObjects.length +" : "+$scope.fileUuids+" : " + $scope.fileUuids.length)
        if ($scope.fileMetadataObjects.length < $scope.fileUuids.length){
          //we have object mistmatch so figure our which are missing
           FilesMetadataService.createFileMetadataObjects($scope.fileUuids).then(
            MetaController.listMetadata("{$and:[{'name':'File'},{'associationIds':{$in :['"+$scope.fileUuids+"']}}]}").then(
              function(resp){
                $scope.fileMetadataObjects = resp.result;
                $scope.populateAssociatedMetadata();
                $scope.requesting = false;
              }
            )
          )
        }
        else{
          //do nothing
          $scope.populateAssociatedMetadata();
          $scope.requesting = false;
        }
      }
    )
  }

  $scope.fetchFileObjects = function(){
    //fetch File metadata objects
    if ($scope.loadedOnce == false){
      $scope.loadedOnce == true;
      $scope.fetchFileMetadataObjects();
    }
  }

  $scope.fetchFileObjects();

  /////////Modal Stuff/////////////////////
  			$scope.fetchModalMetadata = function(){
  				MetaController.listMetadata(
  					$scope.query, $scope.limit
  				)
  					.then(
  						function (response) {
  							if (response.result.length == $scope.limit) {
  				              $scope.can_fetch_more = true;
  				            } else {
  				              $scope.can_fetch_more = false;
  				            }
  							$scope.metadata= response.result;
  							$scope.requesting = false;
  						},
  						function(response){
  							MessageService.handle(response, $translate.instant('error_metadata_list'));
  							$scope.requesting = false;
  						}
  				);
  			}
  			//$scope.fetchModalMetadata();

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


        $scope.openViewMetadata = function (metadatumuuid, size) {
    			$scope.metadataUuid = metadatumuuid;
    				var modalInstance = $uibModal.open({
    					animation: $scope.animationsEnabled,
    					templateUrl: 'views/modals/ModalViewMetadata.html',
    					controller: 'ModalMetadataResourceDetailsController',
    					scope: $scope,
    					size: size,
    					backdrop: 'static',
          				keyboard : false,
    					metadataUuid: metadatumuuid,
    					profile: $scope.profile,
    					resolve: {

    					}
    				}
    			);
    		};

    		$scope.openViewDataDescriptor = function (dataDescriptorUuid, size) {
    			$scope.uuid = dataDescriptorUuid;
    			$scope.action = "view";
    			var modalInstance = $uibModal.open({
    				animation: $scope.animationsEnabled,
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
    		};
    $scope.close = function () {
      $modalInstance.close($scope.model);
    };
});
