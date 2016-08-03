angular.module('AgaveToGo').service('RolesService',['$uibModal', '$rootScope', '$localStorage', '$location', '$state', '$timeout', '$q', 'SystemsController', 'ProfilesController', function($uibModal, $rootScope, $localStorage, $location, $state, $timeout, $q, SystemsController, ProfilesController){
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
                      ProfilesController.listProfiles()
                        .then(function(profiles){
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
                                              "key": "roles[].username",
                                              onChange: function(value, tempModel){
                                                if ($scope.profiles.length > 0) {
                                                  tempModel.description = '<span class="text-success">'+ value + ' is a tenant user</span>';
                                                }
                                              },
                                              validationMessage: {
                                                'notavailable': '{{viewValue}} is not a tenant user'
                                              },
                                              $validators: {
                                                notavailable: function(value){
                                                  var username =_.find($scope.profiles, function(profile){
                                                    if (profile.username === value){
                                                      return true;
                                                    }
                                                  });
                                                  return username ? true : false;
                                                }
                                              }
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
                        })
                        .catch(function(profiles){
                          App.alert({
                              type: 'danger',
                              message: "There was an error contacting the systems service. if this " +
                              "persists, please contact your system administrator.",
                          });
                        })
                      },
                      function(data) {
                          App.alert({
                              type: 'danger',
                              message: "There was an error contacting the systems service. if this " +
                              "persists, please contact your system administrator.",
                          });
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
                        App.alert({message: "Successfully updated user roles on system " + system.id});
                        $scope.requesting = false;
                        $modalInstance.close();
                    },
                    function(response) {
                        var message = '';
                        if (response.errorResponse){
                          if (response.errorResponse.message) {
                            message = 'Error updating roles - ' + response.errorResponse.message
                          } else if (response.errorResponse.fault){
                            message = 'Error updating roles - ' + response.errorResponse.fault;
                          }
                        } else {
                          message = 'Error updating roles';
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
              message: "Error - User does not have the necessary role to view other user roles on this system"
          });
        }
      })
      .catch(function(response){
        var message = '';
        if (response.errorResponse){
          if (response.errorResponse.message) {
            message = 'Error - ' + response.errorResponse.message
          } else if (response.errorResponse.fault){
            message = 'Error - ' + response.errorResponse.fault;
          }
        } else {
          message = 'Error getting roles';
        }
        App.alert({
            type: 'danger',
            message: message
        });
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
