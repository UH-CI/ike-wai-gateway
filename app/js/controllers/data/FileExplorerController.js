angular.module('AgaveToGo').controller('FileExplorerController', function($rootScope, $scope, $http, $timeout, $filter, $localStorage, $location, $state, $stateParams, $uibModal, $translate, SystemsController, FilesController, MessageService) {
    $scope.system = undefined;
    $scope.systems = [];
    $scope.path = '';

    $scope.error = true;
    $scope.requesting = true;

    if ($stateParams.systemId) {
        SystemsController.getSystemDetails($stateParams.systemId)
          .then(function(response) {
                $scope.system = response.result;
                if (typeof $stateParams.path === 'undefined' || $stateParams.path === "" || $stateParams.path === "/") {
                    // check if username path is browsable
                    FilesController.listFileItems(response.result.id, $localStorage.activeProfile.username, 1, 0)
                      .then(
                        function(rootFiles){
                          $scope.path = $localStorage.activeProfile.username;
                          $stateParams.path = $scope.path;
                          if ($rootScope.locationChange){
                            $location.path("/data/explorer/" + $stateParams.systemId + "/" + $scope.path);
                          }
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
                                if ($rootScope.locationChange){
                                  $location.path("/data/explorer/" + $stateParams.systemId + "/");
                                }
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
                    if ($rootScope.locationChange){
                      $location.path("/data/explorer/" + $stateParams.systemId + "/" + $scope.path);
                    }
                    $scope.error = false;
                    $scope.requesting = false;
                }

            },
            function(response) {
                $scope.path = $stateParams.path ? $stateParams.path : '';
                $scope.system = '';
                $scope.requesting = false;
                MessageService.handle(response, $translate.instant('error_systems_list'));
                App.unblockUI('#agave-filemanager');
            }
          );

    } else {
        SystemsController.listSystems(99999, 0, true)
          .then(function (response) {
              if (response.result && response.result.length > 0) {
                  $scope.system = response.result[0];
                  // check if username path is browsable
                  FilesController.listFileItems(response.result[0].id, $localStorage.activeProfile.username, 1, 0)
                    .then(
                      function(usernameFiles){
                        $scope.path = $localStorage.activeProfile.username;
                        $stateParams.path = $scope.path;
                        $stateParams.systemId = response.result[0].id;
                        if ($rootScope.locationChange){
                          $location.path("/data/explorer/" + $stateParams.systemId + "/" + $scope.path);
                        }
                        $scope.error = false;
                        $scope.requesting = false;
                      },
                      function(usernameFiles){
                        // check if / is browsable
                        FilesController.listFileItems(response.result[0].id, '/', 1, 0)
                          .then(
                            function(rootFiles){
                              $scope.path = '/';
                              $stateParams.path = $scope.path;
                              $stateParams.systemId = response.result[0].id;
                              if ($rootScope.locationChange){
                                $location.path("/data/explorer/" + $stateParams.systemId + "/");
                              }
                              $scope.error = false;
                              $scope.requesting = false;
                            },
                            function(response){
                              $scope.requesting = false;
                              MessageService.handle(response, $translate.instant('error_files_list'));
                            }
                          );
                      }
                    );
              } else {
                  $uibModal.open({
                      templateUrl: "views/data/system-selector.html",
                      scope: $scope,
                      size: 'lg',
                      controller: ['$scope', '$modalInstance', function($scope, $modalInstance ) {
                          $scope.getSystems = function(){
                              SystemsController.listSystems(99999, 0, 'STORAGE')
                                  .then(function(response){
                                      if (response.result && response.result.length){
                                        $scope.systems = response.result;
                                      } else {
                                        MessageService.handle(response, $translate.instant('error_systems_default'));
                                        $scope.close();
                                        $('.modal-backdrop').remove();
                                      }
                                  })
                                  .catch(function(response){
                                      $scope.requesting = false;
                                      MessageService.handle(response, $translate.instant('error_systems_default'));
                                      $scope.close();
                                  });
                          };

                          $scope.makeDefault = function(systemId){
                            var body = {'action': 'setDefault'};

                            SystemsController.updateInvokeSystemAction(body, systemId)
                              .then(function(response){
                                if ($rootScope.locationChange){
                                  $location.path("/data/explorer/" + systemId + "/" + $localStorage.activeProfile.username);
                                }
                                $scope.close();
                              })
                              .catch(function(response){
                                $scope.requesting = false;
                                MessageService.handle(response, $translate.instant('error_systems_default'));
                                $scope.close();

                              });
                          };

                          $scope.close = function(){
                              $modalInstance.close();
                          }

                          $scope.cancel = function()
                          {
                              $modalInstance.dismiss('cancel');
                          };
                      }]
                  });
              }
          },
          function (response) {
              $scope.path = $stateParams.path ? $stateParams.path : '';
              $scope.system = '';
              $scope.requesting = false;
              MessageService.handle(response, $translate.instant('error_systems_list'));
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

});
