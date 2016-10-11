angular.module('AgaveToGo').controller('AppsResourceRunController', function($scope, $stateParams, $uibModal, $modalStack, $localStorage, $rootScope, $translate, AppsController, SystemsController, JobsController, NotificationsController, FilesController, MessageService) {

    $scope.formSchema = function(app) {
      var schema = {
        type: 'object',
        properties: {}
      };

      var params = app.parameters || [];
      var inputs = app.inputs || [];

      if (params.length > 0) {
        schema.properties.parameters = {
          type: 'object',
          properties: {}
        };
        _.each(params, function(param) {
          if (! param.value.visible) {
            return;
          }
          if (param.id.startsWith('_')) {
            return;
          }
          var field = {
            title: param.details.label,
            description: param.details.description,
            required: param.value.required
          };
          switch (param.value.type) {
            case 'bool':
            case 'flag':
              field.type = 'boolean';
              break;

            case 'enumeration':
              field.type = 'string';
              field.enum = _.map(param.value.enum_values, function(enum_val) {
                return Object.keys(enum_val)[0];
              });
              field['x-schema-form'] = {
                'titleMap': _.map(param.value.enum_values, function(enum_val) {
                  var key = Object.keys(enum_val)[0];
                  return {
                    'value': key,
                    'name': enum_val[key]
                  };
                })
              };
              break;

            case 'number':
              field.type = 'number';
              break;

            case 'string':
            default:
              field.type = 'string';
          }
          schema.properties.parameters.properties[param.id] = field;
        });
      }


      if (inputs.length > 0) {
        schema.properties.inputs = {
          type: 'object',
          properties: {}
        };
        _.each(inputs, function(input) {
          if (! input.value.visible) {
            return;
          }
          if (input.id.startsWith('_')) {
            return;
          }
          var field = {
            title: input.details.label,
            description: input.details.description,
          };
          if (input.semantics.maxCardinality === 1) {
            field.type = 'string';
            field.required = input.value.required;
          } else {
            field.type = 'array';
            field.items = {
              type: 'string',
              'x-schema-form': {
                notitle: true
              },
            }
            if (input.semantics.maxCardinality > 1) {
              field.maxItems = input.semantics.maxCardinality;
            }
          }
          schema.properties.inputs.properties[input.id] = field;
        });
      }

      schema.properties.requestedTime = {
        title: 'Maximum job runtime',
        description: 'In HH:MM:SS format. The maximum time you expect this job to run for. After this amount of time your job will be killed by the job scheduler. Shorter run times result in shorter queue wait times. Maximum possible time is 48:00:00 (48 hours).',
        type: 'string',
        "pattern":"^(48:00:00)|([0-4][0-7]:[0-5][0-9]:[0-5][0-9])$",
        "validationMessage":"Must be in format HH:MM:SS and be less than 48 hours (48:00:00)",
        required: true,
        'x-schema-form': {placeholder: app.defaultMaxRunTime}
      };

      schema.properties.name = {
        title: 'Job name',
        description: 'A recognizable name for this job',
        type: 'string',
        required: true
      };
      schema.properties.archivePath = {
        title: 'Job output archive location (optional)',
        description: 'Specify a location where the job output should be archived. By default, job output will be archived at: <code>&lt;username&gt;/archive/jobs/${YYYY-MM-DD}/${JOB_NAME}-${JOB_ID}</code>.',
        type: 'string',
        format: 'agaveFile',
        'x-schema-form': {placeholder: '<username>/archive/jobs/${YYYY-MM-DD}/${JOB_NAME}-${JOB_ID}'}
      };

      return schema;
    };

    $scope.resetForm = function(){
      if ($stateParams.appId !== ''){
        AppsController.getAppDetails($stateParams.appId)
          .then(
            function(response){
              $scope.app = response.result;
              $scope.form = {model: {}};
              $scope.form.schema = $scope.formSchema($scope.app);
              $scope.form.form = [];

              /* inputs */
              var inputs = [];
              var parameters = [];

              if ($scope.form.schema.properties.inputs && Object.keys($scope.form.schema.properties.inputs.properties).length > 0) {

                inputs.push({
                  'key':'inputs',
                  'items': []
                });
                angular.forEach($scope.form.schema.properties.inputs.properties, function(input, key){
                  inputs[0].items.push(
                    {
                      "input": key,
                      "type": "template",
                      "template": '<div class="form-group has-success has-feedback"> <label for="input">{{form.title}}</label> <div class="input-group"> <a class="input-group-addon" ng-click="form.selectFile(form.input)">Select</a> <input type="text" class="form-control" id="input" ng-model="form.model.inputs[form.input]"></div> <span class="help-block">{{form.description}}</span> </div>',
                      "title": input.title,
                      "description": input.description,
                      "model": $scope.form.model,
                      selectFile: function(key){
                        $scope.requesting = true;
                        SystemsController.getSystemDetails($scope.app.deploymentSystem).then(
                            function(response) {
                                // check if modal already opened
                                if (!$modalStack.getTop()){
                                  $stateParams.path = $scope.path;

                                  $scope.system = response.result;
                                  $rootScope.uploadFileContent = '';

                                  if (typeof $stateParams.path === 'undefined' || $stateParams.path === "" || $stateParams.path === "/") {
                                      // check if username path is browsable
                                      FilesController.listFileItems(response.result.id, $localStorage.activeProfile.username, 1, 0)
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
                    }
                  );
                });
              }

              if ($scope.form.schema.properties.parameters && Object.keys($scope.form.schema.properties.parameters.properties).length > 0) {
                parameters.push({
                  'key': 'parameters',
                  'items': []
                });
                angular.forEach($scope.form.schema.properties.parameters.properties, function(input, key){
                  parameters[0].items.push(
                    {
                      "input": key,
                      "type": "template",
                      "template": '<div class="form-group has-success has-feedback"> <label for="input">{{form.title}}</label> <input type="text" class="form-control" id="input" ng-model="form.model.parameters[form.input]"> <span class="help-block">{{form.description}}</span> </div>',
                      "title": input.title,
                      "description": input.description,
                      "model": $scope.form.model,
                      selectFile: function(key){
                        SystemsController.getSystemDetails($scope.app.deploymentSystem)
                          .then(
                            function(response) {
                                if (!$modalStack.getTop()){
                                  // $scope.path = $localStorage.activeProfile.username;
                                  $stateParams.path = $scope.path;

                                  $scope.system = response.result;
                                  $rootScope.uploadFileContent = '';
                                  $uibModal.open({
                                    templateUrl: "views/apps/filemanager.html",
                                    // resolve: {
                                    // },
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
                                            if (typeof $scope.form.model.parameters === 'undefined'){
                                              $scope.form.model.parameters = {};
                                            }
                                            $scope.form.model.parameters[key] = uploadFileContent;
                                            $scope.close();
                                          }
                                      });
                                    }]
                                  });
                                }
                            },
                            function(response) {
                              MessageService.handle(response, $translate.instant('error_apps_details'));
                            }
                        );
                      }
                    }
                  );
                });
              }

              if (inputs.length > 0){
                $scope.form.form.push({
                  type: 'fieldset',
                  title: 'Inputs',
                  items: inputs,
                });
              }

              if (parameters.length > 0){
                $scope.form.form.push({
                  type: 'fieldset',
                  title: 'Parameters',
                  items: parameters,

                });
              }

              /* job details */
              $scope.form.form.push({
                type: 'fieldset',
                title: 'Job details',
                items: ['requestedTime','name', 'archivePath']
              });

              /* buttons */
              items = [];

              items.push({type: 'submit', title: 'Run', style: 'btn-primary'});
              $scope.form.form.push({
                type: 'actions',
                items: items
              });
            }
          )
          .catch(
            function(response){
              MessageService.handle(response, $translate.instant('error_apps_details'));
            }
          );
      } else {
        MessageService.handle(response, $translate.instant('error_apps_details'));
      }
    };

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
              notification.url = 'https://9d1e23fc.fanoutcdn.com/fpp';

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
                  };

                  $scope.close = function(){
                      $modalInstance.close();
                  }
                }]
              });
              $scope.resetForm();
              $scope.requesting = false;
            },
            function(response) {
              MessageService.handle(response, $translate.instant('error_jobs_create'));
          });
      }

    };

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

    $scope.resetForm();

});
