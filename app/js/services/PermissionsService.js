angular.module('AgaveToGo').service('PermissionsService',['$uibModal', '$rootScope', '$location', '$state', '$timeout', '$q', 'AppsController', 'ProfilesController', function($uibModal, $rootScope, $location, $state, $timeout, $q, AppsController, ProfilesController){
  this.editPermissions = function(resource){
      var modalInstance = $uibModal.open({
        templateUrl: 'tpl/modals/ModalPermissionManager.html',
        scope: $rootScope,
        resolve:{
            resource: function() {
              return resource;
            },
        },
        controller: ['$scope', '$modalInstance', 'resource',
          function($scope, $modalInstance, resource){
            $scope.resource = resource;

            $scope.getRwxObj = function() {
                return {
                      read: false,
                      write: false,
                      execute: false
                };
            };

            $scope.transformRwxToAgave = function(rwxObj) {
              var result = '';
              if (rwxObj.read === true && rwxObj.write === true && rwxObj.execute === true){
                result = 'ALL';
              }
              else if (rwxObj.read === true && rwxObj.write === false && rwxObj.execute === false){
                result = 'READ';
              }
              else if (rwxObj.read === false && rwxObj.write === true && rwxObj.execute === false) {
                result = 'WRITE';
              }
              else if (rwxObj.read === false && rwxObj.write === false && rwxObj.execute === true) {
                result = 'EXECUTE';
              }
              else if (rwxObj.read === true && rwxObj.write === true && rwxObj.execute === false) {
                result = 'READ_WRITE';
              }
              else if (rwxObj.read === true && rwxObj.write === false && rwxObj.execute === true) {
                result = 'READ_EXECUTE';
              }
              else if (rwxObj.read === false && rwxObj.write === true && rwxObj.execute === true) {
                result = 'WRITE_EXECUTE';
              }
              else {
                result = 'NONE';
              }
              return result;
            };

            $scope.transformAgaveToRwx = function(agavePermission) {
              var rwxObj = $scope.getRwxObj();

              switch(agavePermission){
                  case "ALL":
                      rwxObj.read = true;
                      rwxObj.write = true;
                      rwxObj.execute = true;
                    break;
                  case "READ":
                      rwxObj.read = true;
                    break;
                  case "WRITE":
                      rwxObj.write = true;
                    break;
                  case "EXECUTE":
                      rwxObj.execute = true;
                    break;
                  case "READ_WRITE":
                      rwxObj.read = true;
                      rwxObj.write = true;
                    break;
                  case "READ_EXECUTE":
                      rwxObj.read = true;
                      rwxObj.execute = true;
                    break;
                  case "WRITE_EXECUTE":
                      rwxObj.write = true;
                      rwxObj.execute = true;
                    break;
                  case "EXECUTE":
                      rwxObj.execute = true;
                    break;
              }

              return rwxObj;
            };

            $scope.refresh = function() {
              $scope.requesting = true;

              AppsController.listAppPermissions($scope.resource.id, 99999, 0).then(
                function(response) {
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
                          "permissions": {
                            "title": "permissions by username",
                            "type": "array",
                            "items": {
                              "type": "object",
                              "properties": {
                                "username": {
                                  "title": " ",
                                  "type": "string"
                                },
                                "permission": {
                                  "title": " ",
                                  "type": "string",
                                  "enum": [
                                    "ALL",
                                    "READ",
                                    "WRITE",
                                    "EXECUTE",
                                    "READ_WRITE",
                                    "READ_EXECUTE",
                                    "WRITE_EXECUTE",
                                    "NONE"
                                  ]
                                }
                              },
                            }
                          },
                        }
                      };

                      $scope.form = [
                        {
                          "key": "permissions",
                          "items": [
                            {
                              "type": "fieldset",
                              "items": [
                                  {
                                    "type": "section",
                                    "htmlClass": "col-xs-6",
                                    "items": [
                                        {
                                          "key": "permissions[].username",
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
                                    "items": ["permissions[].permission"]
                                  }
                              ]
                            }
                          ]
                        }
                      ];

                      $scope.tempModel.permissions = [];

                      angular.forEach(response.result, function(permission){
                        $scope.tempModel.permissions.push({username: permission.username, permission:  $scope.transformRwxToAgave(permission.permission)});
                      });

                      $scope.model.permissions = _.clone($scope.tempModel.permissions);
                      $scope.requesting = false;
                    })
                    .catch(function(profiles){
                      var message = response.errorMessage ?  "Error: " + response.errorMessage : "Error contacting the service"
                      App.alert({
                          type: 'danger',
                          message: message
                      });
                    })
                  },
                  function(response) {
                      var message = response.errorMessage ?  "Error: " + response.errorMessage : "Error contacting the service"
                      App.alert({
                          type: 'danger',
                          message: message
                      });
                  });
            };

            $scope.clearpermissions = function() {
                $scope.model = {};
                $scope.tempModel = {};
            };


            $scope.savePermissionChanges = function(){
              var deletedpermissions = _.difference($scope.model.permissions, $scope.tempModel.permissions);
              $scope.requesting = true;
              var promises = [];

              // Take care of deleted permissions first
              angular.forEach(deletedpermissions, function(permission){
                promises.push(
                  AppsController.deleteAppPermission(resource.id, permission.username)
                );
              });

              angular.forEach($scope.tempModel.permissions, function(permission){
                promises.push(
                  AppsController.updateAppPermission(resource.id, permission , permission.username)
                );
              });

              $q.all(promises).then(
                function(response) {
                    App.alert({message: "Successfully updated user permissions for " + resource.id});
                    $scope.requesting = false;
                    $modalInstance.close();
                },
                function(response) {
                    var message = 'Error: Could not update permissions'
                    App.alert({
                        type: 'danger',
                        message: message
                    });
                    $scope.requesting = false;
                    $modalInstance.close();
                });
            };

            $scope.cancel = function()
            {
                $modalInstance.dismiss('cancel');
            };

            $scope.refresh();
        }]

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
