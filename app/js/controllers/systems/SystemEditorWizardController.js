angular.module('AgaveToGo').controller('SystemEditorWizardController', function($injector, $timeout, $rootScope, $scope, $state, $stateParams, $q, $filter, $uibModal, $localStorage, $location, Commons, WizardHandler, SystemsController, SystemTypeEnum, Tags, FilesController) {

      $scope.getSystemsTitleMap = function(){
        $scope.systemsTitleMap = [];

        $scope.systemsTitleMap.push({"value": "Local Disk", "name": "Local Disk"});

        SystemsController.listSystems(1, 0, true, null, "STORAGE")
          .then(function(response){
            _.each(response, function(system){
              $scope.systemsTitleMap.push({"value": system.id, "name": system.id});
            });
            return $scope.systemsTitleMap;
          })
          .catch(function(response){
            // log error
          });

        return $scope.systemsTitleMap;
    };

    $scope.systemsTitleMap = $scope.getSystemsTitleMap();

    $scope.schema = {
        "type": "object",
        "title": "Interactive app registration form for the Agave platform.",
        "properties": {
            "id": {
                "type": "string",
                "title": "ID",
            },
            "name": {
                "type": "string",
                "title": "Name",
            },
            "status": {
              "type": "string",
              "enum": [
                  "UP", "DOWN", "MAINTENANCE", "UNKNOWN"
              ],
              "title": "Status"
            },
            "site": {
                "type": "string",
                "format": "url",
                "title": "Site",
            },
            "description": {
                "type": "string",
                "title": "Description"
            },
            "username": {
                "type": "string",
                "description": "The name of the default resource to use when defining an X system",
                "title": "System Auth Username"
            },
            "password": {
                // "type": "string",
                "type": "password",
                "description": "The password of the default resource to use when defining an X system",
                "title": "System Auth Password"
            },
            "type": {
                "type": "string",
                "enum": [
                    "STORAGE", "EXECUTION"
                ],
                "title": "Select System Type"
            },
            "test": {
                "type": "template",
                "title": "Select System Type"
            },
            "credential": {
                "type": "string",
                "title": "System Auth Credential"
            },
            "port": {
                "type": "number",
                "title": "System Auth Server Port"
            },
            "protocol": {
                "type": "string",
                "title": "System Auth Server Protocol"
            },
            "executionType": {
                "type": "string",
                "enum": [
                  "CLI", "CONDOR", "HPC"
                ],
                "title": "Execution Type"
            },
            "maxSystemJobs": {
                "type": "number",
                "title": "Maximum System Jobs"
            },
            "maxSystemJobsPerUser": {
                "type": "number",
                "title": "Maximum Jobs Per User"
            },
            "scratchDir": {
                "type": "string",
                "title": "Scratch Directory"
            },
            "workDir": {
                "type": "string",
                "title": "Work Directory"
            },
            "scheduler": {
                "type": "string",
                "enum": [
                  "LSF", "LOADLEVELER", "PBS", "SGE", "CONDOR", "FORK", "COBALT", "TORQUE", "MOAB", "SLURM", "UNKNOWN"
                ],
                "title": "Scheduler"
            },
            "environment": {
                "type": [null,"string"],
                "title": "Environment"
            },
            "startupScript": {
                "type": "string",
                "title": "Startup Script"
            },
            "queues": {
              "type": "array",
              "title": "Queues",
              "items": {
                "type": "object",
                "properties": {
                  "name": {
                    "title": "Name",
                    "type": "string",
                    "description": "Arbitrary name for the queue. This will be used in the job submission process, so it should line up with the name of an actual queue on the execution system"
                  },
                  "maxJobs": {
                    "title": "Maximum Jobs",
                    "type": "number",
                    "description": "Maximum number of jobs that can be queued or running within this queue at a given time. Defaults to 10. -1 for no limit",
                    "x-schema-form": {
                      "type": "number",
                      "placeholder": 10
                    }
                  },
                  "maxUserJobs": {
                    "title": "Maximum User Jobs",
                    "type": "number",
                    "description": "Maximum number of jobs that can be queued or running by any single user within this queue at a given time. Defaults to 10. -1 for no limit",
                    "x-schema-form": {
                      "type": "number",
                      "placeholder": 1
                    }
                  },
                  "maxNodes": {
                    "title": "Maximum Nodes",
                    "type": "number",
                    "description": "Maximum number of nodes that can be requested for any job in this queue. -1 for no limit",
                    "x-schema-form": {
                      "type": "number",
                      "placeholder": 1
                    }
                  },
                  "maxProcessorsPerNode": {
                    "title": "Maximum Processors Per Node",
                    "type": "number",
                    "description": "Maximum number of processors per node that can be requested for any job in this queue. -1 for no limit",
                    "x-schema-form": {
                      "type": "number",
                      "placeholder": -1
                    }
                  },
                  "maxMemoryPerNode": {
                    "title": "Maximum Memory Per Node",
                    "type": "string",
                    "description": "Maximum memory per node for jobs submitted to this queue in ###.#[E|P|T|G]B format",
                    "x-schema-form": {
                      "type": "string",
                      "placeholder": "1024GB"
                    }
                  },
                  "maxRequestedTime": {
                    "type": "string",
                    "maxLength": 10,
                    "title": "Maximum Requested Time",
                    "description": "Maximum run time for any job in this queue given in hh:mm:ss format",
                    "x-schema-form": {
                        "type": "input",
                        "placeholder": "24:00:00"
                    }
                  },
                  "customDirectives": {
                    "title": "Custom Directives",
                    "type": "string",
                    "description": "Arbitrary text that will be appended to the end of the scheduler directives in a batch submit script. This could include a project number, system-specific directives, etc"
                  },
                  "default": {
                    "type": "boolean",
                    "title": "Default",
                    "description": "True if this is the default queue for the system, false otherwise",
                    "enum": [
                      true, false
                    ]
                  }
                },
              }
            },

            // STORAGE.storage
            "storage": {
                "type": "object",
                // "title": "STORAGE.storage",
                "title": "Storage",
                "properties": {
                    "host": {
                        "type": "string",
                        "title": "Host"
                    },
                    "port": {
                        "type": "number",
                        "title": "System Auth Server Port"
                    },
                    "protocol": {
                        "type": "string",
                        "title": "Protocol",
                        "enum": [
                            "FTP", "SFTP", "GRIDFTP", "IRODS", "LOCAL", "S3"
                        ],
                    },
                    "rootDir": {
                        "type": "string",
                        "title": "Root Directory"
                    },
                    "homeDir": {
                        "type": "string",
                        "title": "Home Directory"
                    },
                    "resource": {
                        "type": "string",
                        "title": "Resource"
                    },
                    "zone": {
                        "type": "string",
                        "title": "Zone"
                    },
                    "container": {
                        "type": "string",
                        "title": "Container"
                    },
                    // custom field for tunnel proxy option
                    "proxyTunnel": {
                      "title": "Proxy Tunnel",
                      "type": "string",
                      "enum": [
                        "YES",
                        "NO"
                      ]
                    },
                    "auth": {
                        "type": "object",
                        // "title": "STORAGE.storage.auth",
                        "title": "Storage Authentication",
                        "properties": {
                            "username": {
                                "type": "string",
                                "title": "Username"
                            },
                            "password": {
                                "type": "password",
                                "title": "Password"
                            },
                            "type": {
                                "type": "string",
                                "title": "Type",
                                "enum": [
                                    "ANONYMOUS","APIKEYS", "LOCAL", "PAM", "PASSWORD", "SSHKEYS", "X509"
                                ]
                            },
                            "credential": {
                                "type": "string",
                                "title": "System Auth Credential"
                            },
                            "publicKey": {
                                "type": "string",
                                "title": "SSH Public Key"
                            },
                            "privateKey": {
                                "type": "string",
                                "title": "SSH Private Key"
                            },
                            // custom field to select credentail or server options in auth
                            "credentialType": {
                              "type": "string",
                              "title": "Credential Type",
                              "enum": [
                                "credential", "server"
                              ]
                            },
                            "server": {
                                "type": "object",
                                "title": "STORAGE.storage.auth.server",
                                "properties": {
                                    "name": {
                                        "type": "string",
                                        "title": "Name",
                                        "minLength": 3,
                                        "maxLength": 64
                                    },
                                    "endpoint": {
                                        "type": "string",
                                        "title": "System Auth Server Endpoint"
                                    },
                                    "port": {
                                        "type": "number",
                                        "title": "System Auth Server Port"
                                    },
                                    "protocol": {
                                        "type": "string",
                                        "title": "Protocol",
                                        "enum": [
                                          "MPG", "MYPROXY"
                                        ],
                                    },
                                }
                            },
                            "proxy": {
                                "type": "object",
                                "properties": {
                                    "name": {
                                        "type": "string",
                                        "title": "Name",
                                    },
                                    "port": {
                                        "type": "number",
                                        "title": "Proxy Port"
                                    },
                                    "host": {
                                        "type": "string",
                                        "title": "Proxy Host"
                                    },
                                }
                            }
                        }
                    },
                    "proxy": {
                        "type": "object",
                        "title": "STORAGE.storage.proxy",
                        "properties": {
                          "name": {
                              "type": "string",
                              "title": "Name",
                          },
                          "port": {
                              "type": "number",
                              "title": "Proxy Port"
                          },
                          "host": {
                              "type": "string",
                              "title": "Proxy Host"
                          }
                        }
                    }
                }
            },
            "login": {
                "type": "object",
                // "title": "EXECUTION.login",
                "title": "Login",
                "properties": {
                    "host": {
                        "type": "string",
                        "title": "Host"
                    },
                    "port": {
                        "type": "number",
                        "title": "System Auth Server Port"
                    },
                    "protocol": {
                        "type": "string",
                        "title": "Protocol",
                        "enum": [
                            "SSH", "GSISSH", "LOCAL"
                        ],
                    },
                    // custom field for tunnel proxy option
                    "proxyTunnel": {
                      "type": "string",
                      "enum": [
                        "YES",
                        "NO"
                      ]
                    },
                    "auth": {
                        // "title": "EXECUTION.login.auth",
                        "title": "Login Authentication",
                        "type": "object",
                        "properties": {
                            "username": {
                                "type": "string",
                                "title": "Username"
                            },
                            "password": {
                                "title": "Password",
                                "type": "password"
                            },
                            "type": {
                                "title": "Type",
                                "type": "string",
                                "enum": [
                                    "APIKEYS", "LOCAL", "PAM", "PASSWORD", "SSHKEYS", "X509"
                                ]
                            },
                            "credential": {
                                "type": "string",
                                "title": "System Auth Credential"
                            },
                            "publicKey": {

                                "type": "string",
                                "title": "SSH Public Key"
                            },
                            "privateKey": {
                                "type": "string",
                                "title": "SSH Private Key"
                            },
                            // custom field to select credentail or server options in auth
                            "credentialType": {
                              "type": "string",
                              "title": "Credential Type",
                              "enum": [
                                "credential", "server"
                              ]
                            },
                            "server": {
                                "type": "object",
                                "title": "EXECUTION.login.auth.server",
                                "properties": {
                                    "name": {
                                        "type": "string",
                                        "title": "Name",
                                        "validator": "[a-zA-Z_\\-\\.]+",
                                        "minLength": 3,
                                        "maxLength": 64
                                    },
                                    "endpoint": {
                                        "type": "string",
                                        "title": "System Auth Server Endpoint"
                                    },
                                    "port": {
                                        "type": "number",
                                        "title": "System Auth Server Port"
                                    },
                                    "protocol": {
                                        "type": "string",
                                        "title": "Protocol",
                                        "enum": [
                                          "MPG", "MYPROXY"
                                        ],
                                    },
                                }
                            },
                            "proxy": {
                                "type": "object",
                                "title": "EXECUTION.storage.proxy",
                                "properties": {
                                  "name": {
                                      "type": "string",
                                      "title": "Name",
                                  },
                                  "port": {
                                      "type": "number",
                                      "title": "Proxy Port"
                                  },
                                  "host": {
                                      "type": "string",
                                      "title": "Proxy Host"
                                  }
                                }
                            }
                        }
                    },
                    "proxy": {
                        "title": "EXECUTION.login.proxy",
                        "type": "object",
                        "properties": {
                            "name": {
                              "type": "string",
                              "title": "Name"
                            },
                            "host": {
                              "type": "string",
                              "title": "Host"
                            },
                            "port": {
                              "type": "number",
                              "title": "Port"
                            }
                        }
                    }
                }
            }
        }
    };

    $scope.form = [{
        "type": "wizard",
        "tabs": [
            {
                "title": "Type",
                "items": [
                  {
                    "type": "section",
                    "htmlClass": "col-xs-8",
                    "items": [
                      {
                        "key": "type",
                        ngModelOptions: {
                            updateOnDefault: true
                        },
                        onChange: function(value, formModel) {
                            // Check if user erased all from editor
                            if ($scope.model === ''){
                              $scope.model = {};
                            }

                            // pre-define storage protocol and proxyTunnel
                            $scope.model.storage = {};
                            $scope.model.storage.protocol = "SFTP";
                        },
                        $validators: {
                            required: function(value) {
                                return value ? true : false;
                            },
                        },
                        validationMessage: {
                            'required': 'Missing required',
                        },
                      }
                    ],
                 },
                 {
                   "type": "section",
                   "htmlClass": "col-xs-4",
                   "items": [
                     {
                        "type": "template",
                        "template":

                        '<div class="form-group ">'+
                          '<label class="control-label">&nbsp;</label>'+
                          '<div class="form-control" style="border:transparent; padding-left:0px; padding-right:0px;">'+
                            '<i class="fa fa-question-circle fa-lg" popover-placement="right" popover-trigger="mouseenter" uib-popover="Give the system a unique identifier. This can be anything you like. E.g. demo.storage.example.com"></i>'+
                          '</div>'+
                          '<div class="help-block"></div>'+
                        '</div>',
                     }
                   ]
                 }
                ]
            },
            {
              "title": "Details",
              "items": [
                /*************************************** STORAGE ***************************************************/
                // STORAGE.id
                {
                  "type": "section",
                  "htmlClass": "col-xs-8",
                  "items": [
                    {
                      "key": "id",
                      "readonly": true
                      // ngModelOptions: {
                      //   updateOnDefault: true
                      // },
                      // onChange: function(value, formModel){
                      //   // Make sure systems are there before displaying message
                      //   if ($scope.systems.length > 0) {
                      //     formModel.description = '<span class="text-success">'+ value + ' is available</span>';
                      //   }
                      // },
                      // validationMessage: {
                      //   'required': 'Missing required',
                      //   'notavailable': '{{viewValue}} is not available'
                      // },
                      // $validators: {
                      //   required: function(value) {
                      //     return value ? true : false;
                      //   },
                      //   notavailable: function(value){
                      //     var systemFound =_.find($scope.systems, function(system){
                      //       if (system.id === value){
                      //         return true;
                      //       }
                      //     });
                      //     return systemFound ? false : true;
                      //   }
                      // },
                    },
                ]
              },
              {
                "type": "section",
                "htmlClass": "col-xs-4",
                "items": [
                {
                  "type": "template",
                  "template":

                  '<div class="form-group ">'+
                  '<label class="control-label">&nbsp;</label>'+
                  '<div class="form-control" style="border:transparent; padding-left:0px; padding-right:0px;">'+
                  '<i class="fa fa-question-circle fa-lg" popover-placement="right" popover-trigger="mouseenter" uib-popover="A unique identifier you assign to the system. A system id must be globally unique across a tenant and cannot be reused once deleted"></i>'+
                  '</div>'+
                  '<div class="help-block"></div>'+
                  '</div>',
                }
                ]
              },

              // STORAGE.name
              {
                "type": "section",
                  "htmlClass": "col-xs-8",
                  "items": [
                    {
                      "key": "name",
                      ngModelOptions: {
                        updateOnDefault: true
                      },
                      validationMessage: {
                        'required': 'Missing required'
                      },
                      $validators: {
                        required: function(value) {
                          return value ? true : false;
                        }
                      }
                    }
                  ]
              },
              {
                 "type": "section",
                 "htmlClass": "col-xs-4",
                 "items": [
                   {
                      "type": "template",
                      "template":

                      '<div class="form-group ">'+
                       '<label class="control-label">&nbsp;</label>'+
                       '<div class="form-control" style="border:transparent; padding-left:0px; padding-right:0px;">'+
                         '<i class="fa fa-question-circle fa-lg" popover-placement="right" popover-trigger="mouseenter" uib-popover="Give a name to this system. E.g. Demo Storage Example"></i>'+
                       '</div>'+
                       '<div class="help-block"></div>'+
                      '</div>',
                   }
                 ]
               },

               // STORAGE.status
               {
                 "type": "section",
                   "htmlClass": "col-xs-8",
                   "items": [
                     {
                       "key": "status"
                     },
                   ]
               },
               {
                  "type": "section",
                  "htmlClass": "col-xs-4",
                  "items": [
                    {
                       "type": "template",
                       "template":

                       '<div class="form-group ">'+
                        '<label class="control-label">&nbsp;</label>'+
                        '<div class="form-control" style="border:transparent; padding-left:0px; padding-right:0px;">'+
                          '<i class="fa fa-question-circle fa-lg" popover-placement="right" popover-trigger="mouseenter" uib-popover="The functional status of the system. Systems must be in UP status to be used"></i>'+
                        '</div>'+
                        '<div class="help-block"></div>'+
                       '</div>',
                    }
                  ]
                },


               // STORAGE.description
               {
                 "type": "section",
                   "htmlClass": "col-xs-8",
                   "items": [
                      "description",
                   ]
               },
               {
                  "type": "section",
                  "htmlClass": "col-xs-4",
                  "items": [
                    {
                       "type": "template",
                       "template":

                       '<div class="form-group ">'+
                        '<label class="control-label">&nbsp;</label>'+
                        '<div class="form-control" style="border:transparent; padding-left:0px; padding-right:0px;">'+
                          '<i class="fa fa-question-circle fa-lg" popover-placement="right" popover-trigger="mouseenter" uib-popover="Verbose description of this system"></i>'+
                        '</div>'+
                        '<div class="help-block"></div>'+
                       '</div>',
                    }
                  ]
                },

                // STORAGE.site
                {
                  "type": "section",
                    "htmlClass": "col-xs-8",
                    "items": [
                       "site",
                    ]
                },
                {
                   "type": "section",
                   "htmlClass": "col-xs-4",
                   "items": [
                     {
                        "type": "template",
                        "template":

                        '<div class="form-group ">'+
                         '<label class="control-label">&nbsp;</label>'+
                         '<div class="form-control" style="border:transparent; padding-left:0px; padding-right:0px;">'+
                           '<i class="fa fa-question-circle fa-lg" popover-placement="right" popover-trigger="mouseenter" uib-popover="The site associated with this system. Primarily for logical grouping"></i>'+
                         '</div>'+
                         '<div class="help-block"></div>'+
                        '</div>',
                     }
                   ]
                 },
                /*************************************** END STORAGE *****************************************************/
                /*************************************** EXECUTION *******************************************************/
                // EXECUTION.executionType
                {
                  "type": "section",
                    "htmlClass": "col-xs-8",
                    "condition": "model.type === 'EXECUTION'",
                    "items": [
                      {
                        "key": "executionType",
                        ngModelOptions: {
                          updateOnDefault: true
                        },
                        validationMessage: {
                          'required': 'Missing required'
                        },
                        $validators: {
                          required: function(value) {
                            return value ? true : false;
                          }
                        }
                      }
                    ]
                },
                {
                   "type": "section",
                   "htmlClass": "col-xs-4",
                   "condition": "model.type === 'EXECUTION'",
                   "items": [
                     {
                        "type": "template",
                        "template":

                        '<div class="form-group ">'+
                         '<label class="control-label">&nbsp;</label>'+
                         '<div class="form-control" style="border:transparent; padding-left:0px; padding-right:0px;">'+
                           '<i class="fa fa-question-circle fa-lg" popover-placement="right" popover-trigger="mouseenter" uib-popover="Specifies how jobs should go into the system. HPC and Condor will leverage a batch scheduler. CLI will fork processes"></i>'+
                         '</div>'+
                         '<div class="help-block"></div>'+
                        '</div>',
                     }
                   ]
                 },

                 // EXECUTION.scheduler
                 // HPC -> LSF, LOADLEVELER, PSB, SGE, COBALT, TORQUE, MOAB, SLURM
                 {
                   "type": "section",
                     "htmlClass": "col-xs-8",
                     "condition": "model.type === 'EXECUTION' && model.executionType === 'HPC'",
                     "items": [
                       {
                         "key": "scheduler",
                         "type": "select",
                         "titleMap": {
                           "LSF": "LSF",
                           "LOADLEVELER": "LOADLEVELER",
                           "PSB": "PSB",
                           "SGE": "SGE",
                           "COBALT": "COBALT",
                           "TORQUE": "TORQUE",
                           "MOAB": "MOAB",
                           "SLURM": "SLURM"
                         },
                         ngModelOptions: {
                           updateOnDefault: true
                         },
                         validationMessage: {
                           'required': 'Missing required'
                         },
                         $validators: {
                           required: function(value) {
                             return value ? true : false;
                           }
                         }
                       }
                     ]
                 },
                 {
                    "type": "section",
                    "htmlClass": "col-xs-4",
                    "condition": "model.type === 'EXECUTION' && model.executionType === 'HPC'",
                    "items": [
                      {
                         "type": "template",
                         "template":

                         '<div class="form-group ">'+
                          '<label class="control-label">&nbsp;</label>'+
                          '<div class="form-control" style="border:transparent; padding-left:0px; padding-right:0px;">'+
                            '<i class="fa fa-question-circle fa-lg" popover-placement="right" popover-trigger="mouseenter" uib-popover="The type of batch scheduler available on the system. This only applies to systems with executionType HPC and CONDOR"></i>'+
                          '</div>'+
                          '<div class="help-block"></div>'+
                         '</div>',
                      }
                    ]
                  },

                  // CONDOR -> CONDOR
                  {
                    "type": "section",
                      "htmlClass": "col-xs-8",
                      "condition": "model.type === 'EXECUTION' && model.executionType === 'CONDOR'",
                      "items": [
                        {
                          "key": "scheduler",
                          "type": "select",
                          "titleMap": {
                            "CONDOR": "CONDOR"
                          },
                          ngModelOptions: {
                            updateOnDefault: true
                          },
                          validationMessage: {
                            'required': 'Missing required'
                          },
                          $validators: {
                            required: function(value) {
                              return value ? true : false;
                            }
                          }
                        }
                      ]
                  },
                  {
                     "type": "section",
                     "htmlClass": "col-xs-4",
                     "condition": "model.type === 'EXECUTION' && model.executionType === 'CONDOR'",
                     "items": [
                       {
                          "type": "template",
                          "template":

                          '<div class="form-group ">'+
                           '<label class="control-label">&nbsp;</label>'+
                           '<div class="form-control" style="border:transparent; padding-left:0px; padding-right:0px;">'+
                             '<i class="fa fa-question-circle fa-lg" popover-placement="right" popover-trigger="mouseenter" uib-popover="The type of batch scheduler available on the system. This only applies to systems with executionType HPC and CONDOR"></i>'+
                           '</div>'+
                           '<div class="help-block"></div>'+
                          '</div>',
                       }
                     ]
                   },

                   // CLI-> FORK
                   {
                     "type": "section",
                       "htmlClass": "col-xs-8",
                       "condition": "model.type === 'EXECUTION' && model.executionType === 'CLI'",
                       "items": [
                         {
                           "key": "scheduler",
                           "type": "select",
                           "titleMap": {
                             "FORK": "FORK"
                           },
                           ngModelOptions: {
                             updateOnDefault: true
                           },
                           validationMessage: {
                             'required': 'Missing required'
                           },
                           $validators: {
                             required: function(value) {
                               return value ? true : false;
                             }
                           }
                         }
                       ]
                   },
                   {
                      "type": "section",
                      "htmlClass": "col-xs-4",
                      "condition": "model.type === 'EXECUTION' && model.executionType === 'CLI'",
                      "items": [
                        {
                           "type": "template",
                           "template":

                           '<div class="form-group ">'+
                            '<label class="control-label">&nbsp;</label>'+
                            '<div class="form-control" style="border:transparent; padding-left:0px; padding-right:0px;">'+
                              '<i class="fa fa-question-circle fa-lg" popover-placement="right" popover-trigger="mouseenter" uib-popover="The type of batch scheduler available on the system. This only applies to systems with executionType HPC and CONDOR"></i>'+
                            '</div>'+
                            '<div class="help-block"></div>'+
                           '</div>',
                        }
                      ]
                    },

                 // EXECUTION.maxSystemJobs
                 {
                   "type": "section",
                     "htmlClass": "col-xs-8",
                     "condition": "model.type === 'EXECUTION'",
                     "items": [
                       {
                         "key": "maxSystemJobs"
                       }
                     ]
                 },
                 {
                    "type": "section",
                    "htmlClass": "col-xs-4",
                    "condition": "model.type === 'EXECUTION'",
                    "items": [
                      {
                         "type": "template",
                         "template":

                         '<div class="form-group ">'+
                          '<label class="control-label">&nbsp;</label>'+
                          '<div class="form-control" style="border:transparent; padding-left:0px; padding-right:0px;">'+
                            '<i class="fa fa-question-circle fa-lg" popover-placement="right" popover-trigger="mouseenter" uib-popover="Maximum number of jobs that can be queued or running on a system across all queues at a given time. Defaults to unlimited"></i>'+
                          '</div>'+
                          '<div class="help-block"></div>'+
                         '</div>',
                      }
                    ]
                  },

                  // EXECUTION.scratchDir
                  {
                    "type": "section",
                      "htmlClass": "col-xs-8",
                      "condition": "model.type === 'EXECUTION'",
                      "items": [
                        {
                          "key": "maxSystemJobs"
                        }
                      ]
                  },
                  {
                     "type": "section",
                     "htmlClass": "col-xs-4",
                     "condition": "model.type === 'EXECUTION'",
                     "items": [
                       {
                          "type": "template",
                          "template":

                          '<div class="form-group ">'+
                           '<label class="control-label">&nbsp;</label>'+
                           '<div class="form-control" style="border:transparent; padding-left:0px; padding-right:0px;">'+
                             '<i class="fa fa-question-circle fa-lg" popover-placement="right" popover-trigger="mouseenter" uib-popover="Maximum number of jobs that can be queued or running on a system across all queues at a given time. Defaults to unlimited"></i>'+
                           '</div>'+
                           '<div class="help-block"></div>'+
                          '</div>',
                       }
                     ]
                   },

                   // EXECUTION.workDir
                   {
                     "type": "section",
                       "htmlClass": "col-xs-8",
                       "condition": "model.type === 'EXECUTION'",
                       "items": [
                         {
                           "key": "workDir"
                         }
                       ]
                   },
                   {
                      "type": "section",
                      "htmlClass": "col-xs-4",
                      "condition": "model.type === 'EXECUTION'",
                      "items": [
                        {
                           "type": "template",
                           "template":

                           '<div class="form-group ">'+
                            '<label class="control-label">&nbsp;</label>'+
                            '<div class="form-control" style="border:transparent; padding-left:0px; padding-right:0px;">'+
                              '<i class="fa fa-question-circle fa-lg" popover-placement="right" popover-trigger="mouseenter" uib-popover="Path to use for a job working directory. This value will be used if no scratchDir is given. The path will be resolved relative to the rootDir value in the storage config if it begins with a /, and relative to the system homeDir otherwise"></i>'+
                            '</div>'+
                            '<div class="help-block"></div>'+
                           '</div>',
                        }
                      ]
                    },


                     // EXECUTION.environment
                     {
                       "type": "section",
                         "htmlClass": "col-xs-8",
                         "condition": "model.type === 'EXECUTION'",
                         "items": [
                           {
                             "key": "environment"
                           }
                         ]
                     },
                     {
                        "type": "section",
                        "htmlClass": "col-xs-4",
                        "condition": "model.type === 'EXECUTION'",
                        "items": [
                          {
                             "type": "template",
                             "template":

                             '<div class="form-group ">'+
                              '<label class="control-label">&nbsp;</label>'+
                              '<div class="form-control" style="border:transparent; padding-left:0px; padding-right:0px;">'+
                                '<i class="fa fa-question-circle fa-lg" popover-placement="right" popover-trigger="mouseenter" uib-popover="List of key-value pairs that will be added to the environment prior to execution of any command"></i>'+
                              '</div>'+
                              '<div class="help-block"></div>'+
                             '</div>',
                          }
                        ]
                      },

                      // EXECUTION.startupScript
                      {
                        "type": "section",
                          "htmlClass": "col-xs-8",
                          "condition": "model.type === 'EXECUTION'",
                          "items": [
                            {
                              "key": "startupScript"
                            }
                          ]
                      },
                      {
                         "type": "section",
                         "htmlClass": "col-xs-4",
                         "condition": "model.type === 'EXECUTION'",
                         "items": [
                           {
                              "type": "template",
                              "template":

                              '<div class="form-group ">'+
                               '<label class="control-label">&nbsp;</label>'+
                               '<div class="form-control" style="border:transparent; padding-left:0px; padding-right:0px;">'+
                                 '<i class="fa fa-question-circle fa-lg" popover-placement="right" popover-trigger="mouseenter" uib-popover="Path to a script that will be run prior to execution of any command on this system. The path will be resolved relative to the rootDir value in the storage config if it begins with a "/", and relative to the system homeDir otherwise. Any environment variables defined in the system description will be set before this script is called. If this script fails, the job will fail."></i>'+
                               '</div>'+
                               '<div class="help-block"></div>'+
                              '</div>',
                           }
                         ]
                       },

                       // EXECUTION.queues
                       {
                         "type": "section",
                           "htmlClass": "col-xs-8",
                           "condition": "model.type === 'EXECUTION'",
                           "items": [
                             {
                               "key": "queues",
                               "add": "Add",
                               "style": {
                                 "add": "btn-success"
                               },
                               "items": [
                                 "queues[].name",
                                 "queues[].maxJobs",
                                 "queues[].maxNodes",
                                 "queues[].maxMemoryPerNode",
                                 "queues[].maxProcessorsPerNode",
                                 "queues[].maxRequestedTime",
                                 {
                                   "key": "queues[].customDirectives",
                                   "type": "textarea"
                                 },

                                 "queues[].default"
                               ]
                             }
                           ]
                       },
                       {
                          "type": "section",
                          "htmlClass": "col-xs-4",
                          "condition": "model.type === 'EXECUTION'",
                          "items": [
                            {
                               "type": "template",
                               "template":

                               '<div class="form-group ">'+
                                '<label class="control-label">&nbsp;</label>'+
                                '<div class="form-control" style="border:transparent; padding-left:0px; padding-right:0px;">'+
                                  '<i class="fa fa-question-circle fa-lg" popover-placement="right" popover-trigger="mouseenter" uib-popover="An array of batch queue definitions providing descriptive and quota information about the queues you want to expose on your system. If not specified, no other system queues will be available to jobs submitted using this system"></i>'+
                                '</div>'+
                                '<div class="help-block"></div>'+
                               '</div>',
                            }
                          ]
                        },

                /*************************************** END EXECUTION ***************************************************/
              ]
            },
            {
                "title": "Connectivity",
                "items": [
                 /********** CONNECTIVIY TAB **********/

                 /******************* EXECUTION ******************/
                 {
                   "key": "login",
                   "condition": "model.type === 'EXECUTION'",
                   "items": [
                        // EXECUTION.login.host
                        {
                        "type": "section",
                          "htmlClass": "col-xs-8",
                          "items": [
                            {
                                "key": "login.host",
                                ngModelOptions: {
                                  updateOnDefault: true
                                },
                                validationMessage: {
                                  'required': 'Missing required'
                                },
                                $validators: {
                                  required: function(value) {
                                    return value ? true : false;
                                  }
                                }
                            },
                          ]
                        },
                        {
                         "type": "section",
                         "htmlClass": "col-xs-4",
                         "items": [
                           {
                              "type": "template",
                              "template":

                              '<div class="form-group ">'+
                                '<label class="control-label">&nbsp;</label>'+
                                '<div class="form-control" style="border:transparent; padding-left:0px; padding-right:0px;">'+
                                  '<i class="fa fa-question-circle fa-lg" popover-placement="right" popover-trigger="mouseenter" uib-popover="The hostname or ip address of the server where the job will be submitted"></i>'+
                                '</div>'+
                                '<div class="help-block"></div>'+
                              '</div>',
                           }
                         ]
                       },

                        // EXECUTION.login.port
                        {
                        "type": "section",
                          "htmlClass": "col-xs-8",
                          "items": [
                            {
                                "key": "login.port"
                            },
                          ]
                        },
                        {
                         "type": "section",
                         "htmlClass": "col-xs-4",
                         "items": [
                           {
                              "type": "template",
                              "template":

                              '<div class="form-group ">'+
                                '<label class="control-label">&nbsp;</label>'+
                                '<div class="form-control" style="border:transparent; padding-left:0px; padding-right:0px;">'+
                                  '<i class="fa fa-question-circle fa-lg" popover-placement="right" popover-trigger="mouseenter" uib-popover="The port number of the server where the job will be submitted. Defaults to the default port of the protocol used"></i>'+
                                '</div>'+
                                '<div class="help-block"></div>'+
                              '</div>',
                           }
                         ]
                       },

                       // EXECUTION.login.protocol
                       {
                       "type": "section",
                         "htmlClass": "col-xs-8",
                         "items": [
                           {
                               "key": "login.protocol",
                               ngModelOptions: {
                                 updateOnDefault: true
                               },
                               validationMessage: {
                                 'required': 'Missing required'
                               },
                               $validators: {
                                 required: function(value) {
                                   return value ? true : false;
                                 }
                               }
                           },
                         ]
                       },
                       {
                        "type": "section",
                        "htmlClass": "col-xs-4",
                        "items": [
                          {
                             "type": "template",
                             "template":

                             '<div class="form-group ">'+
                               '<label class="control-label">&nbsp;</label>'+
                               '<div class="form-control" style="border:transparent; padding-left:0px; padding-right:0px;">'+
                                 '<i class="fa fa-question-circle fa-lg" popover-placement="right" popover-trigger="mouseenter" uib-popover="The protocol used to submit jobs for execution"></i>'+
                               '</div>'+
                               '<div class="help-block"></div>'+
                             '</div>',
                          }
                        ]
                      },

                       // login.proxyTunnel
                       {
                         "type": "section",
                           "htmlClass": "col-xs-8",
                           "condition": "model.login.protocol === 'SSH'",
                           "items": [
                             {
                               "key": "login.proxyTunnel",
                             }
                           ]
                       },
                       {
                          "type": "section",
                          "htmlClass": "col-xs-4",
                          "condition": "model.login.protocol === 'SSH'",
                          "items": [
                            {
                               "type": "template",
                               "template":
                               '<div class="form-group ">'+
                                 '<label class="control-label">&nbsp;</label>'+
                                 '<div class="form-control" style="border:transparent; padding-left:0px; padding-right:0px;">'+
                                   '<i class="fa fa-question-circle fa-lg" popover-placement="right" popover-trigger="mouseenter" uib-popover="configuration attributes give information about how to connect to a remote system through a proxy server. This often happens when the target system is behind a firewall or resides on a NAT. Currently proxy servers can only reuse the authentication configuration provided by the target system"></i>'+
                                 '</div>'+
                                 '<div class="help-block"></div>'+
                               '</div>',
                            }
                          ]
                        },


                    ]
                  },


                  // EXECUTION.login.auth
                  {
                    "key": "login.auth",
                    "condition": "model.type === 'EXECUTION' && model.login.protocol",
                    "items": [
                       // EXECUTION.login.auth.type
                       {
                         "type": "section",
                           "htmlClass": "col-xs-8",
                           "condition": "model.login.protocol && model.login.protocol !== 'LOCAL'",
                           "items": [
                             {
                                 "key": "login.auth.type",
                                 ngModelOptions: {
                                   updateOnDefault: true
                                 },
                                 validationMessage: {
                                   'required': 'Missing required'
                                 },
                                 $validators: {
                                   required: function(value) {
                                     return value ? true : false;
                                   }
                                 }
                             }
                           ]
                       },
                       {
                          "type": "section",
                          "htmlClass": "col-xs-4",
                          "condition": "model.login.protocol && model.login.protocol !== 'LOCAL'",
                          "items": [
                            {
                               "type": "template",
                               "template":
                               '<div class="form-group ">'+
                                 '<label class="control-label">&nbsp;</label>'+
                                 '<div class="form-control" style="border:transparent; padding-left:0px; padding-right:0px;">'+
                                   '<i class="fa fa-question-circle fa-lg" popover-placement="right" popover-trigger="mouseenter" uib-popover="The path on the remote system where apps will be stored if this system is used as the default public storage system"></i>'+
                                 '</div>'+
                                 '<div class="help-block"></div>'+
                               '</div>',
                            }
                          ]
                        },

                        // EXECUTION.login.auth.credentialType
                        {
                         "type": "section",
                           "htmlClass": "col-xs-8",
                           "condition":
                              "model.login.auth.type === 'X509'",
                           "items": [
                             {
                                 "key": "login.auth.credentialType"
                             }
                           ]
                        },
                        {
                          "type": "section",
                          "htmlClass": "col-xs-4",
                          "condition":
                             "model.login.auth.type === 'X509'",
                          "items": [
                            {
                               "type": "template",
                               "template":
                               '<div class="form-group ">'+
                                 '<label class="control-label">&nbsp;</label>'+
                                 '<div class="form-control" style="border:transparent; padding-left:0px; padding-right:0px;">'+
                                   '<i class="fa fa-question-circle fa-lg" popover-placement="right" popover-trigger="mouseenter" uib-popover="Insert your credential keys from the File Manager or copy and paste into text area"></i>'+
                                 '</div>'+
                                 '<div class="help-block"></div>'+
                               '</div>',
                            }
                          ]
                        },

                        // EXECUTION.login.auth.username
                        {
                         "type": "section",
                           "htmlClass": "col-xs-8",
                           "condition":
                             "model.login.auth.type === 'PASSWORD' || " +
                             "model.login.auth.credentialType === 'server' || " +
                             "model.login.auth.type === 'PAM' || " +
                             "model.login.auth.type === 'ANONYMOUS' ||" +
                             "model.login.auth.type === 'SSHKEYS'",
                           "items": [
                             {
                                 "key": "login.auth.username",
                             }
                           ]
                        },
                        {
                          "type": "section",
                          "htmlClass": "col-xs-4",
                          "condition":
                            "model.login.auth.type === 'PASSWORD' || " +
                            "model.login.auth.credentialType === 'server' || " +
                            "model.login.auth.type === 'PAM' || " +
                            "model.login.auth.type === 'ANONYMOUS' ||" +
                            "model.login.auth.type === 'SSHKEYS'",
                          "items": [
                            {
                               "type": "template",
                               "template":
                               '<div class="form-group ">'+
                                 '<label class="control-label">&nbsp;</label>'+
                                 '<div class="form-control" style="border:transparent; padding-left:0px; padding-right:0px;">'+
                                   '<i class="fa fa-question-circle fa-lg" popover-placement="right" popover-trigger="mouseenter" uib-popover="The name of the default resource to use when defining a system."></i>'+
                                 '</div>'+
                                 '<div class="help-block"></div>'+
                               '</div>',
                            }
                          ]
                        },

                        // EXECUTION.login.auth.password
                        {
                         "type": "section",
                           "htmlClass": "col-xs-8",
                           "condition":
                             "model.login.auth.type === 'PASSWORD' || " +
                             "model.login.auth.server.protocol === 'MYPROXY' || " +
                             "model.login.auth.server.protocol === 'MPG' || " +
                             "model.login.auth.type === 'PAM' || " +
                             "model.login.auth.type === 'ANONYMOUS'",
                           "items": [
                             {
                                 "title": "Password",
                                 "key": "login.auth.password",
                                 "type": "password"
                             }
                           ]
                        },
                        {
                          "type": "section",
                          "htmlClass": "col-xs-4",
                          "condition":
                            "model.login.auth.type === 'PASSWORD' || " +
                            "model.login.auth.server.protocol === 'MYPROXY' || " +
                            "model.login.auth.server.protocol === 'MPG' || " +
                            "model.login.auth.type === 'PAM' || " +
                            "model.login.auth.type === 'ANONYMOUS'",
                          "items": [
                            {
                               "type": "template",
                               "template":
                               '<div class="form-group ">'+
                                 '<label class="control-label">&nbsp;</label>'+
                                 '<div class="form-control" style="border:transparent; padding-left:0px; padding-right:0px;">'+
                                   '<i class="fa fa-question-circle fa-lg" popover-placement="right" popover-trigger="mouseenter" uib-popover="The password on the remote system used to authenticate"></i>'+
                                 '</div>'+
                                 '<div class="help-block"></div>'+
                               '</div>',
                            }
                          ]
                        },

                        // EXECUTION.login.auth.credential
                        {
                          "type": "section",
                          "htmlClass": "col-xs-8",
                          "condition": "model.login.auth.credentialType === 'credential'",
                          "items": [
                            {
                                "key": "login.auth.credential",
                                "type": "textarea",
                            }
                          ]
                        },
                        {
                          "type": "section",
                          "htmlClass": "col-xs-2",
                          "condition": "model.login.auth.credentialType === 'credential'",
                          "items": [
                            {
                              "type": "select",
                              "title": "Upload",
                              "titleMap": $scope.systemsTitleMap,
                              ngModelOptions: {
                                  updateOnDefault: true
                              },
                              onChange: function(systemId, formModel) {
                                if (systemId === 'Local Disk'){

                                  $uibModal.open({
                                    templateUrl: "views/systems/filemanager-local.html",
                                    // resolve: {
                                    // },
                                    scope: $scope,
                                    size: 'lg',
                                    controller: ['$scope', '$modalInstance', function($scope, $modalInstance ) {

                                      $scope.fileUpload = function(element) {
                                        $scope.loading = true;

                                        $scope.$apply(function(scope) {
                                           var file = element.files[0];
                                           var reader = new FileReader();
                                           reader.onerror = function(e) {
                                              // TO-DO
                                           };

                                           reader.onloadend = function(e) {
                                             $scope.model.login.auth.credential = e.target.result;
                                             $scope.loading = false;
                                           };
                                           reader.readAsText(file);
                                        });
                                      };

                                      $scope.cancel = function()
                                      {
                                          $modalInstance.dismiss('cancel');
                                      };

                                      $scope.upload = function(){
                                          $modalInstance.close();
                                      }

                                    }]
                                  });

                                } else {
                                  SystemsController.getSystemDetails(systemId).then(
                                      function(sys) {
                                          if ($stateParams.path) {
                                              $scope.path = $stateParams.path;
                                          } else {
                                              $scope.path = $localStorage.activeProfile.username;
                                              $stateParams.path = $scope.path;
                                              // $location.path("/data/explorer/" + $stateParams.systemId + "/" + $scope.path);
                                          }
                                          $scope.system = sys;
                                          $rootScope.uploadFileContent = '';
                                          $uibModal.open({
                                            templateUrl: "views/systems/filemanager.html",
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
                                                    // $scope.model.login = {'auth' : {'credential': ''}};
                                                    $scope.model.login.auth.credential = uploadFileContent;
                                                    $scope.close();
                                                  }
                                              });
                                            }]
                                          });
                                      },
                                      function(msg) {
                                          $scope.path = $stateParams.path ? $stateParams.path : '';
                                          $scope.system = '';
                                      }
                                  );
                                }
                              }
                            }
                          ]
                        },
                        {
                         "type": "section",
                         "htmlClass": "col-xs-2",
                         "condition": "model.login.auth.credentialType === 'credential'",
                         "items": [
                           {
                              "type": "template",
                              "template":

                              '<div class="form-group ">'+
                                '<label class="control-label">&nbsp;</label>'+
                                '<div class="form-control" style="border:transparent; padding-left:0px; padding-right:0px;">'+
                                  '<i class="fa fa-question-circle fa-lg" popover-placement="right" popover-trigger="mouseenter" uib-popover="Copy and paste your publicKey or use the Upload File Manager"></i>'+
                                '</div>'+
                                '<div class="help-block"></div>'+
                              '</div>',
                           }
                         ]
                       },
                        // {
                        //     "type": "section",
                        //     "htmlClass": "col-xs-8",
                        //     "condition": "model.login.auth.credentialType === 'credential'",
                        //     "items": [
                        //       {
                        //           "key": "login.auth.credential",
                        //           validationMessage: {
                        //               'required': 'Missing required',
                        //           },
                        //           $validators: {
                        //               required: function(value) {
                        //                   return value ? true : false;
                        //               },
                        //           }
                        //       }
                        //     ]
                        // },
                        // {
                        //    "type": "section",
                        //    "htmlClass": "col-xs-4",
                        //    "condition": "model.login.auth.credentialType === 'credential'",
                        //    "items": [
                        //      {
                        //         "type": "template",
                        //         "template":
                        //
                        //         '<div class="form-group ">'+
                        //           '<label class="control-label">&nbsp;</label>'+
                        //           '<div class="form-control" style="border:transparent; padding-left:0px; padding-right:0px;">'+
                        //             '<i class="fa fa-question-circle fa-lg" popover-placement="right" popover-trigger="mouseenter" uib-popover="Some useful information"></i>'+
                        //           '</div>'+
                        //           '<div class="help-block"></div>'+
                        //         '</div>',
                        //      }
                        //    ]
                        //  },

                         // login.auth.publicKey for SSHKEYS
                         {
                           "type": "section",
                           "htmlClass": "col-xs-8",
                           "condition":
                              "model.login.auth.type === 'SSHKEYS'",
                           "items": [
                             {
                                 "key": "login.auth.publicKey",
                                 "type": "textarea",
                             }
                           ]
                         },
                         {
                           "type": "section",
                           "htmlClass": "col-xs-2",
                           "condition":
                              "model.login.auth.type === 'SSHKEYS'",
                           "items": [
                             {
                               "type": "select",
                               "title": "Upload",
                              //  "titleMap": $scope.getSystemsTitleMap(),
                               "titleMap": $scope.systemsTitleMap,
                               ngModelOptions: {
                                   updateOnDefault: true
                               },
                               onChange: function(systemId, formModel) {
                                 if (systemId === 'Local Disk'){

                                   $uibModal.open({
                                     templateUrl: "views/systems/filemanager-local.html",
                                     // resolve: {
                                     // },
                                     scope: $scope,
                                     size: 'lg',
                                     controller: ['$scope', '$modalInstance', function($scope, $modalInstance ) {

                                       $scope.fileUpload = function(element) {
                                         $scope.loading = true;

                                         $scope.$apply(function(scope) {
                                            var file = element.files[0];
                                            var reader = new FileReader();
                                            reader.onerror = function(e) {
                                               // TO-DO
                                            };

                                            reader.onloadend = function(e) {
                                              $scope.model.login.auth.publicKey = e.target.result;
                                              $scope.loading = false;
                                            };
                                            reader.readAsText(file);
                                         });
                                       };

                                       $scope.cancel = function()
                                       {
                                           $modalInstance.dismiss('cancel');
                                       };

                                       $scope.upload = function(){
                                           $modalInstance.close();
                                       }

                                     }]
                                   });

                                 } else {
                                   SystemsController.getSystemDetails(systemId).then(
                                       function(sys) {
                                           if ($stateParams.path) {
                                               $scope.path = $stateParams.path;
                                           } else {
                                               $scope.path = $localStorage.activeProfile.username;
                                               $stateParams.path = $scope.path;
                                               // $location.path("/data/explorer/" + $stateParams.systemId + "/" + $scope.path);
                                           }
                                           $scope.system = sys;
                                           $rootScope.uploadFileContent = '';
                                           $uibModal.open({
                                             templateUrl: "views/systems/filemanager.html",
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
                                                    //  $scope.model.login = {'auth' : {'publicKey': ''}};
                                                     $scope.model.login.auth.publicKey = uploadFileContent;
                                                     $scope.close();
                                                   }
                                               });
                                             }]
                                           });
                                       },
                                       function(msg) {
                                           $scope.path = $stateParams.path ? $stateParams.path : '';
                                           $scope.system = '';
                                       }
                                   );
                                 }
                               }
                             }
                           ]
                         },
                         {
                          "type": "section",
                          "htmlClass": "col-xs-2",
                          "condition":
                             "model.login.auth.type === 'SSHKEYS'",
                          "items": [
                            {
                               "type": "template",
                               "template":

                               '<div class="form-group ">'+
                                 '<label class="control-label">&nbsp;</label>'+
                                 '<div class="form-control" style="border:transparent; padding-left:0px; padding-right:0px;">'+
                                   '<i class="fa fa-question-circle fa-lg" popover-placement="right" popover-trigger="mouseenter" uib-popover="Copy and paste your publicKey or use the Upload File Manager"></i>'+
                                 '</div>'+
                                 '<div class="help-block"></div>'+
                               '</div>',
                            }
                          ]
                        },

                        // login.auth.privateKey for SSHKEYS
                        {
                          "type": "section",
                          "htmlClass": "col-xs-8",
                          "condition":
                             "model.login.auth.type === 'SSHKEYS'",
                          "items": [
                            {
                                "key": "login.auth.privateKey",
                                "type": "textarea",
                            }
                          ]
                        },
                        {
                          "type": "section",
                          "htmlClass": "col-xs-2",
                          "condition":
                             "model.login.auth.type === 'SSHKEYS'",
                          "items": [
                            {
                              "type": "select",
                              "title": "Upload",
                              // "titleMap": $scope.getSystemsTitleMap(),
                              "titleMap": $scope.systemsTitleMap,
                              ngModelOptions: {
                                  updateOnDefault: true
                              },
                              onChange: function(systemId, formModel) {
                                if (systemId === 'Local Disk'){

                                  $uibModal.open({
                                    templateUrl: "views/systems/filemanager-local.html",
                                    // resolve: {
                                    // },
                                    scope: $scope,
                                    size: 'lg',
                                    controller: ['$scope', '$modalInstance', function($scope, $modalInstance ) {

                                      $scope.fileUpload = function(element) {
                                        $scope.loading = true;

                                        $scope.$apply(function(scope) {
                                           var file = element.files[0];
                                           var reader = new FileReader();
                                           reader.onerror = function(e) {
                                              // TO-DO
                                           };

                                           reader.onloadend = function(e) {
                                             $scope.model.login.auth.privateKey = e.target.result;
                                             $scope.loading = false;
                                           };
                                           reader.readAsText(file);
                                        });
                                      };

                                      $scope.cancel = function()
                                      {
                                          $modalInstance.dismiss('cancel');
                                      };

                                      $scope.upload = function(){
                                          $modalInstance.close();
                                      }

                                    }]
                                  });

                                } else {
                                  SystemsController.getSystemDetails(systemId).then(
                                      function(sys) {
                                          if ($stateParams.path) {
                                              $scope.path = $stateParams.path;
                                          } else {
                                              $scope.path = $localStorage.activeProfile.username;
                                              $stateParams.path = $scope.path;
                                              // $location.path("/data/explorer/" + $stateParams.systemId + "/" + $scope.path);
                                          }
                                          $scope.system = sys;
                                          $rootScope.uploadFileContent = '';
                                          $uibModal.open({
                                            templateUrl: "views/systems/filemanager.html",
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
                                                    // $scope.model.storage = {'auth' : {'privateKey': ''}};
                                                    $scope.model.login.auth.privateKey = uploadFileContent;
                                                    $scope.close();
                                                  }
                                              });
                                            }]
                                          });
                                      },
                                      function(msg) {
                                          $scope.path = $stateParams.path ? $stateParams.path : '';
                                          $scope.system = '';
                                      }
                                  );
                                }
                              }
                            }
                          ]
                        },
                        {
                         "type": "section",
                         "htmlClass": "col-xs-2",
                         "condition":
                            "model.login.auth.type === 'SSHKEYS'",
                         "items": [
                           {
                              "type": "template",
                              "template":

                              '<div class="form-group ">'+
                                '<label class="control-label">&nbsp;</label>'+
                                '<div class="form-control" style="border:transparent; padding-left:0px; padding-right:0px;">'+
                                  '<i class="fa fa-question-circle fa-lg" popover-placement="right" popover-trigger="mouseenter" uib-popover="Copy and paste your privateKey or use the Upload File Manager"></i>'+
                                '</div>'+
                                '<div class="help-block"></div>'+
                              '</div>',
                           }
                         ]
                       },

                       // login.auth.publicKey for APIKEYS
                       {
                         "type": "section",
                         "htmlClass": "col-xs-8",
                         "condition":
                            "model.login.auth.type === 'APIKEYS'",
                         "items": [
                           {
                               "key": "login.auth.publicKey",
                               "type": "textarea",
                           }
                         ]
                       },
                      //  {
                      //    "type": "section",
                      //    "htmlClass": "col-xs-2",
                      //    "condition":
                      //       "model.login.auth.type === 'APIKEYS'",
                      //    "items": [
                      //      {
                      //        "type": "select",
                      //        "title": "Upload",
                      //       //  "titleMap": $scope.getSystemsTitleMap(),
                      //        "titleMap": $scope.systemsTitleMap,
                      //        ngModelOptions: {
                      //            updateOnDefault: true
                      //        },
                      //        onChange: function(systemId, formModel) {
                      //          if (systemId === 'Local Disk'){
                       //
                      //            $uibModal.open({
                      //              templateUrl: "views/systems/filemanager-local.html",
                      //              // resolve: {
                      //              // },
                      //              scope: $scope,
                      //              size: 'lg',
                      //              controller: ['$scope', '$modalInstance', function($scope, $modalInstance ) {
                       //
                      //                $scope.fileUpload = function(element) {
                      //                  $scope.loading = true;
                       //
                      //                  $scope.$apply(function(scope) {
                      //                     var file = element.files[0];
                      //                     var reader = new FileReader();
                      //                     reader.onerror = function(e) {
                      //                        // TO-DO
                      //                     };
                       //
                      //                     reader.onloadend = function(e) {
                      //                       $scope.model.login.auth.publicKey = e.target.result;
                      //                       $scope.loading = false;
                      //                     };
                      //                     reader.readAsText(file);
                      //                  });
                      //                };
                       //
                      //                $scope.cancel = function()
                      //                {
                      //                    $modalInstance.dismiss('cancel');
                      //                };
                       //
                      //                $scope.upload = function(){
                      //                    $modalInstance.close();
                      //                }
                       //
                      //              }]
                      //            });
                       //
                      //          } else {
                      //            SystemsController.getSystemDetails(systemId).then(
                      //                function(sys) {
                      //                    if ($stateParams.path) {
                      //                        $scope.path = $stateParams.path;
                      //                    } else {
                      //                        $scope.path = $localStorage.activeProfile.username;
                      //                        $stateParams.path = $scope.path;
                      //                        // $location.path("/data/explorer/" + $stateParams.systemId + "/" + $scope.path);
                      //                    }
                      //                    $scope.system = sys;
                      //                    $rootScope.uploadFileContent = '';
                      //                    $uibModal.open({
                      //                      templateUrl: "views/systems/filemanager.html",
                      //                      // resolve: {
                      //                      // },
                      //                      scope: $scope,
                      //                      size: 'lg',
                      //                      controller: ['$scope', '$modalInstance', function($scope, $modalInstance ) {
                      //                        $scope.cancel = function()
                      //                        {
                      //                            $modalInstance.dismiss('cancel');
                      //                        };
                       //
                      //                        $scope.close = function(){
                      //                            $modalInstance.close();
                      //                        }
                       //
                      //                        $scope.$watch('uploadFileContent', function(uploadFileContent){
                      //                            if (typeof uploadFileContent !== 'undefined' && uploadFileContent !== ''){
                      //                             //  $scope.model.login = {'auth' : {'publicKey': ''}};
                      //                              $scope.model.login.auth.publicKey = uploadFileContent;
                      //                              $scope.close();
                      //                            }
                      //                        });
                      //                      }]
                      //                    });
                      //                },
                      //                function(msg) {
                      //                    $scope.path = $stateParams.path ? $stateParams.path : '';
                      //                    $scope.system = '';
                      //                }
                      //            );
                      //          }
                      //        }
                      //      }
                      //    ]
                      //  },
                      {
                        "type": "section",
                        "htmlClass": "col-xs-2",
                        "condition":
                           "model.login.auth.type === 'APIKEYS'",
                        "items": [
                          {
                             "type": "template",
                             "template":

                             '<div class="form-group ">'+
                               '<label class="control-label">&nbsp;</label>'+
                               '<div class="form-control" style="border:transparent; padding-left:0px; padding-right:0px;">'+
                                 '<i class="fa fa-question-circle fa-lg" popover-placement="right" popover-trigger="mouseenter" uib-popover="Copy and paste your publicKey"></i>'+
                               '</div>'+
                               '<div class="help-block"></div>'+
                             '</div>',
                          }
                        ]
                      },

                      // login.auth.privateKey for APIKEYS
                      {
                        "type": "section",
                        "htmlClass": "col-xs-8",
                        "condition":
                           "model.login.auth.type === 'APIKEYS'",
                        "items": [
                          {
                              "key": "login.auth.privateKey",
                              "type": "textarea",
                          }
                        ]
                      },
                      // {
                      //   "type": "section",
                      //   "htmlClass": "col-xs-2",
                      //   "condition":
                      //      "model.login.auth.type === 'APIKEYS'",
                      //   "items": [
                      //     {
                      //       "type": "select",
                      //       "title": "Upload",
                      //       // "titleMap": $scope.getSystemsTitleMap(),
                      //       "titleMap": $scope.systemsTitleMap,
                      //       ngModelOptions: {
                      //           updateOnDefault: true
                      //       },
                      //       onChange: function(systemId, formModel) {
                      //         if (systemId === 'Local Disk'){
                      //
                      //           $uibModal.open({
                      //             templateUrl: "views/systems/filemanager-local.html",
                      //             // resolve: {
                      //             // },
                      //             scope: $scope,
                      //             size: 'lg',
                      //             controller: ['$scope', '$modalInstance', function($scope, $modalInstance ) {
                      //
                      //               $scope.fileUpload = function(element) {
                      //                 $scope.loading = true;
                      //
                      //                 $scope.$apply(function(scope) {
                      //                    var file = element.files[0];
                      //                    var reader = new FileReader();
                      //                    reader.onerror = function(e) {
                      //                       // TO-DO
                      //                    };
                      //
                      //                    reader.onloadend = function(e) {
                      //                      $scope.model.login.auth.privateKey = e.target.result;
                      //                      $scope.loading = false;
                      //                    };
                      //                    reader.readAsText(file);
                      //                 });
                      //               };
                      //
                      //               $scope.cancel = function()
                      //               {
                      //                   $modalInstance.dismiss('cancel');
                      //               };
                      //
                      //               $scope.upload = function(){
                      //                   $modalInstance.close();
                      //               }
                      //
                      //             }]
                      //           });
                      //
                      //         } else {
                      //           SystemsController.getSystemDetails(systemId).then(
                      //               function(sys) {
                      //                   if ($stateParams.path) {
                      //                       $scope.path = $stateParams.path;
                      //                   } else {
                      //                       $scope.path = $localStorage.activeProfile.username;
                      //                       $stateParams.path = $scope.path;
                      //                       // $location.path("/data/explorer/" + $stateParams.systemId + "/" + $scope.path);
                      //                   }
                      //                   $scope.system = sys;
                      //                   $rootScope.uploadFileContent = '';
                      //                   $uibModal.open({
                      //                     templateUrl: "views/systems/filemanager.html",
                      //                     // resolve: {
                      //                     // },
                      //                     scope: $scope,
                      //                     size: 'lg',
                      //                     controller: ['$scope', '$modalInstance', function($scope, $modalInstance ) {
                      //                       $scope.cancel = function()
                      //                       {
                      //                           $modalInstance.dismiss('cancel');
                      //                       };
                      //
                      //                       $scope.close = function(){
                      //                           $modalInstance.close();
                      //                       }
                      //
                      //                       $scope.$watch('uploadFileContent', function(uploadFileContent){
                      //                           if (typeof uploadFileContent !== 'undefined' && uploadFileContent !== ''){
                      //                             // $scope.model.storage = {'auth' : {'privateKey': ''}};
                      //                             $scope.model.login.auth.privateKey = uploadFileContent;
                      //                             $scope.close();
                      //                           }
                      //                       });
                      //                     }]
                      //                   });
                      //               },
                      //               function(msg) {
                      //                   $scope.path = $stateParams.path ? $stateParams.path : '';
                      //                   $scope.system = '';
                      //               }
                      //           );
                      //         }
                      //       }
                      //     }
                      //   ]
                      // },
                      {
                       "type": "section",
                       "htmlClass": "col-xs-2",
                       "condition":
                          "model.login.auth.type === 'APIKEYS'",
                       "items": [
                         {
                            "type": "template",
                            "template":

                            '<div class="form-group ">'+
                              '<label class="control-label">&nbsp;</label>'+
                              '<div class="form-control" style="border:transparent; padding-left:0px; padding-right:0px;">'+
                                '<i class="fa fa-question-circle fa-lg" popover-placement="right" popover-trigger="mouseenter" uib-popover="Copy and paste your privateKey"></i>'+
                              '</div>'+
                              '<div class="help-block"></div>'+
                            '</div>',
                         }
                       ]
                     },
                    ]
                  },
                  // end EXECUTION.login.auth

                  // EXECUTION.login.auth.server
                  {
                    "key": "login.auth.server",
                    "condition": "model.type === 'EXECUTION' && model.login.auth.credentialType === 'server'",
                    "items": [
                      // STORAGE.login.auth.server.protocol
                      {
                       "type": "section",
                         "htmlClass": "col-xs-8",
                         "condition": "model.login.auth.credentialType === 'server'",
                         "items": [
                           {
                                 "key": "login.auth.server.protocol",
                           }
                         ]
                      },
                      {
                        "type": "section",
                        "htmlClass": "col-xs-4",
                        "condition": "model.login.auth.credentialType === 'server'",
                        "items": [
                          {
                             "type": "template",
                             "template":
                             '<div class="form-group ">'+
                               '<label class="control-label">&nbsp;</label>'+
                               '<div class="form-control" style="border:transparent; padding-left:0px; padding-right:0px;">'+
                                 '<i class="fa fa-question-circle fa-lg" popover-placement="right" popover-trigger="mouseenter" uib-popover="The protocol used to authenticate to the storage server"></i>'+
                               '</div>'+
                               '<div class="help-block"></div>'+
                             '</div>',
                          }
                        ]
                      },

                     // STORAGE.login.auth.server.name
                     {
                       "type": "section",
                         "htmlClass": "col-xs-8",
                         "condition": "model.login.auth.credentialType === 'server'",
                         "items": [
                           {
                               "key": "login.auth.server.name",
                           }
                         ]
                     },
                     {
                        "type": "section",
                        "htmlClass": "col-xs-4",
                        "condition": "model.login.auth.credentialType === 'server'",
                        "items": [
                          {
                             "type": "template",
                             "template":
                             '<div class="form-group ">'+
                               '<label class="control-label">&nbsp;</label>'+
                               '<div class="form-control" style="border:transparent; padding-left:0px; padding-right:0px;">'+
                                 '<i class="fa fa-question-circle fa-lg" popover-placement="right" popover-trigger="mouseenter" uib-popover="A descriptive name given to the credential server"></i>'+
                               '</div>'+
                               '<div class="help-block"></div>'+
                             '</div>',
                          }
                        ]
                      },

                      // STORAGE.login.auth.server.endpoint
                      {
                        "type": "section",
                          "htmlClass": "col-xs-8",
                          "condition": "model.login.auth.credentialType === 'server'",
                          "items": [
                            {
                                "key": "login.auth.server.endpoint",
                            }
                          ]
                      },
                      {
                         "type": "section",
                         "htmlClass": "col-xs-4",
                         "condition": "model.login.auth.credentialType === 'server'",
                         "items": [
                           {
                              "type": "template",
                              "template":
                              '<div class="form-group ">'+
                                '<label class="control-label">&nbsp;</label>'+
                                '<div class="form-control" style="border:transparent; padding-left:0px; padding-right:0px;">'+
                                  '<i class="fa fa-question-circle fa-lg" popover-placement="right" popover-trigger="mouseenter" uib-popover="The endpoint of the authentication server"></i>'+
                                '</div>'+
                                '<div class="help-block"></div>'+
                              '</div>',
                           }
                         ]
                       },

                       // STORAGE.login.auth.server.port
                       {
                         "type": "section",
                           "htmlClass": "col-xs-8",
                           "condition": "model.login.auth.credentialType === 'server'",
                           "items": [
                             {
                                 "key": "login.auth.server.port"
                             }
                           ]
                       },
                       {
                          "type": "section",
                          "htmlClass": "col-xs-4",
                          "condition": "model.login.auth.credentialType === 'server'",
                          "items": [
                            {
                               "type": "template",
                               "template":
                               '<div class="form-group ">'+
                                 '<label class="control-label">&nbsp;</label>'+
                                 '<div class="form-control" style="border:transparent; padding-left:0px; padding-right:0px;">'+
                                   '<i class="fa fa-question-circle fa-lg" popover-placement="right" popover-trigger="mouseenter" uib-popover="The port number of the storage server"></i>'+
                                 '</div>'+
                                 '<div class="help-block"></div>'+
                               '</div>',
                            }
                          ]
                        },
                     ]
                 },

                 // EXECUTION.login.proxy
                 {
                   "key": "login.proxy",
                   "condition": "model.type === 'EXECUTION' && model.login.protocol === 'SSH' && model.login.proxyTunnel === 'YES'",
                   "items": [
                      // EXECUTION.login.proxy.name
                      {
                        "type": "section",
                          "htmlClass": "col-xs-8",
                          "condition": "model.login.protocol === 'SSH' && model.login.proxyTunnel === 'YES'",
                          "items": [
                            {
                                "key": "login.proxy.name",
                            }
                          ]
                      },
                      {
                         "type": "section",
                         "htmlClass": "col-xs-4",
                         "condition": "model.login.protocol === 'SSH' && model.login.proxyTunnel === 'YES'",
                         "items": [
                           {
                              "type": "template",
                              "template":
                              '<div class="form-group ">'+
                                '<label class="control-label">&nbsp;</label>'+
                                '<div class="form-control" style="border:transparent; padding-left:0px; padding-right:0px;">'+
                                  '<i class="fa fa-question-circle fa-lg" popover-placement="right" popover-trigger="mouseenter" uib-popover="A descriptive name given to the proxy server."></i>'+
                                '</div>'+
                                '<div class="help-block"></div>'+
                              '</div>',
                           }
                         ]
                       },

                       // EXECUTION.login.proxy.host
                       {
                         "type": "section",
                           "htmlClass": "col-xs-8",
                           "condition": "model.login.protocol === 'SSH' && model.login.proxyTunnel === 'YES'",
                           "items": [
                             {
                                 "key": "login.proxy.host",
                             }
                           ]
                       },
                       {
                          "type": "section",
                          "htmlClass": "col-xs-4",
                          "condition": "model.login.protocol === 'SSH' && model.login.proxyTunnel === 'YES'",
                          "items": [
                            {
                               "type": "template",
                               "template":
                               '<div class="form-group ">'+
                                 '<label class="control-label">&nbsp;</label>'+
                                 '<div class="form-control" style="border:transparent; padding-left:0px; padding-right:0px;">'+
                                   '<i class="fa fa-question-circle fa-lg" popover-placement="right" popover-trigger="mouseenter" uib-popover="The hostname of the proxy server"></i>'+
                                 '</div>'+
                                 '<div class="help-block"></div>'+
                               '</div>',
                            }
                          ]
                        },

                        // EXECUTION.login.proxy.port
                        {
                          "type": "section",
                            "htmlClass": "col-xs-8",
                            "condition": "model.login.protocol === 'SSH' && model.login.proxyTunnel === 'YES'",
                            "items": [
                              {
                                  "key": "login.proxy.port",
                              }
                            ]
                        },
                        {
                           "type": "section",
                           "htmlClass": "col-xs-4",
                           "condition": "model.login.protocol === 'SSH' && model.login.proxyTunnel === 'YES'",
                           "items": [
                             {
                                "type": "template",
                                "template":
                                '<div class="form-group ">'+
                                  '<label class="control-label">&nbsp;</label>'+
                                  '<div class="form-control" style="border:transparent; padding-left:0px; padding-right:0px;">'+
                                    '<i class="fa fa-question-circle fa-lg" popover-placement="right" popover-trigger="mouseenter" uib-popover="The port on which to connect to the proxy server. If null, the port in the parent storage config is used"></i>'+
                                  '</div>'+
                                  '<div class="help-block"></div>'+
                                '</div>',
                             }
                           ]
                         }
                     ]
                   },
                   // end EXECUTION.login.proxy

                 /******************* EXECUTION ******************/

                 /********** STORAGE ******************/
                 // fields: host, port, protocol, rootDir, homeDir

                 // STORAGE.storage
                 {
                   "key": "storage",
                   "items": [
                        // STORAGE.storage.protocol
                        {
                        "type": "section",
                          "htmlClass": "col-xs-8",
                          "items": [
                            {
                                "key": "storage.protocol",
                                "title": "Protocol",
                                ngModelOptions: {
                                    updateOnDefault: true
                                },
                                validationMessage: {
                                  'required': 'Missing required'
                                },
                                $validators: {
                                  required: function(value) {
                                    return value ? true : false;
                                  }
                                }

                            },
                          ]
                        },
                        {
                         "type": "section",
                         "htmlClass": "col-xs-4",
                         "items": [
                           {
                              "type": "template",
                              "template":

                              '<div class="form-group ">'+
                                '<label class="control-label">&nbsp;</label>'+
                                '<div class="form-control" style="border:transparent; padding-left:0px; padding-right:0px;">'+
                                  '<i class="fa fa-question-circle fa-lg" popover-placement="right" popover-trigger="mouseenter" uib-popover="The protocol used to authenticate to the storage server"></i>'+
                                '</div>'+
                                '<div class="help-block"></div>'+
                              '</div>',
                           }
                         ]
                        },

                        // STORAGE.storage.host
                        {
                        "type": "section",
                          "htmlClass": "col-xs-8",
                          "items": [
                            {
                                "key": "storage.host",
                                ngModelOptions: {
                                    updateOnDefault: true
                                },
                                validationMessage: {
                                  'required': 'Missing required'
                                },
                                $validators: {
                                  required: function(value) {
                                    return value ? true : false;
                                  }
                                }
                            }
                          ]
                        },
                        {
                         "type": "section",
                         "htmlClass": "col-xs-4",
                         "items": [
                           {
                              "type": "template",
                              "template":
                              '<div class="form-group ">'+
                                '<label class="control-label">&nbsp;</label>'+
                                '<div class="form-control" style="border:transparent; padding-left:0px; padding-right:0px;">'+
                                  '<i class="fa fa-question-circle fa-lg" popover-placement="right" popover-trigger="mouseenter" uib-popover="The hostname or ip address of the storage server"></i>'+
                                '</div>'+
                                '<div class="help-block"></div>'+
                              '</div>',
                           }
                         ]
                        },

                        // STORAGE.storage.port
                        {
                          "type": "section",
                            "htmlClass": "col-xs-8",
                            "condition": "model.storage.protocol !== 'LOCAL'",
                            "items": [
                              {
                                  "key": "storage.port",
                                  ngModelOptions: {
                                      updateOnDefault: true
                                  },
                                  validationMessage: {
                                    'required': 'Missing required'
                                  },
                                  $validators: {
                                    required: function(value) {
                                      return value ? true : false;
                                    }
                                  }
                              }
                            ]
                        },
                        {
                           "type": "section",
                           "htmlClass": "col-xs-4",
                           "condition": "model.storage.protocol !== 'LOCAL'",
                           "items": [
                             {
                                "type": "template",
                                "template":
                                '<div class="form-group ">'+
                                  '<label class="control-label">&nbsp;</label>'+
                                  '<div class="form-control" style="border:transparent; padding-left:0px; padding-right:0px;">'+
                                    '<i class="fa fa-question-circle fa-lg" popover-placement="right" popover-trigger="mouseenter" uib-popover="The port number of the storage server"></i>'+
                                  '</div>'+
                                  '<div class="help-block"></div>'+
                                '</div>',
                             }
                           ]
                         },

                         // STORAGE.rootDir
                         {
                           "type": "section",
                             "htmlClass": "col-xs-8",
                             "items": [
                               {
                                   "key": "storage.rootDir"
                               }
                             ]
                         },
                         {
                            "type": "section",
                            "htmlClass": "col-xs-4",
                            "items": [
                              {
                                 "type": "template",
                                 "template":
                                 '<div class="form-group ">'+
                                   '<label class="control-label">&nbsp;</label>'+
                                   '<div class="form-control" style="border:transparent; padding-left:0px; padding-right:0px;">'+
                                     '<i class="fa fa-question-circle fa-lg" popover-placement="right" popover-trigger="mouseenter" uib-popover="The path on the remote system to use as the virtual root directory for all API requests. Defaults to /"></i>'+
                                   '</div>'+
                                   '<div class="help-block"></div>'+
                                 '</div>',
                              }
                            ]
                          },

                        // STORAGE.storage.homeDir
                        {
                          "type": "section",
                          "htmlClass": "col-xs-8",
                          "items": [
                            {
                              "key": "storage.homeDir"
                            }
                          ]
                        },
                        {
                          "type": "section",
                          "htmlClass": "col-xs-4",
                          "items": [
                           {
                              "type": "template",
                              "template":
                              '<div class="form-group ">'+
                                '<label class="control-label">&nbsp;</label>'+
                                '<div class="form-control" style="border:transparent; padding-left:0px; padding-right:0px;">'+
                                  '<i class="fa fa-question-circle fa-lg" popover-placement="right" popover-trigger="mouseenter" uib-popover="The path on the remote system, relative to rootDir to use as the virtual home directory for all API requests. This will be the base of any requested paths that do not being with a /. Defaults to /, thus being equivalent to rootDir"></i>'+
                                '</div>'+
                                '<div class="help-block"></div>'+
                              '</div>',
                           }
                         ]
                        },

                        // STORAGE.storage.resource
                        {
                            "type": "section",
                            "htmlClass": "col-xs-8",
                            "condition": "model.storage.protocol === 'IRODS'",
                            "items": [
                              {
                                  "key": "storage.resource"
                              }
                            ]
                        },
                        {
                           "type": "section",
                           "htmlClass": "col-xs-4",
                           "condition": "model.storage.protocol === 'IRODS'",
                           "items": [
                             {
                                "type": "template",
                                "template":

                                '<div class="form-group ">'+
                                  '<label class="control-label">&nbsp;</label>'+
                                  '<div class="form-control" style="border:transparent; padding-left:0px; padding-right:0px;">'+
                                    '<i class="fa fa-question-circle fa-lg" popover-placement="right" popover-trigger="mouseenter" uib-popover="Some useful information"></i>'+
                                  '</div>'+
                                  '<div class="help-block"></div>'+
                                '</div>',
                             }
                           ]
                         },

                         // STORAGE.storage.zone
                         {
                             "type": "section",
                             "htmlClass": "col-xs-8",
                             "condition": "model.storage.protocol === 'IRODS'",
                             "items": [
                               {
                                   "key": "storage.zone"
                               }
                             ]
                         },
                         {
                            "type": "section",
                            "htmlClass": "col-xs-4",
                            "condition": "model.storage.protocol === 'IRODS'",
                            "items": [
                              {
                                 "type": "template",
                                 "template":

                                 '<div class="form-group ">'+
                                   '<label class="control-label">&nbsp;</label>'+
                                   '<div class="form-control" style="border:transparent; padding-left:0px; padding-right:0px;">'+
                                     '<i class="fa fa-question-circle fa-lg" popover-placement="right" popover-trigger="mouseenter" uib-popover="Some useful information"></i>'+
                                   '</div>'+
                                   '<div class="help-block"></div>'+
                                 '</div>',
                              }
                            ]
                          },

                          // storage.container
                          {
                            "type": "section",
                              "htmlClass": "col-xs-8",
                              "condition": "model.storage.protocol === 'S3'",
                              "items": [
                                {
                                    "key": "storage.container"
                                }
                              ]
                          },
                          {
                             "type": "section",
                             "htmlClass": "col-xs-4",
                             "condition": "model.storage.protocol === 'S3'",
                             "items": [
                               {
                                  "type": "template",
                                  "template":
                                  '<div class="form-group ">'+
                                    '<label class="control-label">&nbsp;</label>'+
                                    '<div class="form-control" style="border:transparent; padding-left:0px; padding-right:0px;">'+
                                      '<i class="fa fa-question-circle fa-lg" popover-placement="right" popover-trigger="mouseenter" uib-popover="The container to use when interacting with an object store. Specifying a container provides isolation when exposing your cloud storage accounts so users do not have access to your entire storage account. This should be used in combination with delegated cloud credentials such as an AWS IAM user credential"></i>'+
                                    '</div>'+
                                    '<div class="help-block"></div>'+
                                  '</div>',
                               }
                             ]
                           },

                           // storage.proxyTunnel
                           {
                             "type": "section",
                               "htmlClass": "col-xs-8",
                               "condition": "model.storage.protocol === 'SFTP'",
                               "items": [
                                 {
                                   "key": "storage.proxyTunnel",
                                 }
                                // {
                                //   "type": "select",
                                //   "title": "Select yes or no",
                                //    "titleMap": [
                                //      {"value": "yes", "name": "yes"},
                                //      {"value": "no", "name": "no"}
                                //    ],
                                //    ngModelOptions: {
                                //        updateOnDefault: true
                                //    },
                                //    onChange: function(value, model){
                                //
                                //    },
                                // },
                               ]
                           },
                           {
                              "type": "section",
                              "htmlClass": "col-xs-4",
                              "condition": "model.storage.protocol === 'SFTP'",
                              "items": [
                                {
                                   "type": "template",
                                   "template":
                                   '<div class="form-group ">'+
                                     '<label class="control-label">&nbsp;</label>'+
                                     '<div class="form-control" style="border:transparent; padding-left:0px; padding-right:0px;">'+
                                       '<i class="fa fa-question-circle fa-lg" popover-placement="right" popover-trigger="mouseenter" uib-popover="configuration attributes give information about how to connect to a remote system through a proxy server. This often happens when the target system is behind a firewall or resides on a NAT. Currently proxy servers can only reuse the authentication configuration provided by the target system"></i>'+
                                     '</div>'+
                                     '<div class="help-block"></div>'+
                                   '</div>',
                                }
                              ]
                            },

                    ]
                 },

                    /********** CONNECTIVITY TAB **********/

                    /************* AUTH TAB ***********/

                    // STORAGE.storage.auth
                    {
                      "key": "storage.auth",
                      "condition": "model.storage.protocol && model.storage.protocol !== 'LOCAL'",
                      "items": [
                         // STORAGE.storage.auth.type
                         {
                           "type": "section",
                             "htmlClass": "col-xs-8",
                             "condition": "model.storage.protocol && model.storage.protocol !== 'LOCAL'",
                             "items": [
                               {
                                   "key": "storage.auth.type",
                                   ngModelOptions: {
                                       updateOnDefault: true
                                   },
                                   validationMessage: {
                                     'required': 'Missing required'
                                   },
                                   $validators: {
                                     required: function(value) {
                                       return value ? true : false;
                                     }
                                   }
                               }
                             ]
                         },
                         {
                            "type": "section",
                            "htmlClass": "col-xs-4",
                            "condition": "model.storage.protocol && model.storage.protocol !== 'LOCAL'",
                            "items": [
                              {
                                 "type": "template",
                                 "template":
                                 '<div class="form-group ">'+
                                   '<label class="control-label">&nbsp;</label>'+
                                   '<div class="form-control" style="border:transparent; padding-left:0px; padding-right:0px;">'+
                                     '<i class="fa fa-question-circle fa-lg" popover-placement="right" popover-trigger="mouseenter" uib-popover="The path on the remote system where apps will be stored if this system is used as the default public storage system"></i>'+
                                   '</div>'+
                                   '<div class="help-block"></div>'+
                                 '</div>',
                              }
                            ]
                          },

                          // STORAGE.storage.auth.credentialType
                          {
                           "type": "section",
                             "htmlClass": "col-xs-8",
                             "condition":
                                "model.storage.auth.type === 'X509'",
                             "items": [
                               {
                                   "key": "storage.auth.credentialType"
                               }
                             ]
                          },
                          {
                            "type": "section",
                            "htmlClass": "col-xs-4",
                            "condition":
                               "model.storage.auth.type === 'X509'",
                            "items": [
                              {
                                 "type": "template",
                                 "template":
                                 '<div class="form-group ">'+
                                   '<label class="control-label">&nbsp;</label>'+
                                   '<div class="form-control" style="border:transparent; padding-left:0px; padding-right:0px;">'+
                                     '<i class="fa fa-question-circle fa-lg" popover-placement="right" popover-trigger="mouseenter" uib-popover="The name of the default resource to use when defining a system."></i>'+
                                   '</div>'+
                                   '<div class="help-block"></div>'+
                                 '</div>',
                              }
                            ]
                          },

                          // STORAGE.storage.auth.username
                          {
                           "type": "section",
                             "htmlClass": "col-xs-8",
                             "condition":
                               "model.storage.auth.type === 'PASSWORD' || " +
                               "model.storage.auth.credentialType === 'server' || " +
                               "model.storage.auth.type === 'PAM' || " +
                               "model.storage.auth.type === 'ANONYMOUS' ||" +
                               "model.storage.auth.type === 'SSHKEYS'",
                             "items": [
                               {
                                   "key": "storage.auth.username"
                               }
                             ]
                          },
                          {
                            "type": "section",
                            "htmlClass": "col-xs-4",
                            "condition":
                              "model.storage.auth.type === 'PASSWORD' || " +
                              "model.storage.auth.credentialType === 'server' || " +
                              "model.storage.auth.type === 'PAM' || " +
                              "model.storage.auth.type === 'ANONYMOUS' ||" +
                              "model.storage.auth.type === 'SSHKEYS'",
                            "items": [
                              {
                                 "type": "template",
                                 "template":
                                 '<div class="form-group ">'+
                                   '<label class="control-label">&nbsp;</label>'+
                                   '<div class="form-control" style="border:transparent; padding-left:0px; padding-right:0px;">'+
                                     '<i class="fa fa-question-circle fa-lg" popover-placement="right" popover-trigger="mouseenter" uib-popover="The name of the default resource to use when defining a system."></i>'+
                                   '</div>'+
                                   '<div class="help-block"></div>'+
                                 '</div>',
                              }
                            ]
                          },

                          // STORAGE.storage.auth.password
                          {
                           "type": "section",
                             "htmlClass": "col-xs-8",
                             "condition":
                               "model.storage.auth.type === 'PASSWORD' || " +
                               "model.storage.auth.server.protocol === 'MYPROXY' || " +
                               "model.storage.auth.server.protocol === 'MPG' || " +
                               "model.storage.auth.type === 'PAM' || " +
                               "model.storage.auth.type === 'ANONYMOUS'",
                             "items": [
                               {
                                   "key": "storage.auth.password",
                                   "type": "password",
                                   "title": "Password"
                               }
                             ]
                          },
                          {
                            "type": "section",
                            "htmlClass": "col-xs-4",
                            "condition":
                              "model.storage.auth.type === 'PASSWORD' || " +
                              "model.storage.auth.server.protocol === 'MYPROXY' || " +
                              "model.storage.auth.server.protocol === 'MPG' || " +
                              "model.storage.auth.type === 'PAM' || " +
                              "model.storage.auth.type === 'ANONYMOUS'",
                            "items": [
                              {
                                 "type": "template",
                                 "template":
                                 '<div class="form-group ">'+
                                   '<label class="control-label">&nbsp;</label>'+
                                   '<div class="form-control" style="border:transparent; padding-left:0px; padding-right:0px;">'+
                                     '<i class="fa fa-question-circle fa-lg" popover-placement="right" popover-trigger="mouseenter" uib-popover="The password on the remote system used to authenticate"></i>'+
                                   '</div>'+
                                   '<div class="help-block"></div>'+
                                 '</div>',
                              }
                            ]
                          },

                          // STORAGE.storage.auth.credential
                          // {
                          //     "type": "section",
                          //     "htmlClass": "col-xs-8",
                          //     "condition": "model.storage.auth.credentialType === 'credential'",
                          //     "items": [
                          //       {
                          //           "key": "storage.auth.credential",
                          //           validationMessage: {
                          //               'required': 'Missing required',
                          //           },
                          //           $validators: {
                          //               required: function(value) {
                          //                   return value ? true : false;
                          //               },
                          //           }
                          //       }
                          //     ]
                          // },
                          // {
                          //    "type": "section",
                          //    "htmlClass": "col-xs-4",
                          //    "condition": "model.storage.auth.credentialType === 'credential'",
                          //    "items": [
                          //      {
                          //         "type": "template",
                          //         "template":
                          //
                          //         '<div class="form-group ">'+
                          //           '<label class="control-label">&nbsp;</label>'+
                          //           '<div class="form-control" style="border:transparent; padding-left:0px; padding-right:0px;">'+
                          //             '<i class="fa fa-question-circle fa-lg" popover-placement="right" popover-trigger="mouseenter" uib-popover="Some useful information"></i>'+
                          //           '</div>'+
                          //           '<div class="help-block"></div>'+
                          //         '</div>',
                          //      }
                          //    ]
                          //  },

                          // STORAGE.storage.auth.credential
                          {
                            "type": "section",
                            "htmlClass": "col-xs-8",
                            "condition": "model.storage.auth.credentialType === 'credential'",
                            "items": [
                              {
                                  "key": "storage.auth.credential",
                                  "type": "textarea",
                              }
                            ]
                          },
                          {
                            "type": "section",
                            "htmlClass": "col-xs-2",
                            "condition": "model.storage.auth.credentialType === 'credential'",
                            "items": [
                              {
                                "type": "select",
                                "title": "Upload",
                                // "titleMap": $scope.getSystemsTitleMap(),
                                "titleMap": $scope.systemsTitleMap,
                                ngModelOptions: {
                                    updateOnDefault: true
                                },
                                onChange: function(systemId, formModel) {
                                  if (systemId === 'Local Disk'){

                                    $uibModal.open({
                                      templateUrl: "views/systems/filemanager-local.html",
                                      // resolve: {
                                      // },
                                      scope: $scope,
                                      size: 'lg',
                                      controller: ['$scope', '$modalInstance', function($scope, $modalInstance ) {

                                        $scope.fileUpload = function(element) {
                                          $scope.loading = true;

                                          $scope.$apply(function(scope) {
                                             var file = element.files[0];
                                             var reader = new FileReader();
                                             reader.onerror = function(e) {
                                                // TO-DO
                                             };

                                             reader.onloadend = function(e) {
                                               $scope.model.storage.auth.credential = e.target.result;
                                               $scope.loading = false;
                                             };
                                             reader.readAsText(file);
                                          });
                                        };

                                        $scope.cancel = function()
                                        {
                                            $modalInstance.dismiss('cancel');
                                        };

                                        $scope.upload = function(){
                                            $modalInstance.close();
                                        }

                                      }]
                                    });

                                  } else {
                                    SystemsController.getSystemDetails(systemId).then(
                                        function(sys) {
                                            if ($stateParams.path) {
                                                $scope.path = $stateParams.path;
                                            } else {
                                                $scope.path = $localStorage.activeProfile.username;
                                                $stateParams.path = $scope.path;
                                                // $location.path("/data/explorer/" + $stateParams.systemId + "/" + $scope.path);
                                            }
                                            $scope.system = sys;
                                            $rootScope.uploadFileContent = '';
                                            $uibModal.open({
                                              templateUrl: "views/systems/filemanager.html",
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
                                                      // $scope.model.storage = {'auth' : {'credential': ''}};
                                                      $scope.model.storage.auth.credential = uploadFileContent;
                                                      $scope.close();
                                                    }
                                                });
                                              }]
                                            });
                                        },
                                        function(msg) {
                                            $scope.path = $stateParams.path ? $stateParams.path : '';
                                            $scope.system = '';
                                        }
                                    );
                                  }
                                }
                              }
                            ]
                          },
                          {
                           "type": "section",
                           "htmlClass": "col-xs-2",
                           "condition": "model.storage.auth.credentialType === 'credential'",
                           "items": [
                             {
                                "type": "template",
                                "template":

                                '<div class="form-group ">'+
                                  '<label class="control-label">&nbsp;</label>'+
                                  '<div class="form-control" style="border:transparent; padding-left:0px; padding-right:0px;">'+
                                    '<i class="fa fa-question-circle fa-lg" popover-placement="right" popover-trigger="mouseenter" uib-popover="Copy and paste your credential or use the Upload File Manager"></i>'+
                                  '</div>'+
                                  '<div class="help-block"></div>'+
                                '</div>',
                             }
                           ]
                         },

                         // storage.auth.publicKey for SSHKEYS
                         {
                           "type": "section",
                           "htmlClass": "col-xs-8",
                           "condition":
                              "model.storage.auth.type === 'SSHKEYS'",
                           "items": [
                             {
                                 "key": "storage.auth.publicKey",
                                 "type": "textarea",
                             }
                           ]
                         },
                         {
                           "type": "section",
                           "htmlClass": "col-xs-2",
                           "condition":
                              "model.storage.auth.type === 'SSHKEYS'",
                           "items": [
                             {
                               "type": "select",
                               "title": "Upload",
                              "titleMap": $scope.systemsTitleMap,
                               ngModelOptions: {
                                   updateOnDefault: true
                               },
                               onChange: function(systemId, formModel) {
                                 if (systemId === 'Local Disk'){

                                   $uibModal.open({
                                     templateUrl: "views/systems/filemanager-local.html",
                                     // resolve: {
                                     // },
                                     scope: $scope,
                                     size: 'lg',
                                     controller: ['$scope', '$modalInstance', function($scope, $modalInstance ) {

                                       $scope.fileUpload = function(element) {
                                         $scope.loading = true;

                                         $scope.$apply(function(scope) {
                                            var file = element.files[0];
                                            var reader = new FileReader();
                                            reader.onerror = function(e) {
                                               // TO-DO
                                            };

                                            reader.onloadend = function(e) {
                                              $scope.model.storage.auth.publicKey = e.target.result;
                                              $scope.loading = false;
                                            };
                                            reader.readAsText(file);
                                         });
                                       };

                                       $scope.cancel = function()
                                       {
                                           $modalInstance.dismiss('cancel');
                                       };

                                       $scope.upload = function(){
                                           $modalInstance.close();
                                       }

                                     }]
                                   });

                                 } else {
                                   SystemsController.getSystemDetails(systemId).then(
                                       function(sys) {
                                           if ($stateParams.path) {
                                               $scope.path = $stateParams.path;
                                           } else {
                                               $scope.path = $localStorage.activeProfile.username;
                                               $stateParams.path = $scope.path;
                                               // $location.path("/data/explorer/" + $stateParams.systemId + "/" + $scope.path);
                                           }
                                           $scope.system = sys;
                                           $rootScope.uploadFileContent = '';
                                           $uibModal.open({
                                             templateUrl: "views/systems/filemanager.html",
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
                                                    //  $scope.model.storage = {'auth' : {'publicKey': ''}};
                                                     $scope.model.storage.auth.publicKey = uploadFileContent;
                                                     $scope.close();
                                                   }
                                               });
                                             }]
                                           });
                                       },
                                       function(msg) {
                                           $scope.path = $stateParams.path ? $stateParams.path : '';
                                           $scope.system = '';
                                       }
                                   );
                                 }
                               }
                             }
                           ]
                         },
                         {
                          "type": "section",
                          "htmlClass": "col-xs-2",
                          "condition":
                              "model.storage.auth.type === 'SSHKEYS'",
                              "items": [
                                {
                                   "type": "template",
                                   "template":

                                   '<div class="form-group ">'+
                                     '<label class="control-label">&nbsp;</label>'+
                                     '<div class="form-control" style="border:transparent; padding-left:0px; padding-right:0px;">'+
                                       '<i class="fa fa-question-circle fa-lg" popover-placement="right" popover-trigger="mouseenter" uib-popover="Copy and paste your publicKey or use the Upload File Manager"></i>'+
                                     '</div>'+
                                     '<div class="help-block"></div>'+
                                   '</div>',
                                }
                              ]
                          },

                          // storage.auth.privateKey for SSHKEYS
                          {
                            "type": "section",
                            "htmlClass": "col-xs-8",
                            "condition":
                               "model.storage.auth.type === 'SSHKEYS'",
                            "items": [
                              {
                                  "key": "storage.auth.privateKey",
                                  "type": "textarea",
                              }
                            ]
                          },
                          {
                            "type": "section",
                            "htmlClass": "col-xs-2",
                            "condition":
                               "model.storage.auth.type === 'SSHKEYS'",
                            "items": [
                              {
                                "type": "select",
                                "title": "Upload",
                                // "titleMap": $scope.getSystemsTitleMap(),
                                "titleMap": $scope.systemsTitleMap,
                                ngModelOptions: {
                                    updateOnDefault: true
                                },
                                onChange: function(systemId, formModel) {
                                  if (systemId === 'Local Disk'){

                                    $uibModal.open({
                                      templateUrl: "views/systems/filemanager-local.html",
                                      // resolve: {
                                      // },
                                      scope: $scope,
                                      size: 'lg',
                                      controller: ['$scope', '$modalInstance', function($scope, $modalInstance ) {

                                        $scope.fileUpload = function(element) {
                                          $scope.loading = true;

                                          $scope.$apply(function(scope) {
                                             var file = element.files[0];
                                             var reader = new FileReader();
                                             reader.onerror = function(e) {
                                                // TO-DO
                                             };

                                             reader.onloadend = function(e) {
                                               $scope.model.storage.auth.privateKey = e.target.result;
                                               $scope.loading = false;
                                             };
                                             reader.readAsText(file);
                                          });
                                        };

                                        $scope.cancel = function()
                                        {
                                            $modalInstance.dismiss('cancel');
                                        };

                                        $scope.upload = function(){
                                            $modalInstance.close();
                                        }

                                      }]
                                    });

                                  } else {
                                    SystemsController.getSystemDetails(systemId).then(
                                        function(sys) {
                                            if ($stateParams.path) {
                                                $scope.path = $stateParams.path;
                                            } else {
                                                $scope.path = $localStorage.activeProfile.username;
                                                $stateParams.path = $scope.path;
                                                // $location.path("/data/explorer/" + $stateParams.systemId + "/" + $scope.path);
                                            }
                                            $scope.system = sys;
                                            $rootScope.uploadFileContent = '';
                                            $uibModal.open({
                                              templateUrl: "views/systems/filemanager.html",
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
                                                      // $scope.model.storage = {'auth' : {'privateKey': ''}};
                                                      $scope.model.storage.auth.privateKey = uploadFileContent;
                                                      $scope.close();
                                                    }
                                                });
                                              }]
                                            });
                                        },
                                        function(msg) {
                                            $scope.path = $stateParams.path ? $stateParams.path : '';
                                            $scope.system = '';
                                        }
                                    );
                                  }
                                }
                              }
                            ]
                          },
                          {
                           "type": "section",
                           "htmlClass": "col-xs-2",
                           "condition":
                              "model.storage.auth.type === 'SSHKEYS'",
                           "items": [
                             {
                                "type": "template",
                                "template":

                                '<div class="form-group ">'+
                                  '<label class="control-label">&nbsp;</label>'+
                                  '<div class="form-control" style="border:transparent; padding-left:0px; padding-right:0px;">'+
                                    '<i class="fa fa-question-circle fa-lg" popover-placement="right" popover-trigger="mouseenter" uib-popover="Copy and paste your privateKey or use the Upload File Manager"></i>'+
                                  '</div>'+
                                  '<div class="help-block"></div>'+
                                '</div>',
                             }
                           ]
                         },

                         // storage.auth.publicKey for APIKEYS
                         {
                           "type": "section",
                           "htmlClass": "col-xs-8",
                           "condition":
                              "model.storage.auth.type === 'APIKEYS'",
                           "items": [
                             {
                                 "key": "storage.auth.publicKey",
                                 "type": "textarea",
                             }
                           ]
                         },
                        //  {
                        //    "type": "section",
                        //    "htmlClass": "col-xs-2",
                        //    "condition":
                        //       "model.storage.auth.type === 'APIKEYS'",
                        //    "items": [
                        //      {
                        //        "type": "select",
                        //        "title": "Upload",
                        //       "titleMap": $scope.systemsTitleMap,
                        //        ngModelOptions: {
                        //            updateOnDefault: true
                        //        },
                        //        onChange: function(systemId, formModel) {
                        //          if (systemId === 'Local Disk'){
                         //
                        //            $uibModal.open({
                        //              templateUrl: "views/systems/filemanager-local.html",
                        //              // resolve: {
                        //              // },
                        //              scope: $scope,
                        //              size: 'lg',
                        //              controller: ['$scope', '$modalInstance', function($scope, $modalInstance ) {
                         //
                        //                $scope.fileUpload = function(element) {
                        //                  $scope.loading = true;
                         //
                        //                  $scope.$apply(function(scope) {
                        //                     var file = element.files[0];
                        //                     var reader = new FileReader();
                        //                     reader.onerror = function(e) {
                        //                        // TO-DO
                        //                     };
                         //
                        //                     reader.onloadend = function(e) {
                        //                       $scope.model.storage.auth.publicKey = e.target.result;
                        //                       $scope.loading = false;
                        //                     };
                        //                     reader.readAsText(file);
                        //                  });
                        //                };
                         //
                        //                $scope.cancel = function()
                        //                {
                        //                    $modalInstance.dismiss('cancel');
                        //                };
                         //
                        //                $scope.upload = function(){
                        //                    $modalInstance.close();
                        //                }
                         //
                        //              }]
                        //            });
                         //
                        //          } else {
                        //            SystemsController.getSystemDetails(systemId).then(
                        //                function(sys) {
                        //                    if ($stateParams.path) {
                        //                        $scope.path = $stateParams.path;
                        //                    } else {
                        //                        $scope.path = $localStorage.activeProfile.username;
                        //                        $stateParams.path = $scope.path;
                        //                        // $location.path("/data/explorer/" + $stateParams.systemId + "/" + $scope.path);
                        //                    }
                        //                    $scope.system = sys;
                        //                    $rootScope.uploadFileContent = '';
                        //                    $uibModal.open({
                        //                      templateUrl: "views/systems/filemanager.html",
                        //                      // resolve: {
                        //                      // },
                        //                      scope: $scope,
                        //                      size: 'lg',
                        //                      controller: ['$scope', '$modalInstance', function($scope, $modalInstance ) {
                        //                        $scope.cancel = function()
                        //                        {
                        //                            $modalInstance.dismiss('cancel');
                        //                        };
                         //
                        //                        $scope.close = function(){
                        //                            $modalInstance.close();
                        //                        }
                         //
                        //                        $scope.$watch('uploadFileContent', function(uploadFileContent){
                        //                            if (typeof uploadFileContent !== 'undefined' && uploadFileContent !== ''){
                        //                             //  $scope.model.storage = {'auth' : {'publicKey': ''}};
                        //                              $scope.model.storage.auth.publicKey = uploadFileContent;
                        //                              $scope.close();
                        //                            }
                        //                        });
                        //                      }]
                        //                    });
                        //                },
                        //                function(msg) {
                        //                    $scope.path = $stateParams.path ? $stateParams.path : '';
                        //                    $scope.system = '';
                        //                }
                        //            );
                        //          }
                        //        }
                        //      }
                        //    ]
                        //  },
                         {
                          "type": "section",
                          "htmlClass": "col-xs-2",
                          "condition":
                              "model.storage.auth.type === 'APIKEYS'",
                              "items": [
                                {
                                   "type": "template",
                                   "template":

                                   '<div class="form-group ">'+
                                     '<label class="control-label">&nbsp;</label>'+
                                     '<div class="form-control" style="border:transparent; padding-left:0px; padding-right:0px;">'+
                                       '<i class="fa fa-question-circle fa-lg" popover-placement="right" popover-trigger="mouseenter" uib-popover="Copy and paste your publicKey"></i>'+
                                     '</div>'+
                                     '<div class="help-block"></div>'+
                                   '</div>',
                                }
                              ]
                          },

                          // storage.auth.privateKey for APIKEYS
                          {
                            "type": "section",
                            "htmlClass": "col-xs-8",
                            "condition":
                               "model.storage.auth.type === 'APIKEYS'",
                            "items": [
                              {
                                  "key": "storage.auth.privateKey",
                                  "type": "textarea",
                              }
                            ]
                          },
                          // {
                          //   "type": "section",
                          //   "htmlClass": "col-xs-2",
                          //   "condition":
                          //      "model.storage.auth.type === 'APIKEYS'",
                          //   "items": [
                          //     {
                          //       "type": "select",
                          //       "title": "Upload",
                          //       // "titleMap": $scope.getSystemsTitleMap(),
                          //       "titleMap": $scope.systemsTitleMap,
                          //       ngModelOptions: {
                          //           updateOnDefault: true
                          //       },
                          //       onChange: function(systemId, formModel) {
                          //         if (systemId === 'Local Disk'){
                          //
                          //           $uibModal.open({
                          //             templateUrl: "views/systems/filemanager-local.html",
                          //             // resolve: {
                          //             // },
                          //             scope: $scope,
                          //             size: 'lg',
                          //             controller: ['$scope', '$modalInstance', function($scope, $modalInstance ) {
                          //
                          //               $scope.fileUpload = function(element) {
                          //                 $scope.loading = true;
                          //
                          //                 $scope.$apply(function(scope) {
                          //                    var file = element.files[0];
                          //                    var reader = new FileReader();
                          //                    reader.onerror = function(e) {
                          //                       // TO-DO
                          //                    };
                          //
                          //                    reader.onloadend = function(e) {
                          //                      $scope.model.storage.auth.privateKey = e.target.result;
                          //                      $scope.loading = false;
                          //                    };
                          //                    reader.readAsText(file);
                          //                 });
                          //               };
                          //
                          //               $scope.cancel = function()
                          //               {
                          //                   $modalInstance.dismiss('cancel');
                          //               };
                          //
                          //               $scope.upload = function(){
                          //                   $modalInstance.close();
                          //               }
                          //
                          //             }]
                          //           });
                          //
                          //         } else {
                          //           SystemsController.getSystemDetails(systemId).then(
                          //               function(sys) {
                          //                   if ($stateParams.path) {
                          //                       $scope.path = $stateParams.path;
                          //                   } else {
                          //                       $scope.path = $localStorage.activeProfile.username;
                          //                       $stateParams.path = $scope.path;
                          //                       // $location.path("/data/explorer/" + $stateParams.systemId + "/" + $scope.path);
                          //                   }
                          //                   $scope.system = sys;
                          //                   $rootScope.uploadFileContent = '';
                          //                   $uibModal.open({
                          //                     templateUrl: "views/systems/filemanager.html",
                          //                     // resolve: {
                          //                     // },
                          //                     scope: $scope,
                          //                     size: 'lg',
                          //                     controller: ['$scope', '$modalInstance', function($scope, $modalInstance ) {
                          //                       $scope.cancel = function()
                          //                       {
                          //                           $modalInstance.dismiss('cancel');
                          //                       };
                          //
                          //                       $scope.close = function(){
                          //                           $modalInstance.close();
                          //                       }
                          //
                          //                       $scope.$watch('uploadFileContent', function(uploadFileContent){
                          //                           if (typeof uploadFileContent !== 'undefined' && uploadFileContent !== ''){
                          //                             // $scope.model.storage = {'auth' : {'privateKey': ''}};
                          //                             $scope.model.storage.auth.privateKey = uploadFileContent;
                          //                             $scope.close();
                          //                           }
                          //                       });
                          //                     }]
                          //                   });
                          //               },
                          //               function(msg) {
                          //                   $scope.path = $stateParams.path ? $stateParams.path : '';
                          //                   $scope.system = '';
                          //               }
                          //           );
                          //         }
                          //       }
                          //     }
                          //   ]
                          // },
                          {
                           "type": "section",
                           "htmlClass": "col-xs-2",
                           "condition":
                              "model.storage.auth.type === 'APIKEYS'",
                           "items": [
                             {
                                "type": "template",
                                "template":

                                '<div class="form-group ">'+
                                  '<label class="control-label">&nbsp;</label>'+
                                  '<div class="form-control" style="border:transparent; padding-left:0px; padding-right:0px;">'+
                                    '<i class="fa fa-question-circle fa-lg" popover-placement="right" popover-trigger="mouseenter" uib-popover="Copy and paste your privateKey"></i>'+
                                  '</div>'+
                                  '<div class="help-block"></div>'+
                                '</div>',
                             }
                           ]
                          },


                      ]
                    },
                    // end STORAGE.storage.auth

                    // STORAGE.auth.server
                    {
                      "key": "storage.auth.server",
                      "condition": "model.storage.auth.credentialType && model.storage.auth.credentialType === 'server'",
                      "items": [

                        // Ask for auth.server.protocol, this will determine some fields in storage.auth such as username
                        // STORAGE.storage.auth.server.protocol
                        {
                         "type": "section",
                           "htmlClass": "col-xs-8",
                           "condition": "model.storage.auth.credentialType === 'server'",
                           "items": [
                             {
                                   "key": "storage.auth.server.protocol",
                                   ngModelOptions: {
                                       updateOnDefault: true
                                   },
                                   validationMessage: {
                                     'required': 'Missing required'
                                   },
                                   $validators: {
                                     required: function(value) {
                                       return value ? true : false;
                                     }
                                   }
                             }
                           ]
                        },
                        {
                          "type": "section",
                          "htmlClass": "col-xs-4",
                          "condition": "model.storage.auth.credentialType === 'server'",
                          "items": [
                            {
                               "type": "template",
                               "template":
                               '<div class="form-group ">'+
                                 '<label class="control-label">&nbsp;</label>'+
                                 '<div class="form-control" style="border:transparent; padding-left:0px; padding-right:0px;">'+
                                   '<i class="fa fa-question-circle fa-lg" popover-placement="right" popover-trigger="mouseenter" uib-popover="The protocol used to authenticate to the storage server"></i>'+
                                 '</div>'+
                                 '<div class="help-block"></div>'+
                               '</div>',
                            }
                          ]
                        },

                       // STORAGE.storage.auth.server.name
                       {
                         "type": "section",
                           "htmlClass": "col-xs-8",
                           "condition": "model.storage.auth.credentialType === 'server'",
                           "items": [
                             {
                                 "key": "storage.auth.server.name"
                             }
                           ]
                       },
                       {
                          "type": "section",
                          "htmlClass": "col-xs-4",
                          "condition": "model.storage.auth.credentialType === 'server'",
                          "items": [
                            {
                               "type": "template",
                               "template":
                               '<div class="form-group ">'+
                                 '<label class="control-label">&nbsp;</label>'+
                                 '<div class="form-control" style="border:transparent; padding-left:0px; padding-right:0px;">'+
                                   '<i class="fa fa-question-circle fa-lg" popover-placement="right" popover-trigger="mouseenter" uib-popover="A descriptive name given to the credential server"></i>'+
                                 '</div>'+
                                 '<div class="help-block"></div>'+
                               '</div>',
                            }
                          ]
                        },

                        // STORAGE.storage.auth.server.endpoint
                        {
                          "type": "section",
                            "htmlClass": "col-xs-8",
                            "condition": "model.storage.auth.credentialType === 'server'",
                            "items": [
                              {
                                  "key": "storage.auth.server.endpoint",
                                  ngModelOptions: {
                                      updateOnDefault: true
                                  },
                                  validationMessage: {
                                    'required': 'Missing required'
                                  },
                                  $validators: {
                                    required: function(value) {
                                      return value ? true : false;
                                    }
                                  }
                              }
                            ]
                        },
                        {
                           "type": "section",
                           "htmlClass": "col-xs-4",
                           "condition": "model.storage.auth.credentialType === 'server'",
                           "items": [
                             {
                                "type": "template",
                                "template":
                                '<div class="form-group ">'+
                                  '<label class="control-label">&nbsp;</label>'+
                                  '<div class="form-control" style="border:transparent; padding-left:0px; padding-right:0px;">'+
                                    '<i class="fa fa-question-circle fa-lg" popover-placement="right" popover-trigger="mouseenter" uib-popover="The endpoint of the authentication server"></i>'+
                                  '</div>'+
                                  '<div class="help-block"></div>'+
                                '</div>',
                             }
                           ]
                         },

                         // STORAGE.storage.auth.server.port
                         {
                           "type": "section",
                             "htmlClass": "col-xs-8",
                             "condition": "model.storage.auth.credentialType === 'server'",
                             "items": [
                               {
                                   "key": "storage.auth.server.port",
                                   ngModelOptions: {
                                       updateOnDefault: true
                                   },
                                   validationMessage: {
                                     'required': 'Missing required'
                                   },
                                   $validators: {
                                     required: function(value) {
                                       return value ? true : false;
                                     }
                                   }
                               }
                             ]
                         },
                         {
                            "type": "section",
                            "htmlClass": "col-xs-4",
                            "condition": "model.storage.auth.credentialType === 'server'",
                            "items": [
                              {
                                 "type": "template",
                                 "template":
                                 '<div class="form-group ">'+
                                   '<label class="control-label">&nbsp;</label>'+
                                   '<div class="form-control" style="border:transparent; padding-left:0px; padding-right:0px;">'+
                                     '<i class="fa fa-question-circle fa-lg" popover-placement="right" popover-trigger="mouseenter" uib-popover="The port number of the storage server"></i>'+
                                   '</div>'+
                                   '<div class="help-block"></div>'+
                                 '</div>',
                              }
                            ]
                          },
                       ]
                   },
                  // end STORAGE.auth.server

                  // STORAGE.storage.proxy
                  {
                    "key": "storage.proxy",
                    "condition": "model.storage.protocol === 'SFTP' && model.storage.proxyTunnel === 'YES'",
                    "items": [
                       // STORAGE.storage.proxy.name
                       {
                         "type": "section",
                           "htmlClass": "col-xs-8",
                           "items": [
                             {
                                 "key": "storage.proxy.name",
                                 ngModelOptions: {
                                     updateOnDefault: true
                                 },
                                 validationMessage: {
                                   'required': 'Missing required'
                                 },
                                 $validators: {
                                   required: function(value) {
                                     return value ? true : false;
                                   }
                                 }
                                //  onChange: function(value, model){
                                //    if (typeof $scope.model.storage.auth.server !== 'undefined' && value !== 'X509'){
                                //      delete $scope.model.storage.auth['server'];
                                //    }
                                //  },

                             }
                           ]
                       },
                       {
                          "type": "section",
                          "htmlClass": "col-xs-4",
                          "items": [
                            {
                               "type": "template",
                               "template":
                               '<div class="form-group ">'+
                                 '<label class="control-label">&nbsp;</label>'+
                                 '<div class="form-control" style="border:transparent; padding-left:0px; padding-right:0px;">'+
                                   '<i class="fa fa-question-circle fa-lg" popover-placement="right" popover-trigger="mouseenter" uib-popover=" A descriptive name given to the proxy server"></i>'+
                                 '</div>'+
                                 '<div class="help-block"></div>'+
                               '</div>',
                            }
                          ]
                        },

                        // STORAGE.storage.proxy.host
                        {
                          "type": "section",
                            "htmlClass": "col-xs-8",
                            "items": [
                              {
                                  "key": "storage.proxy.host",
                                  ngModelOptions: {
                                      updateOnDefault: true
                                  },
                                  validationMessage: {
                                    'required': 'Missing required'
                                  },
                                  $validators: {
                                    required: function(value) {
                                      return value ? true : false;
                                    }
                                  }
                                 //  onChange: function(value, model){
                                 //    if (typeof $scope.model.storage.auth.server !== 'undefined' && value !== 'X509'){
                                 //      delete $scope.model.storage.auth['server'];
                                 //    }
                                 //  },
                              }
                            ]
                        },
                        {
                           "type": "section",
                           "htmlClass": "col-xs-4",
                           "items": [
                             {
                                "type": "template",
                                "template":
                                '<div class="form-group ">'+
                                  '<label class="control-label">&nbsp;</label>'+
                                  '<div class="form-control" style="border:transparent; padding-left:0px; padding-right:0px;">'+
                                    '<i class="fa fa-question-circle fa-lg" popover-placement="right" popover-trigger="mouseenter" uib-popover="The hostname of the proxy server"></i>'+
                                  '</div>'+
                                  '<div class="help-block"></div>'+
                                '</div>',
                             }
                           ]
                         },

                         // STORAGE.storage.proxy.port
                         {
                           "type": "section",
                             "htmlClass": "col-xs-8",
                             "items": [
                               {
                                   "key": "storage.proxy.port",
                                   ngModelOptions: {
                                       updateOnDefault: true
                                   },
                                   validationMessage: {
                                     'required': 'Missing required'
                                   },
                                   $validators: {
                                     required: function(value) {
                                       return value ? true : false;
                                     }
                                   }
                               }
                             ]
                         },
                         {
                            "type": "section",
                            "htmlClass": "col-xs-4",
                            "items": [
                              {
                                 "type": "template",
                                 "template":
                                 '<div class="form-group ">'+
                                   '<label class="control-label">&nbsp;</label>'+
                                   '<div class="form-control" style="border:transparent; padding-left:0px; padding-right:0px;">'+
                                     '<i class="fa fa-question-circle fa-lg" popover-placement="right" popover-trigger="mouseenter" uib-popover=" The port on which to connect to the proxy server. If null, the port in the parent storage config is used"></i>'+
                                   '</div>'+
                                   '<div class="help-block"></div>'+
                                 '</div>',
                              }
                            ]
                          }
                      ]
                    }

                  // end STORAGE.storage.proxy

                   /********** STORAGE.auth.server ************/

                   /********** STORAGE ******************/

                    /************* CONNECTIVITY TAB ***********/
            ]
          }
        ]
    }];


    $scope.model = {
    };

    $scope.prettyModel = '{}';

    $scope.systems = {
        execution: [],
        storage: []
    }

    $scope.defaultSystems = {
        execution: null,
        storage: null
    }

    $scope.currentTabIndex = 0;
    $scope.codeview = false;
    // $scope.wizview = 'split';


    $scope.fetchSystem = function(){
      $scope.edit = true;

      if (typeof $localStorage.activeProfile !== 'undefined'){
        SystemsController.getSystemRole($stateParams.systemId, $localStorage.activeProfile.username)
          .then(function(response){
            if (response.role !== "OWNER"){
              App.alert({type: 'danger',message: 'Missing credentials to edit system'});
              $scope.wizview = 'code';
              $scope.edit= false;
            }
          })
          .catch(function(response) {
            App.alert({type: 'danger',message: 'Missing credentials to edit system'});
            $scope.wizview = 'code';
            $scope.edit= false;
          });

        SystemsController.getSystemDetails($stateParams.systemId)
          .then(function(response){
            // Clean unwanted attributes for model
            if (response.lastModified){
              delete response.lastModified
            }
            if (response.revision){
              delete response.revision;
            }
            if (response.uuid){
              delete response.uuid;
            }
            if (response.getContext){
              delete response.getContext;
            }
            if (response._links){
              delete response._links;
            }
            // if (response.login){
            //   delete response.login;
            // }
            // if (response.storage){
            //   delete response.storage;
            // }
            $scope.model = response;
          })
          .catch(function(response) {
            var message = (response.errorResponse !== '') ?  "There was an error editing your system:\n" + response.errorResponse.fault.message : message = "There was an error editing your system:\n" + response.errorMessage;
            App.alert({type: 'danger',message: message});
            $scope.edit = false;
          });
      } else {
        App.alert({type: 'danger',message: 'There was an error editing your system: Missing credentials'});
        $scope.wizview = null;
        $scope.edit = false;
      }
    };

    $scope.fetchSystems = function() {
        $scope.systems = [];
        SystemsController.listSystems()
          .then(function(response){
            $scope.systems = response;
          })
          .catch(function(response) {
            $scope.systems = [];
          });
    };

    $scope.init = function() {
        $scope.wizview = 'split';
        $scope.fetchSystem();
        $scope.fetchSystems();
        WizardHandler.activateTab($scope, $scope.currentTabIndex);
    };

    $scope.init();

    $scope.useDefinition = function(){
      // Save model in service and re-direct to builder wizard
      WizardHandler.model = $scope.model;
      $location.path('/systems/new');
    };

    $scope.submit = function() {
        $scope.$broadcast('schemaFormValidate');
        if ($scope.myForm.$valid) {
          if ($scope.model.type === "STORAGE"){
            SystemsController.updateSystem(JSON.stringify($scope.model), $stateParams.systemId)
              .then(
                function (response) {
                    $uibModal.open({
                      templateUrl: "views/systems/edit-success.html",
                      scope: $scope,
                      size: 'lg',
                      controller: ['$scope', '$modalInstance', function($scope, $modalInstance ) {
                        $scope.close = function()
                        {
                            $modalInstance.dismiss('cancel');
                        };
                        $scope.browse = function(){
                            $location.path('/systems');
                        }
                      }]
                    });
                },
                function (response) {
                    var message = (response.errorResponse !== '') ?  "There was an error editing your system:\n" + response.errorResponse.fault.message : message = "There was an error editing your system:\n" + response.errorMessage;

                    App.alert({
                        type: 'danger',
                        message: message
                    });
              });
          }
          if ($scope.model.type === "EXECUTION"){
            SystemsController.updateSystem(JSON.stringify($scope.model), $stateParams.systemId)
              .then(
                function (response) {
                  $uibModal.open({
                    templateUrl: "views/systems/submit-success.html",
                    scope: $scope,
                    size: 'lg',
                    controller: ['$scope', '$modalInstance', function($scope, $modalInstance ) {
                      $scope.close = function()
                      {
                          $modalInstance.dismiss('cancel');
                      };
                      $scope.browse = function(){
                          $location.path('/systems');
                      }
                    }]
                  });
                },
                function (response) {
                  var message = (response.errorResponse !== '') ?  "There was an error editing your system:\n" + response.errorResponse.fault.message : message = "There was an error editing your system:\n" + response.errorMessage;

                  App.alert({
                      type: 'danger',
                      message: message
                  });
              });
          }
        } else {
          App.alert({
              type: 'danger',
              message: "There was an error editing your system: Form is not valid. Please verify all fields."
          });
        }

    };

    $scope.nextStep = function() {
        WizardHandler.validateTab($scope, $scope.currentTabIndex).then(function(value) {
            WizardHandler.activateTab($scope, ++$scope.currentTabIndex);
        });
    };

    $scope.previousStep = function() {
        WizardHandler.activateTab($scope, --$scope.currentTabIndex);
    };


    $scope.$watch('model', function(currentModel) {
        if (currentModel) {
          $scope.prettyModel = JSON.stringify(currentModel, undefined, 2);
        }
    }, true);

    $scope.$watch('model.environment', function(newValue, oldValue){
      if (newValue === null){
        $scope.model.environment = '';
      }
    });

    $scope.$watch('model.type', function(newValue, oldValue) {
      if (oldValue === "EXECUTION" && newValue === "STORAGE"){
        delete $scope.model.login;
      }

      // if (oldValue === "STORAGE" && newValue === "EXECUTION"){
      // }
    }, true);

    $scope.$watch('model.storage.auth.server', function(newValue, oldValue){
      if (newValue){
        $scope.model.storage.auth.credentialType = 'server';
      }
    });

    $scope.$watch('model.storage.auth.credential', function(newValue, oldValue){
      if (newValue){
        $scope.model.storage.auth.credentialType = 'credential';
      }
    });

    // Watch protocol. reset if default SFTP/default changes
    $scope.$watch('model.storage.protocol', function(newValue, oldValue) {
      // always set defaul proxyTunnel to NO
      if (newValue === 'SFTP'){
        $scope.model.storage.proxyTunnel = "NO";
      }

      if (typeof newValue !== 'undefined' && typeof oldValue !== 'undefined'){
          $scope.model.storage[oldValue] = undefined;
      }
    }, true);

    // Watch login.protocol. reset if default SFTP/default changes
    $scope.$watch('model.login.protocol', function(newValue, oldValue) {
      // always set defaul proxyTunnel to NO
      if (newValue === 'SSH'){
        $scope.model.login.proxyTunnel = "NO";
      }
    }, true);


    $scope.updateWizardLayout = function() {
        // console.log($scope.wizview);
    };

    $scope.codemirrorLoaded = function(_editor) {
        // Events
        _editor.on("change", function () {
            $timeout(function() {
                if (_editor.getValue() === ''){
                  $scope.model = '';
                } else {
                  try {
                    $scope.model = JSON.parse(_editor.getValue());
                  } catch(error) {
                    App.alert({
                        type: 'danger',
                        message: error
                    });
                  }

                }
            }, 0);
        });
        _editor.on("blur", function () {
            // if (_editor.hasFocus()) {
            //     $scope.model = JSON.parse(_editor.getValue());
            // }
            $timeout(function() {
                if (_editor.getValue() === ''){
                  $scope.model = '';
                } else {
                  try {
                    $scope.model = JSON.parse(_editor.getValue());
                  } catch(error) {
                    App.alert({
                        type: 'danger',
                        message: error
                    });
                  }

                }
            }, 0);
        });
    };


    // CodeMirror editor support
    $scope.editorConfig = {
        lineWrapping : true,
        lineNumbers: true,
        matchBrackets: true,
        styleActiveLine: false,
        theme:'neat',
        mode: 'javascript',
        json: true,
        statementIndent: 2,
        onLoad: $scope.codemirrorLoaded
    };
});
