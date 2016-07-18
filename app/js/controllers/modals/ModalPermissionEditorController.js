angular.module('AgaveToGo').controller('ModalPermissionEditorController', function ($scope, $modalInstance, ApiPermissionListFunction, ApiPermissionUpdateFunction, resource)
{
    $scope.schema = {
        "type": "object",
        "properties": {
            "grants": {
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {
                        username: {
                            type: "string",
                            minLength: 2,
                            title: "Username",
                            //description: "Name of user to whom permissions will be granted"
                        },
                        //role: {
                        //    type: "string",
                        //    enum: [
                        //        "NONE",
                        //        "GUEST",
                        //        "USER",
                        //        "PUBLISHER",
                        //        "ADMIN",
                        //        "OWNER"
                        //    ]
                        //},
                        permission: {
                            type: "string",
                            enum: [
                                "NONE",
                                "READ",
                                "WRITE",
                                "EXECUTE",
                                "ALL",
                                "READ_WRITE",
                                "READ_EXECUTE",
                                "WRITE_EXECUTE"
                            ]
                        }
                    }
                }
            }
        }
    };

    $scope.form = [
        {
            type: "tabarray",
            "title": "{{value.username || ('Permission ' + ($index+1))}}",
            key: "grants",
            tabType: "top",
            remove: "Delete",
            style: {
                remove: "btn-danger"
            },
            startEmpty: false,
            "items": [
                {
                    key: "grants[].username",
                    placeholder: "Name of user to whom permissions will be granted",
                    type: "input",
                    onChange: function (value, form) {

                        //ApiPermissionUpdateFunction(resource.id, { username: model[arrayIndex].username, permission: value }).then(
                        //    function(response) {
                        //        console.log("Successfully updated permission for " + response.username + " to " + response.permission);
                        //    },
                        //    function(response) {
                        //        console.log("Successfully updated permission for " + response.username + " to " + response.permission);
                        //    });
                    }
                },
                {
                    key: "grants[].permission",
                    type: "select",
                    onChange: function (value, form) {

                        //ApiUpdateFunction(resource.id, { username: model[arrayIndex].username, permission: value }).then(
                        //    function(response) {
                        //        console.log("Successfully updated permission for " + response.username + " to " + response.permission);
                        //    },
                        //    function(response) {
                        //        console.log("Successfully updated permission for " + response.username + " to " + response.permission);
                        //    });
                    }
                }
            ]
        }
    ];

    $scope.model = {};

    var initPermissionModel = function() {
        App.blockUI({
            target: '#modal-permission-form',
            opacity: 1.0,
            overlayColor: '#FFF',
            animate: true
        });
        var that = resource;
        ApiPermissionListFunction(resource.id).then(
            function (response) {
                angular.forEach(response, function (grant, key) {
                    if (grant.permission.read) {
                        if (grant.permission.write) {
                            if (grant.permission.execute) {
                                response[key].permission = 'ALL';
                            } else {
                                response[key].permission = 'READ_WRITE';
                            }
                        } else {
                            if (grant.permission.execute) {
                                response[key].permission = 'READ_EXECUTE';
                            } else {
                                response[key].permission = 'READ';
                            }
                        }
                    } else if (grant.permission.write) {
                        if (grant.permission.execute) {
                            response[key].permission = 'WRITE_EXECUTE';
                        } else {
                            response[key].permission = 'WRITE';
                        }
                    } else if (grant.permission.execute) {
                        response[key].permission = 'EXECUTE';
                    } else {
                        response[key].permission = 'NONE';
                    }
                });
                $scope.model = {grants: response};
                App.unblockUI('#modal-permission-form');
            },
            function (response) {
                App.unblockUI('#modal-permission-form');
            });
    };

    initPermissionModel();

    $scope.ok = function()
    {
        $modalInstance.close($scope.model);
    };
    $scope.cancel = function()
    {
        $modalInstance.dismiss('cancel');
    };
});
