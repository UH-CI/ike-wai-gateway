angular.module('AgaveToGo').controller("MetadataTimeseriesCreateController", 
function($scope, $state, $translate, $window, $uibModal, $rootScope, $timeout, 
     $filter, MetaController, MetadataService, ActionsService, MessageService) {


	$scope.schemaQuery ='';//"{'schema.title':'Timeseries_Template'}";
  $scope.column_vars = {};
    $scope.temp_var = {};
  $scope.timeseries_template = {};

	$scope.initialize = function() {
		$scope.refresh();
	}

	$scope.changeSchema = function(schemauuid) {
		selectedSchemaUuid = schemauuid;
		$scope.refresh();
	}

	$scope.fetchMetadataSchema = function() {
		$scope.requesting = true;

		MetaController.getMetadataSchema(selectedSchemaUuid)
			.then(
				function(response){
					$scope.selectedmetadataschema = response.result;//[0];
					var formschema = {};
					formschema["type"]="object";
					formschema["properties"] = $scope.selectedmetadataschema.schema.properties;
					
					formschema["required"] = $scope.selectedmetadataschema.schema.required;
					$scope.schema = formschema;
					$scope.form = [
						"*"
					];
					console.log(formschema)
					$scope.schema_selected = true;
					$scope.requesting = false;
				}
		);
	}
	$scope.selectVariable = function(variable){
        $("#selected_var").val(variable.value.variable_name)
        //alert("SELECT: "+ variable.value.id + "|" +variable.value.variable_name)
        $scope.temp_var= {'column_num': $('#column_num').val(),'variable':variable}
    }
    
    $scope.addColumnDef = function(){
        //check column num
        //check variable
        //add to column
        $scope.column_vars[$scope.temp_var['column_num']] = $scope.temp_var
        $scope.temp_var = {};
        $("#selected_var").val('');
        $("#column_num").val('')
    }

    $scope.removeColumn = function(column){
        delete $scope.column_vars[column.column_num]
    }
	$scope.refresh = function() {
		$scope.requesting = true;

		MetaController.listMetadataSchema(
			$scope.schemaQuery
		).then(function(response){
      $scope.metadataschema = 	response.result;
			$scope.requesting = false;
		})

	};


	$scope.onSubmit = function(form) {
		$scope.requesting = true;
		$scope.$broadcast('schemaFormValidate');
		// Then we check if the form is valid
    alert(angular.toJson($scope.timeseries_template))
    if($scope.timeseries_template != {} && $scope.column_vars != {}){
		//if (form.$valid) {
      MetaController.listMetadataSchema("{'schema.title':'Timeseries_Template'}"
      ).then(function(resp){
  			var body = {};
	  		body.name = "Timeseries";
        body.value = $scope.timeseries_template;
        body.value['columns'] = [];
        angular.forEach($scope.column_vars, function (value, key) {
          body.value['columns'].push({'column_number':value.column_num,'variable_id':value.variable.uuid});
        })
        body.value['columns']
        body.schemaId = resp.result[0].uuid;
        console.log(body)
        /*MetaController.addMetadata(body)
          .then(
            function(response){
              $scope.metadataUuid = response.result.uuid;
              //add the default permissions for the system in addition to the owners
              MetadataService.addDefaultPermissions($scope.metadataUuid);
              var metaName = response.result.name;
              App.alert({message: "Successfully Created Timeseries Template",closeInSeconds: 5  });
              $rootScope.$broadcast('metadataUpdated');
              $scope.requesting = false;
            },
            function(response){
              MessageService.handle(response, $translate.instant('error_metadata_add'));
              $scope.requesting = false;
            }
          );*/
        })
			}
			else{
				$scope.requesting = false;
			}

	};
  


    $scope.initialize();

    // opens modal variables
  $scope.open = function (size, types, title) {
    //Set the
    $scope.modalSchemas = types.slice(0);
    console.log("modalSchemas: " + $scope.modalSchemas);
    $scope.selectedSchema = types.slice(0);
    console.log("selectedSchema: " + $scope.selectedSchema);
    $scope.modalTitle = title;
    var modalInstance = $uibModal.open({
      animation: $scope.animationsEnabled,
      templateUrl: 'views/modals/ModalVariableSelect.html',
      controller: 'ModalVariableSelectCtrl',
      scope: $scope,
      size: size,
      resolve: {

      }
    });
    //$scope.fetchModalMetadata();
    $scope.searchAll();
  };

  $scope.searchField = {
    value: ''
  }

  $scope.searchAll = function () {
    $scope.requesting = true;
    var orquery = {}
    var andquery = {}
    var queryarray = []
    var andarray = []
    var innerquery = {}
    var typearray = []
    var typequery = {}
    console.log("$scope.metadataschema: "+$scope.metadataschema)
    angular.forEach($scope.metadataschema, function (value, key) {
      if ($scope.selectedSchema.indexOf(value.schema.title) > -1) {
        //set the schema name(s) to search across
        typearray.push(value.schema.title);
        //add schema properties to search across
        if ($scope.searchField.value != '') {
          angular.forEach(value.schema.properties, function (val, key) {
            var valquery = {}
            valquery['value.' + key] = {
              $regex: $scope.searchField.value,
              '$options': 'i'
            }
            queryarray.push(valquery)
          })
          orquery['$or'] = queryarray;
        }
      }
    })
    typequery['name'] = {
      '$in': typearray
    }
    andarray.push(typequery)
    andarray.push(orquery)
    andquery['$and'] = andarray;
    $scope.query = JSON.stringify(andquery);
    console.log("DataDescriptorController.searchAll QUERY: "+$scope.query)
    $scope.offset = 0;
    $scope.fetchModalMetadata();
  } 

  /*$scope.openEditMetadata = function (metadatumuuid, size) {
    $scope.metadataUuid = metadatumuuid.uuid;
    alert(metadatumuuid)
    var modalInstance = $uibModal.open({
      animation: $scope.animationsEnabled,
      templateUrl: 'views/modals/ModalEditMetadata.html',
      controller: 'ModalMetadataResourceEditController',
      scope: $scope,
      size: size,
      resolve: {

      }
    });
  };
*/
  $scope.openViewMetadata = function (metadatumuuid, size) {
    $scope.metadataUuid = metadatumuuid;
    var modalInstance = $uibModal.open({
      animation: $scope.animationsEnabled,
      templateUrl: 'views/modals/ModalViewMetadata.html',
      controller: 'ModalMetadataResourceDetailsController',
      scope: $scope,
      size: size,
      resolve: {

      }
    });
  };

  $scope.openCreateType = function (size, schemaType, isContrib = false) {
    $scope.requesting = true;
    // get the uuid for the schema
    var typeString = "{'schema.title':'" + schemaType + "'}";
    console.log("schemaType: " + schemaType);
    MetadataService.fetchSystemMetadataSchemaUuid(schemaType)
      .then(function (response) {
        var uuid = response;
        console.log("schema uuid: " + uuid);
        $scope.isContrib = isContrib;
        $scope.openCreate(uuid, size);
      });
    $scope.requesting = false;
  };
  

  $scope.openCreate = function (schemauuid, size) {
    //console.log("Jen DDC: openCreate");
    $scope.wizardSecondPage = false;
    $scope.fileMetadataObjects = $scope.fileMetadataObject;
    $scope.selectedSchemaUuid = schemauuid;
    var modalInstance = $uibModal.open({
      animation: $scope.animationsEnabled,
      templateUrl: 'views/modals/ModalCreateMetadata.html',
      controller: 'ModalMetadataResourceCreateController',
      scope: $scope,
      size: size,
      schemaUuid: schemauuid,
      fileMetadataObjects: $scope.fileMetadataObjects,
      resolve: {

      }
    })
  }
  $scope.fetchModalMetadata = function () {
    MetaController.listMetadata(
        $scope.query, $scope.limit, $scope.offset
      )
      .then(
        function (response) {
          $scope.metadata = response.result;
          $scope.requesting = false;
        },
        function (response) {
          MessageService.handle(response, $translate.instant('error_metadata_list'));
          $scope.requesting = false;
        }
      );

  }
}).controller('ModalVariableSelectCtrl', function ($scope, $modalInstance, MetaController) {
    $scope.cancel = function () {
      $modalInstance.close();
    };
  
    $scope.fetchModalMetadata = function () {
      MetaController.listMetadata(
          $scope.query, $scope.limit, $scope.offset
        )
        .then(
          function (response) {
            $scope.metadata = response.result;
            $scope.requesting = false;
          },
          function (response) {
            MessageService.handle(response, $translate.instant('error_metadata_list'));
            $scope.requesting = false;
          }
        );
  
    }
  });

