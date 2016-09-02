angular.module('AgaveToGo').controller('FileExplorerController', function($rootScope, $scope, $http, $timeout, $filter, $localStorage, $location, $state, $stateParams, $uibModal, SystemsController, FilesController) {
    $scope.system = undefined;
    $scope.systems = [];
    $scope.path = '';

    $scope.error = true;
    $scope.requesting = true;

    if ($stateParams.systemId) {
        SystemsController.getSystemDetails($stateParams.systemId)
          .then(function(system) {
                $scope.system = system;
                if (typeof $stateParams.path === 'undefined' || $stateParams.path === "" || $stateParams.path === "/") {
                    // check if username path is browsable
                    FilesController.listFileItems(system.id, $localStorage.activeProfile.username, 1, 0)
                      .then(function(rootFiles){
                        $scope.path = $localStorage.activeProfile.username;
                        $stateParams.path = $scope.path;
                        $location.path("/data/explorer/" + $stateParams.systemId + "/" + $scope.path);
                        App.unblockUI('#agave-filemanager');
                        $scope.error = false;
                        $scope.requesting = false;
                      })
                      .catch(function(rootFiles){
                        // check if / is browsable
                        FilesController.listFileItems(system.id, '/', 1, 0)
                            .then(function(usernameFiles){
                              $scope.path = '/';
                              $stateParams.path = $scope.path;
                              $location.path("/data/explorer/" + $stateParams.systemId + "/");
                              App.unblockUI('#agave-filemanager');
                              $scope.error = false;
                              $scope.requesting = false;
                            })
                            .catch(function(rootFiles){
                              App.alert({type: 'danger', message: "There was an error listing files on the system. Could not find a path to browse"});
                              $scope.requesting = false;
                            });
                      });
                } else {
                    $scope.path = $stateParams.path;
                    $location.path("/data/explorer/" + $stateParams.systemId + "/" + $scope.path);
                    App.unblockUI('#agave-filemanager');
                    $scope.error = false;
                    $scope.requesting = false;
                }

            })
          .catch(function(response) {
              $scope.path = $stateParams.path ? $stateParams.path : '';
              $scope.system = '';
              $scope.requesting = false;
              var message = '';
              if (typeof response.errorResponse !== 'undefined') {
                if (typeof response.errorResponse.message !== 'undefined'){
                  message = 'Error: Could not retrieve system - ' + response.errorResponse.message;
                } else if (typeof response.errorResponse.fault !== 'undefined') {
                  message = 'Error: Could not retrieve system - ' + response.errorResponse.fault.message;
                } else {
                  message = 'Error: Could not retrieve system';
                }
              } else {
                message = 'Error: Could not retrieve system';
              }
              App.alert(
                {
                  type: 'danger',
                  message: message
                }
              );
              App.unblockUI('#agave-filemanager');
          });
    }
    else {

        SystemsController.listSystems(99999, 0, true, false, 'STORAGE')
          .then(function (response) {
              if (response && response.length) {
                  $scope.system = response[0];
                  // check if username path is browsable
                  FilesController.listFileItems(response[0].id, $localStorage.activeProfile.username, 1, 0)
                    .then(function(rootFiles){
                      $scope.path = $localStorage.activeProfile.username;
                      $stateParams.path = $scope.path;
                      $stateParams.systemId = response[0].id;
                      $location.path("/data/explorer/" + $stateParams.systemId + "/" + $scope.path);
                      App.unblockUI('#agave-filemanager');
                      $scope.error = false;
                      $scope.requesting = false;
                    })
                    .catch(function(rootFiles){
                      // check if / is browsable
                      FilesController.listFileItems(response[0].id, '/', 1, 0)
                          .then(function(usernameFiles){
                            $scope.path = '/';
                            $stateParams.path = $scope.path;
                            $stateParams.systemId = response[0].id;
                            $location.path("/data/explorer/" + $stateParams.systemId + "/");
                            App.unblockUI('#agave-filemanager');
                            $scope.error = false;
                            $scope.requesting = false;
                          })
                          .catch(function(rootFiles){
                            $scope.requesting = false;
                            App.alert({type: 'danger', message: "There was an error listing files on the system. Could not find a path to browse"});
                          });
                    });
              } else {
                  $uibModal.open({
                      templateUrl: "views/data/system-selector.html",
                      scope: $scope,
                      size: 'lg',
                      controller: ['$scope', '$modalInstance', function($scope, $modalInstance ) {
                          $scope.getSystems = function(){
                              SystemsController.listSystems(99999, 0, 'STORAGE')
                                  .then(function(response){
                                      if (response && response.length){
                                        $scope.systems = response;
                                      } else {
                                        App.alert({type: 'danger', message: "There was an error setting your default system"});
                                        $scope.close();
                                        $('.modal-backdrop').remove();
                                      }
                                  })
                                  .catch(function(response){
                                      $scope.requesting = false;
                                      App.alert({type: 'danger', message: "There was an error setting your default system"});
                                      $scope.close();
                                  });
                          };

                          $scope.makeDefault = function(systemId){
                            var body = {'action': 'setDefault'};

                            SystemsController.updateInvokeSystemAction(body, systemId)
                              .then(function(response){
                                $location.path("/data/explorer/" + systemId + "/" + $localStorage.activeProfile.username);
                                $scope.close();
                                App.unblockUI('#agave-filemanager');
                              })
                              .catch(function(response){
                                $scope.requesting = false;
                                App.alert({type: 'danger', message: "There was an error setting your default system"});
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
          })
          .catch(function (data) {
              $scope.path = $stateParams.path ? $stateParams.path : '';
              $scope.system = '';
              $scope.requesting = false;
              App.alert({type: 'danger', message: "There was an error fetching your list of available systems"});
              App.unblockUI('#agave-filemanager');
          });

        // SystemsController.listSystems(99999, 0, false, false, 'STORAGE')
        //   .then(function (response) {
        //         if (response && response.length) {
        //             $scope.system = response[0];
        //             // check if username path is browsable
        //             FilesController.listFileItems(response[0].id, $localStorage.activeProfile.username, 1, 0)
        //               .then(function(rootFiles){
        //                 $scope.path = $localStorage.activeProfile.username;
        //                 $stateParams.path = $scope.path;
        //                 $stateParams.systemId = response[0].id;
        //                 $location.path("/data/explorer/" + $stateParams.systemId + "/" + $scope.path);
        //                 App.unblockUI('#agave-filemanager');
        //                 $scope.error = false;
        //                 $scope.requesting = false;
        //               })
        //               .catch(function(rootFiles){
        //                 // check if / is browsable
        //                 FilesController.listFileItems(response[0].id, '/', 1, 0)
        //                     .then(function(usernameFiles){
        //                       $scope.path = '/';
        //                       $stateParams.path = $scope.path;
        //                       $stateParams.systemId = response[0].id;
        //                       $location.path("/data/explorer/" + $stateParams.systemId + "/");
        //                       App.unblockUI('#agave-filemanager');
        //                       $scope.error = false;
        //                       $scope.requesting = false;
        //                     })
        //                     .catch(function(rootFiles){
        //                       $scope.requesting = false;
        //                       App.alert({type: 'danger', message: "There was an error listing files on the system. Could not find a path to browse"});
        //                     });
        //               });
        //         } else {
        //             $uibModal.open({
        //                 templateUrl: "views/data/system-selector.html",
        //                 scope: $scope,
        //                 size: 'lg',
        //                 controller: ['$scope', '$modalInstance', function($scope, $modalInstance ) {
        //                     $scope.getSystems = function(){
        //                         SystemsController.listSystems(99999, 0, 'STORAGE')
        //                             .then(function(response){
        //                                 if (response && response.length){
        //                                   $scope.systems = response;
        //                                 } else {
        //                                   App.alert({type: 'danger', message: "There was an error setting your default system"});
        //                                   $scope.close();
        //                                   $('.modal-backdrop').remove();
        //                                 }
        //                             })
        //                             .catch(function(response){
        //                                 $scope.requesting = false;
        //                                 App.alert({type: 'danger', message: "There was an error setting your default system"});
        //                                 $scope.close();
        //                             });
        //                     };
        //
        //                     $scope.makeDefault = function(systemId){
        //                       var body = {'action': 'setDefault'};
        //
        //                       SystemsController.updateInvokeSystemAction(body, systemId)
        //                         .then(function(response){
        //                           $location.path("/data/explorer/" + systemId + "/" + $localStorage.activeProfile.username);
        //                           $scope.close();
        //                           App.unblockUI('#agave-filemanager');
        //                         })
        //                         .catch(function(response){
        //                           $scope.requesting = false;
        //                           App.alert({type: 'danger', message: "There was an error setting your default system"});
        //                           $scope.close();
        //
        //                         });
        //                     };
        //
        //                     $scope.close = function(){
        //                         $modalInstance.close();
        //                     }
        //
        //                     $scope.cancel = function()
        //                     {
        //                         $modalInstance.dismiss('cancel');
        //                     };
        //                 }]
        //             });
        //         }
        //     })
        //     .catch(function (data) {
        //         $scope.path = $stateParams.path ? $stateParams.path : '';
        //         $scope.system = '';
        //         $scope.requesting = false;
        //         App.alert({type: 'danger', message: "There was an error fetching your list of available systems"});
        //         App.unblockUI('#agave-filemanager');
        //     });
        //

    }
});
