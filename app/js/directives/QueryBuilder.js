// var queryBuilder = angular.module('queryBuilder', []);
AgaveToGo.directive('queryBuilder', ['$compile', function ($compile) {
    return {
        restrict: 'E',
        scope: {
            resource: '=',
            group: '='
        },
        templateUrl: 'tpl/directives/queryBuilderDirective.html',
        compile: function (element, attrs) {
            var content, directive;
            content = element.contents().remove();
            return function (scope, element, attrs) {

                scope.operators = [
                    { name: '&' },
                    // { name: 'OR' }
                ];

                switch(attrs.resource){
                  case 'apps':
                    scope.fields = [
                      {name: 'available'},                    // Whether the app is available. Boolean, default true
                      {name: 'checkpointable'},               // Whether the app is checkpointable
                      {name: 'checksum'},                     // The checksum of the public app deployment assets.
                      {name: 'created'},                      // The timestamp when the app was first registered. Results are rounded by day. You may specify using YYYY-MM-DD format or free form timeframes such as 'yesterday' or '3 days ago'.
                      {name: 'defaultmaxruntime'},            // The max run time for job requests utilizing this app.
                      {name: 'defaultmemorypernode'},         // The default memory request for job requests utilizing this app.
                      {name: 'defaultnodes'},                 // The default number of nodes requested for job requests utilizing this app.
                      {name: 'defaultprocessorspernode'},     // The default processors per node request for job requests utilizing this app.
                      {name: 'defaultqueue'},                 // The default executionSystem queue for job requests utilizing this app.
                      {name: 'deploymentpath'},               // The deployment path on the storageSystem where the app assets reside.
                      {name: 'executionsystem'},              // The id of the system where the app will run.
                      {name: 'executiontype'},                // The execution type of the app. One of HPC, CLI, CONDOR.
                      {name: 'helpuri'},                      // The URL to the help documentation for this app.
                      {name: 'icon'},                         // The icon associated with this app.
                      {name: 'id'},                           // The unique id of the app defined by <name>-<version>
                      {name: 'inputs.id'},                    // The id of one or more input definitions for the app
                      {name: 'label'},                        // The display label for the app.
                      {name: 'lastupdated'},                  // The timestamp of the last time the app was updated. Results are rounded by day. You may specify using YYYY-MM-DD format or free form timeframes such as 'yesterday' or '3 days ago'.
                      {name: 'longdescription'},              // The full description of the app.
                      {name: 'modules'},                      // The list of modules used by this app. Do not use equality operators with this search term.
                      {name: 'name'},                         // The name of the app
                      {name: 'ontology'},                     // The list of ontological terms used by this app. Do not use equality operators with this search term.
                      {name: 'outputs.id'},                   // The id of one or more output definitions for the app
                      {name: 'owner'},                        // The owner of the app.
                      {name: 'parallelism'},                  // The parallelism type of the app: One of PARALLEL, PTHREAD, SERIAL
                      {name: 'parameters.id'},                // The id of one or more parameter definitions for the app
                      {name: 'parameters.type'},              // The type of one or more parameter definitions for the app
                      {name: 'public'},                       // Whether the app is publicly available for use.
                      {name: 'publiconly'},                   // Restricts to only public apps. Present for legacy support. This is equivalent to public=true
                      {name: 'privateonly'},                  // Restricts to only private apps. Present for legacy support. This is equivalent to public=false
                      {name: 'revision'},                     // The revision count of the app. This is the number of times the app definition has been udpated.
                      {name: 'shortdescription'},             // The short description of the app.
                      {name: 'storagesystem'},                // The id of the system where the app assets reside.
                      {name: 'tags'},                         // The list of ontological terms used by this app. Do not use equality operators with this search term.
                      {name: 'templatepath'},                 // The path of the wrapper template file relative to the app's deploymentPath.
                      {name: 'testpath'},                     // The path of the test wrapper template relative to the app's deploymentPath.
                      {name: 'uuid'},                         // The uuid of the app.
                      {name: 'version'}                       // The version of the app
                    ];
                    break;

                  case 'systems':
                    scope.fields = [
                      {name: 'available'},                      // Whether the system is available. Boolean, default true
                      {name: 'created'},                        // The timestamp when the system was first registered. Results are rounded by day. You may specify using YYYY-MM-DD format or free form timeframes such as 'yesterday' or '3 days ago'.
                      {name: 'default'},                        // Whether the system is the default system of its type for the user. Boolean, default false.
                      {name: 'description'},                    // The textual description of this system.
                      {name: 'globaldefault'},                  // Whether the system is the global default system of its type for the user. Boolean, default false.
                      {name: 'id'},                             // The unique id of this system.
                      {name: 'lastupdated'},                    // The timestamp of the last time the system was updated. Results are rounded by day. You may specify using YYYY-MM-DD format or free form timeframes such as 'yesterday' or '3 days ago'.
                      {name: 'name'},                           // The name of the system.
                      {name: 'owner'},                          // The username of the principal who originally registered the system.
                      {name: 'public'},                         // Whether the system is publicly available for use. Boolean, if true only public systems will be returned. If false, only private systems will be returned. If unset, both public and private will be returned. Default null.
                      {name: 'site'},                           // The site to which this system belongs.
                      {name: 'status'},                         // The status of the system. Possible values are: UP, DOWN, MAINTENANCE, UNKNOWN.
                      {name: 'storage.zone'},                   // For IRODS systems, the zone to which this storage system authenticates.
                      {name: 'storage.resource'},               // For IRODS systems, the resource to which the system storage configuration authenticates.
                      {name: 'storage.bucket'},                 // For cloud systems, the bucket to which the system storage configuration points.
                      {name: 'storage.host'},                   // The hostname or ip address to which the system storage configuration points.
                      {name: 'storage.port'},                   // The port used to connect to the remote system for storage operations.
                      {name: 'storage.homedir'},                // The home directory given by the system storage configuration.
                      {name: 'storage.rootdir'},                // The virutal root directory given by the system storage configuration.
                      {name: 'storage.protocol'},               // The protocol used to connect to the remote system for storage operations.
                      {name: 'storage.proxy.name'},             // The name of the server used for tunnel storage connections.
                      {name: 'storage.proxy.host'},             // The hostname or ip address of the server used for tunnel storage connections.
                      {name: 'storage.proxy.port'},             // The port of the server used for tunnel storage connections.
                      {name: 'type'},                           // The system type. Possible values are STORAGE and EXECUTION.
                      {name: 'login.host'},                     // The hostname or ip address to which the system login configuration points.
                      {name: 'login.port'},                     // The login port used to connect to the remote system.
                      {name: 'login.protocol'},                 // The login protocol used to connect to the remote system.
                      {name: 'login.proxy.name'},               // The name of the server used for tunnel login connections.
                      {name: 'login.proxy.host'},               // The hostname or ip address of the server used for tunnel login connections.
                      {name: 'login.proxy.port'},               // The port of the server used for tunnel login connections.
                      {name: 'workdir'},                        // The work directory used during job execution.
                      {name: 'scratchdir'},                     // The scratch directory used during job execution.
                      {name: 'maxsystemjobs'},                  // The maximum number of concurrent jobs allowed on the system.
                      {name: 'maxsystemjobsperuser'},           // The maximum number of concurrent jobs per user allowed on the system.
                      {name: 'startupscript'},                  // The startup script run prior to job execution.
                      {name: 'executiontype'},                  // The types of job execution supported on the system. Possible values are: CLI, HPC, CONDOR
                      {name: 'environment'},                    // Custom runtime environment variables set at runtime for job execution.
                      {name: 'scheduler'},                      // The scheduler used on the remote system. Possible values are: LSF, LOADLEVELER, PBS, SGE, CONDOR, FORK, COBALT, TORQUE, MOAB, SLURM, UNKNOWN
                      {name: 'queues.default'},                 // Whether a queue is the default system queue. This search term only makes sense when combined with another queue value such as queues.name.
                      {name: 'queues.customdirectives'},        // Custom directives given to the scheduler at runtime.
                      {name: 'queues.maxjobs'},                 // The maximum number of concurrent jobs allowed in a queue.
                      {name: 'queues.maxmemoryperjob'},         // The maximum memory allowed per job in a queue.
                      {name: 'queues.maxnodes'},                // The maximum number of nodes allowed per job in a queue.
                      {name: 'queues.maxprocessorspernode'},    // The maximum number of processors per node allowed in a queue.
                      {name: 'queues.maxuserjobs'},             // The maximum number of concurrent jobs per user allowed in a queue.
                      {name: 'queues.name'},                    // The name of the queue.
                      {name: 'uuid'},                           // The uuid of the system.
                    ];
                    break;
                  case 'jobs':
                    scope.fields = [
                      {name: 'appid'},                          // The id of the app run by the job.
                      {name: 'archive'},                        // Boolean flag stating whether the job output was archived.
                      {name: 'archivepath'},                    // Path on the archive system where the job output was archived if the archive flag was true.
                      {name: 'archivesystem'},                  // The id of the system where the job output was archived if the archive flag was true.
                      {name: 'batchqueue'},                     // The system queue in which the job ran.
                      {name: 'executionsystem'},                // The execution system where the job ran.
                      {name: 'id'},                             // The id of the job.
                      {name: 'inputs'},                         // The job inputs. Note, this is currently a full text match.
                      {name: 'localid'},                        // The local job id of the job on the execution system.
                      {name: 'maxruntime'},                     // The maximum run time of the job in HH:mm:ss format.
                      {name: 'memorypernode'},                  // The memory requested by the job specified in GB.
                      {name: 'name'},                           // The name of the job.
                      {name: 'nodecount'},                      // The number of nodes requested for the job.
                      {name: 'outputpath'},                     // The remote work directory path of the job.
                      {name: 'parameters'},                     // The job parameters. Note, this is currently a full text match.
                      {name: 'processorspernode'},              // The number of processors per node requested by the job.
                      {name: 'retries'},                        // The number of retry attempts made on this job.
                      {name: 'starttime'},                      // The date the job began running. Results are rounded by day. You may specify using YYYY-MM-DD format or free form timeframes such as 'yesterday' or '3 days ago'.
                      {name: 'status'},                         // The job status.
                      {name: 'submittime'},                     // The date the job was submitted to the remote execution system to run. Results are rounded by day. You may specify using YYYY-MM-DD format or free form timeframes such as 'yesterday' or '3 days ago'.
                      {name: 'visible'}                         // Boolean flag indicating whether or not to show deleted jobs. Defaults to false.
                    ];
                    break;
                  case 'monitors':
                    scope.fields = [
                      {name: 'id'},
                      {name: 'target'},
                      {name: 'active'},
                      {name: 'interval'},
                      {name: 'updateSystemStatus'}
                    ];
                    break;
                  case 'monitors-checks':
                    scope.fields = [
                      {name: 'id'},
                      {name: 'type'},
                      {name: 'result'},
                      {name: 'message'}
                    ];
                    break;
                  case 'notifications':
                    scope.fields = [
                      {name: 'available'},                     // Whether the notification is available. Boolean, default true
                      {name: 'created'},                       // The timestamp when the notification was first registered. Results are rounded by day. You may specify using YYYY-MM-DD format or free form timeframes such as 'yesterday' or '3 days ago'.
                      {name: 'associatedUuid'},                // The uuid of an Agave resource for which this notification will fire. Boolean, default false.
                      {name: 'event'},                         // The name of the event for which the notification will fire.
                      {name: 'id'},                            // The unique id of a notification.
                      {name: 'lastsent'},                      // The timestamp of the last time an attempt was made for this notification.
                      {name: 'lastupdated'},                   // The timestamp of the last time the notification was updated. Results are rounded by minute. You may specify using YYYY-MM-DD format or free form timeframes such as 'yesterday' or '3 days ago'.
                      {name: 'owner'},                         // The username of the principal who originally registered the system.
                      {name: 'persistent'},                    // Whether the system is publicly available for use. Boolean, if true only public systems will be returned. If false, only private systems will be returned. If unset, both public and private will be returned. Default null.
                      {name: 'status'},                        // The status of the system. Possible values are: ACTIVE, INACTIVE, FAILED, UNKNOWN.
                      {name: 'success'},                       // Whether the notification has been a success. Booelan, default true
                      {name: 'url'}                            // The callback url to which deliveries should be made.
                    ];
                    break;
                }

                scope.conditions = [
                    {name: '.eq='},
                    {name: '.on='},
                    {name: '.neq='},
                    {name: '.it='},
                    {name: '.before='},
                    {name: '.lte='},
                    {name: '.gt='},
                    {name: '.after='},
                    {name: '.gte='},
                    {name: '.in='},
                    {name: '.nin='},
                    {name: '.like='},
                    {name: '.nlike='},
                    {name: '.between='}
                ];

                scope.addCondition = function () {
                    scope.group.rules.push({
                        condition: '.eq=',
                        field: '',
                        data: ''
                    });
                };

                scope.addDefaultCondition = function () {
                  switch(attrs.resource){
                    case 'apps':
                      scope.group.rules.push({
                          condition: '.eq=',
                          field: 'available',
                          data: ''
                      });
                      break;
                    case 'systems':
                      scope.group.rules.push({
                          condition: '.eq=',
                          field: 'available',
                          data: ''
                      });
                      break;
                    case 'jobs':
                      scope.group.rules.push({
                          condition: '.eq=',
                          field: 'appid',
                          data: ''
                      });
                      break;
                    case 'monitors':
                      scope.group.rules.push({
                          condition: '.eq=',
                          field: 'id',
                          data: ''
                      });
                      break;
                    case 'notifications':
                      scope.group.rules.push({
                          condition: '.eq=',
                          field: 'available',
                          data: ''
                      });
                      break;
                  }
                };

                scope.removeCondition = function (index) {
                    scope.group.rules.splice(index, 1);
                };

                scope.addGroup = function () {
                    scope.group.rules.push({
                        group: {
                            operator: '&',
                            rules: []
                        }
                    });
                };

                scope.removeGroup = function () {
                    "group" in scope.$parent && scope.$parent.group.rules.splice(scope.$parent.$index, 1);
                };

                // add default attribute
                scope.addDefaultCondition();

                directive || (directive = $compile(content));

                element.append(directive(scope, function ($compile) {
                    return $compile;
                }));
            }
        }
    }
}]);
