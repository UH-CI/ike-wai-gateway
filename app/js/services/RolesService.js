angular.module('AgaveToGo').service('RolesService',['$uibModal', '$rootScope', '$localStorage', '$location', '$state', '$timeout', '$q', '$translate', 'SystemsController', 'ProfilesController', 'MessageService', function($uibModal, $rootScope, $localStorage, $location, $state, $timeout, $q, $translate, SystemsController, ProfilesController, MessageService){
  this.editRoles = function(system){

    SystemsController.getSystemRole(system.id, $localStorage.activeProfile.username)
      .then(function(response){
        if (response.result.role === "ADMIN" || response.result.role === 'OWNER'){
          var modalInstance = $uibModal.open({
            templateUrl: 'tpl/modals/ModalRolesManager.html',
            scope: $rootScope,
            resolve:{
                system: function() {
                  return system;
                },
            },
            controller: ['$scope', '$modalInstance', 'system',
              function($scope, $modalInstance, system){
                $scope.system = system;

                $scope.refresh = function() {
                  $scope.requesting = true;
                  SystemsController.listSystemRoles(system.id, 99999, 0).then(
                    function(data) {
                      $scope.profiles = profiles;
                      $scope.model = {};
                      $scope.tempModel = {};

                      $scope.schema =
                      {
                        "type": "object",
                        "title": "Complex Key Support",
                        "properties": {
                          "name": {
                            "type": "string",
                            "title": "Name"
                          },
                          "roles": {
                            "title": "Roles by username",
                            "type": "array",
                            "items": {
                              "type": "object",
                              "properties": {
                                "username": {
                                  "title": " ",
                                  "type": "string"
                                },
                                "role": {
                                  "title": " ",
                                  "type": "string",
                                  "enum": [
                                    "NONE",
                                    "GUEST",
                                    "USER",
                                    "PUBLISHER",
                                    "ADMIN",
                                    "OWNER"
                                  ]
                                }
                              },
                            }
                          },
                        }
                      };

                      $scope.form = [
                        {
                          "key": "roles",
                          "items": [
                            {
                              "type": "fieldset",
                              "items": [
                                  {
                                    "type": "section",
                                    "htmlClass": "col-xs-6",
                                    "items": [
                                        {
                                          "key": "roles[].username"
                                        }
                                    ],

                                  },
                                  {
                                    "type": "section",
                                    "htmlClass": "col-xs-6",
                                    "items": ["roles[].role"]
                                  }
                              ]
                            }
                          ]
                        }
                      ];

                      $scope.tempModel.roles = [];

                      angular.forEach(data, function(role){
                        $scope.tempModel.roles.push({username: role.username, role: role.role });

                      });

                      $scope.model.roles = _.clone($scope.tempModel.roles);
                      $scope.requesting = false;

                  },
                  function(data) {
                      MessageService.handle(response, $translate.instant('error_systems_roles'));
                  });
                };

                $scope.clearRoles = function() {
                    $scope.model = {};
                    $scope.tempModel = {};
                };


                $scope.saveRoleChanges = function(){
                  var deletedRoles = _.difference($scope.model.roles, $scope.tempModel.roles);
                  $scope.requesting = true;
                  var promises = [];

                  // Take care of deleted roles first
                  angular.forEach(deletedRoles, function(role){
                    promises.push(
                      SystemsController.deleteSystemRole(system.id, role.username)
                    );
                  });

                  angular.forEach($scope.tempModel.roles, function(role){
                    promises.push(
                      SystemsController.updateSystemRole(role, system.id)
                    );
                  });
                  $q.all(promises).then(
                    function(result) {
                        App.alert({message: $translate.instant('success_systems_roles') + system.id});
                        $scope.requesting = false;
                        $modalInstance.close();
                    },
                    function(response) {
                        var message = '';
                        if (response.errorResponse){
                          if (response.errorResponse.message) {
                            message = 'Error: Could not update roles - ' + response.errorResponse.message
                          } else if (response.errorResponse.fault){
                            message = 'Error: Could not update roles - ' + response.errorResponse.fault;
                          }
                        } else {
                          message = 'Error: Could not update roles';
                        }
                        $scope.error = message;
                        $scope.requesting = false;
                    });
                };

                $scope.cancel = function()
                {
                    $modalInstance.dismiss('cancel');
                };

                $scope.refresh();
            }]

          });


        } else {
          App.alert({
              type: 'danger',
              message: $translate.instant('error_systems_edit_permission')
          });
        }
      })
      .catch(function(response){
          MessageService.handle(response, $translate.instant('error_systems_roles'));
      });


  };

  this.edit = function(resourceType, resource){
    switch(resourceType){
      case 'apps': $state.go('apps-edit', {'appId': resource.id });
        break;
      case 'systems': $state.go('systems-edit', {'systemId': resource.id });
        break;
    }
  }
}]);
