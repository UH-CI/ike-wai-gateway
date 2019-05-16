angular.module('AgaveToGo').controller('ParseTimeseriesController', function($scope, $state, $stateParams, $uibModal, $modalStack, $localStorage, $rootScope, $translate, AppsController, SystemsController, JobsController, NotificationsController, FilesController,MetaController, MessageService) {

    $scope.parse_form={};
    $scope.schemaQuery =''; 
    $scope.parse_form = {'uuid':'','input':''}
    $scope.searchField = {
        value: ''
      }
    $scope.onCancel = function() {
      
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
    
    $scope.refresh();

    $scope.selectTimeseriesTemplate = function(metadatum){
        $scope.parse_form.uuid = metadatum.uuid;
        $scope.openInstance.close();

    }

    $scope.onSubmit = function(form) {
      
      $scope.$broadcast('schemaFormValidate');

      if (form.$valid) {
        var jobData = {
            appId: $scope.app.id,
            archive: true,
            inputs: {},
            parameters: {}
        };

        /* copy form model to disconnect from $scope */
        _.extend(jobData, angular.copy($scope.form.model));

        /* remove falsy input/parameter */
        _.each(jobData.inputs, function(v,k) {
          if (_.isArray(v)) {
            v = _.compact(v);
            if (v.length === 0) {
              delete jobData.inputs[k];
            }
          }
        });
        _.each(jobData.parameters, function(v,k) {
          if (_.isArray(v)) {
            v = _.compact(v);
            if (v.length === 0) {
              delete jobData.parameters[k];
            }
          }
        });

        $scope.requesting = true;
        
        JobsController.createSubmitJob(jobData)
          .then(
            function(response) {
              // hard-wired for now
              var notification = {};
              notification.associatedUuid = response.result.id;
              notification.event = '*';
              notification.persistent = true;
              notification.url = $localStorage.activeProfile.email;

              NotificationsController.addNotification(notification)
                .then(
                  function(response){
                  },
                  function(response){
                    MessageService.handle(response, $translate.instant('error_notifications_add'));
                  }
                );
              $scope.job = response.result;

              $uibModal.open({
                templateUrl: "views/apps/resource/job-success.html",
                scope: $scope,
                size: 'lg',
                controller: ['$scope', '$modalInstance', function($scope, $modalInstance ) {
                  $scope.cancel = function()
                  {
                      $modalInstance.dismiss('cancel');
                      $state.go('jobs-manage');
                  };

                  $scope.close = function(){
                      $modalInstance.close();
                      $state.go('jobs-manage');
                  }
                }]
              });
              //$scope.resetForm(true);
              $scope.requesting = false;
            },
            function(response) {
              $scope.requesting = false;
              //$scope.resetForm(false);
              MessageService.handle(response, $translate.instant('error_jobs_create'));
          });
      }

    };

    $scope.selectFile = function(key){
        $scope.requesting = true;
        // SystemsController.getSystemDetails($scope.app.deploymentSystem).then(
        SystemsController.listSystems(99999, 0, true, false, 'STORAGE')
          .then(
            function(response) {
              if (response.result > 0){
                // check if modal already opened
                if (!$modalStack.getTop()){
                  $stateParams.path = $scope.path;

                  $scope.system = response.result[0];
                  $rootScope.uploadFileContent = '';

                  if (typeof $stateParams.path === 'undefined' || $stateParams.path === "" || $stateParams.path === "/") {
                      // check if username path is browsable
                      FilesController.listFileItems(response.result[0].id, $localStorage.activeProfile.username, 1, 0)
                        .then(
                          function(rootFiles){
                            $scope.path = $localStorage.activeProfile.username;
                            $stateParams.path = $scope.path;
                            $uibModal.open({
                              templateUrl: "views/apps/filemanager.html",
                              scope: $scope,
                              size: 'lg',
                              controller: ['$scope', '$modalInstance', function($scope, $modalInstance ) {
                                $scope.cancel = function()
                                {
                                    $modalInstance.dismiss('cancel');
                                };

                                $scope.close = function(){
                                    $modalInstance.close();
                                }

                                $scope.$watch('uploadFileContent', function(uploadFileContent){
                                    if (typeof uploadFileContent !== 'undefined' && uploadFileContent !== ''){
                                      if (typeof $scope.parse_form.input === 'undefined'){
                                        $scope.parse_form.input = {};
                                      }
                                      $scope.parse_form.input = uploadFileContent;
                                      $scope.close();
                                    }
                                });
                              }]
                            });
                            $scope.error = false;
                            $scope.requesting = false;
                          },
                          function(rootFiles){
                            // check if / is browsable
                            FilesController.listFileItems(response.result.id, '/', 1, 0)
                              .then(
                                function(usernameFiles){
                                  $scope.path = '/';
                                  $stateParams.path = $scope.path;
                                  $uibModal.open({
                                    templateUrl: "views/apps/filemanager.html",
                                    scope: $scope,
                                    size: 'lg',
                                    controller: ['$scope', '$modalInstance', function($scope, $modalInstance ) {
                                      $scope.cancel = function()
                                      {
                                          $modalInstance.dismiss('cancel');
                                      };

                                      $scope.close = function(){
                                          $modalInstance.close();
                                      }

                                      $scope.$watch('uploadFileContent', function(uploadFileContent){
                                          if (typeof uploadFileContent !== 'undefined' && uploadFileContent !== ''){
                                            if (typeof $scope.parse_form.inputs === 'undefined'){
                                              $scope.parse_form.inputs = {};
                                            }
                                            $scope.parse_form.inputs[key] = uploadFileContent;
                                            $scope.close();
                                          }
                                      });
                                    }]
                                  });
                                  $scope.error = false;
                                  $scope.requesting = false;
                                },
                                function(response){
                                  MessageService.handle(response, $translate.instant('error_files_list'));
                                  $scope.requesting = false;
                                }
                              )
                        }
                      );
                  } else {
                      $scope.path = $stateParams.path;
                      $uibModal.open({
                        templateUrl: "views/apps/filemanager.html",
                        scope: $scope,
                        size: 'lg',
                        controller: ['$scope', '$modalInstance', function($scope, $modalInstance ) {
                          $scope.cancel = function()
                          {
                              $modalInstance.dismiss('cancel');
                          };

                          $scope.close = function(){
                              $modalInstance.close();
                          }

                          $scope.$watch('uploadFileContent', function(uploadFileContent){
                              if (typeof uploadFileContent !== 'undefined' && uploadFileContent !== ''){
                                if (typeof $scope.parse_form.input === 'undefined'){
                                  $scope.form.model.inputs = {};
                                }
                                $scope.form.model.inputs[key] = uploadFileContent;
                                $scope.close();
                              }
                          });
                        }]
                      });
                      $scope.error = false;
                      $scope.requesting = false;
                  }
                }
              }

              // check if modal already opened
              if (!$modalStack.getTop()){
                $stateParams.path = $scope.path;

                $scope.system = response.result[0];
                $rootScope.uploadFileContent = '';

                if (typeof $stateParams.path === 'undefined' || $stateParams.path === "" || $stateParams.path === "/") {
                    // check if username path is browsable
                    FilesController.listFileItems(response.result[0].id, $localStorage.activeProfile.username, 1, 0)
                      .then(
                        function(rootFiles){
                          $scope.path = $localStorage.activeProfile.username;
                          $stateParams.path = $scope.path;
                          $uibModal.open({
                            templateUrl: "views/apps/filemanager.html",
                            scope: $scope,
                            size: 'lg',
                            controller: ['$scope', '$modalInstance', function($scope, $modalInstance ) {
                              $scope.cancel = function()
                              {
                                  $modalInstance.dismiss('cancel');
                              };

                              $scope.close = function(){
                                  $modalInstance.close();
                              }

                              $scope.$watch('uploadFileContent', function(uploadFileContent){
                                  if (typeof uploadFileContent !== 'undefined' && uploadFileContent !== ''){
                                    if (typeof $scope.parse_form.inputs === 'undefined'){
                                      $scope.form.model.input = {};
                                    }
                                    $scope.form.model.input = uploadFileContent;
                                    $scope.close();
                                  }
                              });
                            }]
                          });
                          $scope.error = false;
                          $scope.requesting = false;
                        },
                        function(rootFiles){
                          // check if / is browsable
                          FilesController.listFileItems(response.result[0].id, '/', 1, 0)
                            .then(
                              function(usernameFiles){
                                $scope.path = '/';
                                $stateParams.path = $scope.path;
                                $uibModal.open({
                                  templateUrl: "views/apps/filemanager.html",
                                  scope: $scope,
                                  size: 'lg',
                                  controller: ['$scope', '$modalInstance', function($scope, $modalInstance ) {
                                    $scope.cancel = function()
                                    {
                                        $modalInstance.dismiss('cancel');
                                    };

                                    $scope.close = function(){
                                        $modalInstance.close();
                                    }

                                    $scope.$watch('uploadFileContent', function(uploadFileContent){
                                        if (typeof uploadFileContent !== 'undefined' && uploadFileContent !== ''){
                                          if (typeof $scope.parse_form.input === 'undefined'){
                                            $scope.parse_form.input = {};
                                          }
                                          $scope.parse_form.input = uploadFileContent;
                                          $scope.close();
                                        }
                                    });
                                  }]
                                });
                                $scope.error = false;
                                $scope.requesting = false;
                              },
                              function(response){
                                MessageService.handle(response, $translate.instant('error_files_list'));
                                $scope.requesting = false;
                              }
                            )
                      }
                    );
                } else {
                    $scope.path = $stateParams.path;
                    $uibModal.open({
                      templateUrl: "views/apps/filemanager.html",
                      scope: $scope,
                      size: 'lg',
                      controller: ['$scope', '$modalInstance', function($scope, $modalInstance ) {
                        $scope.cancel = function()
                        {
                            $modalInstance.dismiss('cancel');
                        };

                        $scope.close = function(){
                            $modalInstance.close();
                        }

                        $scope.$watch('uploadFileContent', function(uploadFileContent){
                            if (typeof uploadFileContent !== 'undefined' && uploadFileContent !== ''){
                              if (typeof $scope.form.model.inputs === 'undefined'){
                                $scope.form.model.inputs = {};
                              }
                              $scope.form.model.inputs[key] = uploadFileContent;
                              $scope.close();
                            }
                        });
                      }]
                    });
                    $scope.error = false;
                    $scope.requesting = false;
                }
              }
            },
            function(response) {
              MessageService.handle(response, $translate.instant('error_apps_details'));
            }
        );
    }

    $scope.lazyLoadFileManagerParams = [
      '../bower_components/angular-filebrowser/src/js/app.js',
      '../bower_components/angular-cookies/angular-cookies.min.js',
      '../bower_components/angular-filebrowser/src/js/providers/config.js',
      '../bower_components/angular-filebrowser/src/js/directives/directives.js',
      '../bower_components/angular-filebrowser/src/js/filters/filters.js',
      '../bower_components/angular-filebrowser/src/js/entities/acl.js',
      '../bower_components/angular-filebrowser/src/js/entities/chmod.js',
      '../bower_components/angular-filebrowser/src/js/entities/fileitem.js',
      '../bower_components/angular-filebrowser/src/js/entities/item.js',
      '../bower_components/angular-filebrowser/src/js/services/filenavigator.js',
      '../bower_components/angular-filebrowser/src/js/services/fileuploader.js',
      '../bower_components/angular-filebrowser/src/js/providers/translations.js',
      '../bower_components/angular-filebrowser/src/js/controllers/main.js',
      '../bower_components/angular-filebrowser/src/js/controllers/selector-controller.js',
      '../bower_components/angular-filebrowser/src/css/angular-filemanager.css',
      '../bower_components/codemirror/lib/codemirror.css',
      '../bower_components/codemirror/theme/neo.css',
      '../bower_components/codemirror/theme/solarized.css',
      '../bower_components/codemirror/mode/javascript/javascript.js',
      '../bower_components/codemirror/mode/markdown/markdown.js',
      '../bower_components/codemirror/mode/clike/clike.js',
      '../bower_components/codemirror/mode/shell/shell.js',
      '../bower_components/codemirror/mode/python/python.js',
      '../bower_components/angular-ui-codemirror/ui-codemirror.min.js',
    ];
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
    //  $scope.resetForm(false);
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
      templateUrl: 'views/modals/ModalTimeseriesTemplateSelect.html',
      controller: 'ModalTimeseriesTemplateSelectCtrl',
      scope: $scope,
      size: size,
      resolve: {

      }
    });
    $scope.openInstance = modalInstance;
    //$scope.fetchModalMetadata();
    $scope.searchAll();
  };

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

}).controller('ModalTimeseriesTemplateSelectCtrl', function ($scope, $modalInstance, MetaController) {
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
