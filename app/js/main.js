/***
Agave ToGo AngularJS App Main Script
***/

/* Metronic App */
var AgaveToGo = angular.module("AgaveToGo", [
  'AgavePlatformScienceAPILib',
  'angular-cache',
  'angularMoment',
  'angularUtils.directives.dirPagination',
  'CommonsService',
  'checklist-model',
  'jsonFormatter',
  'JiraService',
  'ChangelogParserService',
  'ngCookies',
  'ngSanitize',
  'ngStorage',
  'ngMd5',
  'oc.lazyLoad',
  'pascalprecht.translate',
  'schemaForm',
  'schemaFormWizard',
  'TagsService',
  'timer',
  'toastr',
  'ui.bootstrap',
  'ui.router',
  'ui.select',
  'ui-leaflet',
  'ngIdle'
]).service('NotificationsService',['$rootScope', '$localStorage', 'MetaController', 'toastr', function($rootScope, $localStorage, MetaController, toastr){
    if (typeof $localStorage.tenant !== 'undefined' && typeof $localStorage.activeProfile !== 'undefined') {
      this.client = new Fpp.Client('https://9d1e23fc.fanoutcdn.com/fpp');
      this.channel = this.client.Channel($localStorage.tenant.code + '/' + $localStorage.activeProfile.username);
      this.channel.on('data', function (data) {
        var toastData = {};
        if (data.event === 'FORCED_EVENT'){
          toastData = 'FORCED_ EVENT - ' + data.source;
        } else {
          if ('app' in data.message){
            toastData = 'APP - ' + data.event;
          } else if ('file' in data.message){
            toastData = 'FILE - ' + data.event;
          } else if ('job' in data.message){
            toastData = 'JOB - ' + data.event;
          } else if ('system' in data.message){
            toastData = 'SYSTEM - ' + data.event;
          } else {
            toastData = data.event;
          }
        }

        // saving all notifications to metadata for now
        var metadata = {};
        metadata.name = 'notifications';
        metadata.value = data;
        MetaController.addMetadata(metadata)
          .then(
            function(response){
            },
            function(response){
              var message = '';
              if (response.errorResponse.message) {
                message = 'Error: Could not save notification - ' + response.errorResponse.message
              } else if (response.errorResponse.fault){
                message = 'Error: Could not save notifications - ' + response.errorResponse.fault.message;
              } else {
                message = 'Error: Could not save notifications';
              }
              App.alert(
                {
                  type: 'danger',
                  message: message
                }
              );
            }
          );
        toastr.info(toastData);
      });
    } else {
      App.alert(
        {
          type: 'danger',
          message: 'Error: Invalid Credentials'
        }
      );
    }

}]);

/* Configure ocLazyLoader(refer: https://github.com/ocombe/ocLazyLoad) */
AgaveToGo.config(['$ocLazyLoadProvider', function($ocLazyLoadProvider) {
    $ocLazyLoadProvider.config({
        debug: true,
        modules: [
        {
            name: "ui.codemirror",
            files: [
                "../bower_components/codemirror/lib/codemirror.css",
                "../bower_components/codemirror/theme/neo.css",
                "../bower_components/codemirror/lib/codemirror.js",
                "../bower_components/angular-ui-codemirror/ui-codemirror.min.js"
            ]
        }]
    });
}]);

AgaveToGo.config(function(toastrConfig) {
  angular.extend(toastrConfig, {
    allowHtml: false,
    autoDismiss: true,
    closeButton: true,
    maxOpened: 0,
    newestOnTop: true,
    positionClass: 'toast-top-right',
    preventDuplicates: false,
    preventOpenDuplicates: false,
    templates: {
      toast: 'directives/toast/toast.html',
      progressbar: 'directives/progressbar/progressbar.html'
    },
    timeOut: 5000
  });
});

AgaveToGo.config(function($locationProvider) {
    $locationProvider.html5Mode({
        enabled: false,
        //hashPrefix: '!',
        required: false
    });
});

AgaveToGo.config(function($translateProvider) {
  $translateProvider.translations('en', {
    error_apps_add: 'Error: Could not submit app',
    error_apps_details: 'Error: Could not retrieve app',
    error_apps_edit: 'Error: Could not edit app',
    error_apps_edit_permission: 'Error: User does not have permission to edit app',
    error_apps_files_select: 'Could not find a default system to browse files. Please specify a default system',
    error_apps_form: 'Error: Invalid form. Please check all fields',
    error_apps_permissions: 'Error: Could not retreive app permissions',
    error_apps_permissions_update: 'Error: Could not update app permissions',
    error_apps_search: 'Error: Could not retrieve apps',
    error_apps_template: 'Error: Could not retrieve app template',

    error_files_list: 'Error: Could not list files for the given system and path',

    error_jobs_create: 'Error: Could not submit job',
    error_jobs_details: 'Error: Could not retrieve job',
    error_jobs_list: 'Error: Could not retrieve jobs',

    error_metadata_create: 'Error: Could not submit metadata',
    error_metadata_details: 'Error: Could not retrieve metadata',
    error_metadata_list: 'Error: Could not retrieve metadata',

    error_metadataschemas_create: 'Error: Could not submit metadata',
    error_metadataschemas_details: 'Error: Could not retrieve metadata',
    error_metadataschemas_list: 'Error: Could not retrieve metadata',

    error_postits_create: 'Error: Could not submit postit',
    error_postits_details: 'Error: Could not retrieve postit data',
    error_postits_list: 'Error: Could not retrieve postit data',

    error_monitors_add: 'Error: Could not add monitor',
    error_monitors_list: 'Error: Could not retrieve monitor',
    error_monitors_search: 'Error: Could not retrieve monitors',
    error_monitors_test: 'Error: Could not test monitor',
    error_monitors_update: 'Error: Could not update monitor',

    error_monitors_checks_id: 'Error: Please provide a monitor id',
    error_monitors_checks_search: 'Error: could not retrieve monitor checks',

    error_notifications_add: 'Error: Could not add notification',
    error_notifications_alerts: 'Error: Could not retrieve notification alerts',
    error_notifications_list: 'Error: Could not retrieve notification',
    error_notifications_search: 'Error: Could not retrieve notifications',
    error_notifications_test: 'Error: Could not test notification',
    error_notifications_update: 'Error: Could not update notification',

    error_profiles_list: 'Error: Could not retrieve profile',

    error_systems_add: 'Error: Could not create system',
    error_systems_default: 'Error: Could not set default system',
    error_systems_edit: 'Error: Could not edit system',
    error_systems_edit_permission: 'Error: User does not have permission to edit system',
    error_systems_form: 'Error: Invalid form. Please check all fields',
    error_systems_list: 'Error: Could not retrieve system',
    error_systems_roles: 'Error: Could not retrieve roles',
    error_systems_roles_update: 'Error: Could not update roles',
    error_systems_search: 'Error: Could not retrieve systems',
    error_systems_template: 'Error: Could not retrieve system template',

    error_metadata_update_assocation: 'Error: could not update Metadata associations',
    error_metadata_add_assocation: 'Error: could not add file/Metadata associations',
    error_metadata_add_assocation_exists: 'Error: file is already associated with Metadata object',
    error_metadata_update_assocation_exists: 'Error: file is already associated with Metadata object',
    error_metadata_update: 'Error: Could not update Metadata',
    error_metadata_add: 'Error: Could not create Metadata object',
    error_metadata_remove: 'Error: could not remove Metadata associations',


    error_metadataschemas_get: 'Error, Could not fetch Metadata Schemas',

    success_apps_permissions_update: 'Success: updated permissions for ',

    success_files_permissions_update: 'Success updating file permissions',

    success_monitors_test: 'Success: fired monitor ',
    success_monitors_update: 'Success: updated ',

    success_notifications_add: 'Success: added ',
    success_notifications_test: 'Success: fired notification ',
    success_notifications_update: 'Success: updated ',

    success_systems_roles: 'Success: updated roles for ',

    success_metadata_update_assocation: 'Success: updated Metadata associations',
    success_metadata_add_assocation: 'Success: added Metadata associations ',
    success_metadata_update: 'Success: updated Metadata',
    success_metadata_add: 'Success: new Metadata created',
    success_metadata_assocation_removed: 'Your file has been unassociated from the selected Metadata',

    setDefault: 'set to default',
    unsetDefault: 'unset default',

    creator: 'Authors of the data, data product, publication, collection, or software, in authorship order for citation.',
    title: 'A name for this resource, ideally unique but systematic. Filename is placed here by default but may be changed. Searchable.',
    publisher: 'Entity that holds, archives, publishes, releases, or produces the resource; for formal citation. For original ?Ike Wai resources this will usually be University of Hawai?i. For legacy or external records, check source and provenance.',
    publicationDate: 'The year when the data or files were or will be made publicly available.',
    subject: 'Keywords describing the topic of the resource. The controlled vocabulary used here is a subset of the Global Change Master Directory. Consider search and retrieval in choices.',
    contributorPerson: 'People  who are not data authors who are responsible for collecting, managing, distributing, or otherwise contributing to the development of the resource.',
    contributorAgency: 'Institutions responsible for funding, collecting, managing, distributing, or otherwise contributing to the development of the resource.',
    dates: 'Start/end date(s) of the information or work represented in this resource.',
    language: 'A language of the resource.  Recommended best practice is to use a controlled vocabulary such as RFC 4646 [RFC4646].',
    format: 'The format or file type of this resource. The list used here is a subset of the Library of Congress file types and extensions plus some new file type additions.',
    version: 'The incremental version number of the resource. Either integers or dates (YYYYMMDD) may be used.',
    rightsLicense: 'Licenses listed are open licenses that support the digital commons, acknowledge your copyright, allow others to use and build upon your work, and require others to credit authors listed. Recommended here: learn more, then use CC-BY for most work, BSD 2-clause for software, and identify existing licenses for legacy or external resources.',
    rightsPermissions: 'Public can be viewed and downloaded by anyone. Private can be viewed and downloaded only by designated users or research groups.',
    rightsPermissionsPublic: 'Can be viewed and downloaded by anyone.',
    rightsPermissionsPrivate: 'Can be viewed and downloaded only by designated users or research groups.',
    descriptor: 'An Abstract of the data set, data product, publication, or software. This field is required to obtain a DOI. A primary field for web searching and pointing. Important details or technical information not entered elsewhere may be included.',
    location: 'Spatial region or named place where the data was gathered or about which the data is focused.',
    relations: 'Related resources. Any connected or related files or resources should be listed here, ideally by repository UUID, DOI, or persistent URL; otherwise citation is acceptable.'

  });

  $translateProvider.preferredLanguage('en');
});

AgaveToGo.constant('angularMomentConfig', {
    timezone: 'America/Chicago' // optional
});

AgaveToGo.config(['$controllerProvider', function($controllerProvider) {
  // this option might be handy for migrating old apps, but please don't use it
  // in new ones!
  $controllerProvider.allowGlobals();
}]);


/* Setup global settings */
AgaveToGo.factory('settings', ['$rootScope', function($rootScope) {
    // supported languages
    var settings = {
        layout: {
            pageSidebarClosed: false, // sidebar menu state
            pageContentWhite: true, // set page content layout
            pageBodySolid: false, // solid body color state
            pageAutoScrollOnLoad: 1000 // auto scroll to top on page load
        },
        assetsPath: '../assets',
        globalPath: '../assets/global',
        layoutPath: '../assets/layouts/layout',
    };

    $rootScope.settings = settings;

    return settings;
}]);

/* Setup App Main Controller */
AgaveToGo.controller('AppController', ['$scope', '$rootScope', function($scope, $rootScope) {
    $scope.$on('$viewContentLoaded', function() {
        //App.initComponents(); // init core components
        //Layout.init(); //  Init entire layout(header, footer, sidebar, etc) on page load if the partials included in server side instead of loading with ng-include directive
    });
}]);

/***
Layout Partials.
By default the partials are loaded through AngularJS ng-include directive. In case they loaded in server side(e.g: PHP include function) then below partial
initialization can be disabled and Layout.init() should be called on page load complete as explained above.
***/

/* Setup Layout Part - Header */
AgaveToGo.controller('HeaderController', ['$scope', '$localStorage', '$http', '$rootScope', '$interval', 'StatusIoController', function($scope, $localStorage, $http, $rootScope, $interval, StatusIoController) {
    $scope.showTokenCountdown = true;
    
    $scope.checkTokenExpiration = function() {
      //console.log("Checking token expiration.")
    }

    // get token countdown time
    if (typeof $localStorage.token !== 'undefined'){
      var currentDate = new Date();
      var expirationDate = Date.parse($localStorage.token.expires_at);
      var diff = Math.abs((expirationDate - currentDate) / 60000);
      $scope.tokenCountdown = diff * 60;
      $scope.expiration = $localStorage.token.expires_at;
    }

    $scope.authenticatedUser = $localStorage.activeProfile;
    $scope.tenant  = $localStorage.tenant;
    $scope.platformStatus = { status:'Up', statusCode: 100, incidents: [], issues:[]};

    StatusIoController.listStatuses().then(

        function(data) {
            var issues = [];
            for (var i=0; i<data.result.status.length; i++) {
                if (data.result.status[i].status_code !== 100) {
                    issues.push({
                        "component": data.result.status[i].name,
                        "container": data.result.status[i].containers[0].name,
                        "status": data.result.status[i].status,
                        "statusCode" : data.result.status[i].status_code,
                        "updated": data.result.status[i].updated
                    });
                }
            }
            setTimeout(function() {
                $scope.platformStatus.incidents = data.result.incidents;
                $scope.platformStatus.status = data.result.status_overall.status;
                $scope.platformStatus.statusCode = data.result.status_overall.status_code;
                $scope.platformStatus.issues = issues;

            }, 0);

        },
        function(data) {

        }
    );

    $scope.$on('$includeContentLoaded', function() {
        Layout.initHeader(); // init header
    });

    $scope.user = ($localStorage.client && angular.copy($localStorage.client)) || {
            username: '',
            password: '',
            client_key: '',
            client_secret: '',
            remember: 0
    };

    $scope.refreshAuthToken = function() {
        var data = {
            grant_type: 'refresh_token',
            refresh_token: $localStorage.token.refresh_token,
            scope: 'PRODUCTION'
        };


        //data = queryString.stringify(data);

        var options = {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': btoa($scope.user.client_key + ':' + $scope.user.client_secret)
            }
        };

        return $http.post($scope.tenant.baseUrl + '/token', data, options).then(
            function (response) {
                $localStorage.token = response;
                currentDate = new Date();
                expirationDate = Date.parse($localStorage.token.expires_at);
                diff = Math.abs((expirationDate - currentDate) / 60000);
                $scope.tokenCountdown = diff * 60;
                return response;
            },
            function(response) {
                //$rootScope.broadcast('oauth:denied');
            });
    };

}]);

/* Setup Layout Part - Sidebar */
AgaveToGo.controller('SidebarController', ['$scope', '$localStorage', function($scope, $localStorage) {
    $scope.$on('$includeContentLoaded', function() {
        $scope.authenticatedUser = $localStorage.activeProfile;
        Layout.initSidebar(); // init sidebar
    });
}]);

/* Setup Layout Part - Quick Sidebar */
AgaveToGo.controller('QuickSidebarController', ['$scope', '$localStorage', 'ChangelogParser', function($scope, $localStorage, ChangelogParser) {
    $scope.$on('$includeContentLoaded', function() {
        $scope.changelog = {};

        $scope.tenant = $localStorage.tenant;
        $scope.alerts = [];
        ChangelogParser.latest().then(function(data) {
            if (data) {

                for(var version in data) break;
                $scope.changelog = data[version];
                $scope.changelog.version = version;

            }
        });

        setTimeout(function(){
            QuickSidebar.init(); // init quick sidebar

        }, 2000)
    });

}]);

/* Setup Layout Part - Theme Panel */
AgaveToGo.controller('ThemePanelController', ['$scope', function($scope) {
    $scope.$on('$includeContentLoaded', function() {
        Demo.init(); // init theme panel
    });
}]);

/* Setup Layout Part - Footer */
AgaveToGo.controller('FooterController', ['$scope', function($scope) {
    $scope.$on('$includeContentLoaded', function() {
        Layout.initFooter(); // init footer
    });
}]);

/* Setup Idle Monitor 	 */
AgaveToGo.controller('IdleEventsCtrl', ['$scope', 'Idle', 'Keepalive','$uibModal', '$localStorage','$http','$window', function($scope, Idle, Keepalive,$uibModal, $localStorage, $http, $window) {
	$scope.events = [];
  $scope.isIdle =false;
	function closeModals() {
      if ($scope.warning) {
        $scope.warning.close();
        $scope.warning = null;
      }
    }
    
	$scope.$on('IdleStart', function() {
		// the user appears to have gone idle
    console.log('BEING-IDLE')
    if($scope.isIdle == false){
        closeModals();
    
        $scope.warning = $uibModal.open({
          templateUrl: 'views/modals/ModalIdleWarning.html',
          windowClass: 'modal-danger'
        });
        $scope.isIdle = true;
      }
	});

	$scope.$on('IdleWarn', function(e, countdown) {
		// follows after the IdleStart event, but includes a countdown until the user is considered timed out
		// the countdown arg is the number of seconds remaining until then.
		// you can change the title or display a warning dialog from here.
		// you can let them resume their session by calling Idle.watch()
    //console.log('IDLE')
     if($scope.isIdle == false){
        closeModals();
    
        $scope.warning = $uibModal.open({
          templateUrl: 'views/modals/ModalIdleWarning.html',
          windowClass: 'modal-danger'
        });
        $scope.isIdle = true;
      }
    
	});

	$scope.$on('IdleTimeout', function() {
		// the user has timed out (meaning idleDuration + timeout has passed without any activity)
		// this is where you'd log them
    console.log('TIMEOUT')
    closeModals();
    $window.location = '/auth/#/logout';
    //logout
	});

	$scope.$on('IdleEnd', function() {
		// the user has come back from AFK and is doing stuff. if you are warning them, you can use this to hide the dialog
    closeModals();
    $scope.isIdle = false;
	});

	$scope.$on('Keepalive', function() {
		// do something to keep the user's session alive
    console.log('KEEPALIVE')
    var now= new (Date)
    var expiring = new Date(now - 10*1000) //set time ten minutes back
    if($localStorage.token.expires_at >= expiring){
      $http.post('https://localhost:8000/refresh?refresh_token='+$localStorage.token.refresh_token)
              .success(function (data, status, headers, config) {
                  $scope.requesting=false;
                  if (data.access_token){
                      $localStorage.token = data;
                      d = new Date();
                      $localStorage.token.expires_at = moment(d).add($localStorage.token.expires_in, 's').toDate();
                  }
                  else{
                      $scope.login_error=true;
                  }
              })
              .error(function (data, status, header, config) {
                  $scope.requesting=false;
                  //alert(angular.toJson(data));
              });
     }
    });
}]);
AgaveToGo.config(['IdleProvider','KeepaliveProvider',function(IdleProvider, KeepaliveProvider) {
	// configure Idle settings
	IdleProvider.idle(600); // in seconds 
	IdleProvider.timeout(300); // in seconds
	KeepaliveProvider.interval(60); // in seconds
}]);
/*.run(['Idle', '$interval',function(Idle, $interval){
	// start watching when the app runs. also starts the Keepalive service by default.
	Idle.watch();
  $interval(console.log("hi"),1000)
;}]);*/


/* Setup Rounting For All Pages */
AgaveToGo.config(['$stateProvider', '$urlRouterProvider', '$urlMatcherFactoryProvider', function($stateProvider, $urlRouterProvider, $urlMatcherFactoryProvider) {
    function valToString(val) { return val != null ? val.toString() : val; }
    function valFromString(val) { return val != null ? val.toString() : val; }
    function regexpMatches(val) { /*jshint validthis:true */ return this.pattern.test(val); }

    // Redirect any unmatched url
    $urlRouterProvider.otherwise("/data/explorer/");

    $urlRouterProvider.rule(function ($injector, $location) {
       var path = $location.path().replace(/\/\/+/g, '/');
       $location.replace().path(path);
   });

    // Make trailing slashed options
    $urlMatcherFactoryProvider.strictMode(false);

    $stateProvider
        // Dashboard
        .state('dashboard', {
            url: "/dashboard",
            templateUrl: "views/dashboard.html",
            data: {pageTitle: 'Admin Dashboard Template'},
            controller: "DashboardController",
            resolve: {
                deps: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'AgaveToGo',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before a LINK element with this ID. Dynamic CSS files must be loaded between core and theme css files
                        files: [
                            '../assets/global/plugins/morris/morris.css',
                            '../assets/global/plugins/morris/morris.min.js',
                            '../assets/global/plugins/morris/raphael-min.js',
                            '../assets/global/plugins/jquery.sparkline.min.js',
                            '../assets/pages/scripts/dashboard.min.js',
                            '../bower_components/faker/build/build/faker.min.js',
                            'js/controllers/DashboardController.js',
                        ]
                    });
                }]
            }
        })

        /**********************************************************************/
        /**********************************************************************/
        /***                                                                ***/
        /***                       Jobs Routes                              ***/
        /***                                                                ***/
        /**********************************************************************/
        /**********************************************************************/
        .state('jobs-manage', {
            url: "/jobs",
            templateUrl: "views/jobs/manager.html",
            data: {pageTitle: 'Jobs Manager'},
            controller: "JobsDirectoryController",
            resolve: {
                deps: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        serie: true,
                        name: 'AgaveToGo',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [
                            //'../bower_components/datatables/media/css/dataTables.bootstrap.min.css',
                            //'../bower_components/datatables/media/css/jquery.dataTables.min.css',
                            //
                            //'../bower_components/datatables/media/js/dataTables.bootstrap.js',
                            //'../bower_components/datatables/media/js/jquery.dataTables.js',
                            '../assets/global/scripts/datatable.js',
                            '../bower_components/holderjs/holder.js',
                            'js/services/ActionsService.js',
                            'js/services/MessageService.js',
                            'js/services/PermissionsService.js',
                            'js/services/RolesService.js',
                            'js/controllers/QueryBuilderController.js',
                            'js/controllers/jobs/JobsDirectoryController.js'
                        ]
                    });
                }]
            }
        })

        .state("jobs", {
          abtract: true,
          url:"/jobs/:id",
          templateUrl:"views/jobs/resource/resource.html",
          controller: "JobsResourceController",
          resolve: {
            deps: ['$ocLazyLoad', function($ocLazyLoad) {
              return $ocLazyLoad.load([
                {
                  name: 'AgaveToGo',
                    files: [
                      'js/controllers/jobs/resource/JobsResourceController.js'
                    ]
                }
              ]);
            }]
          }
        })

        .state("jobs.details", {
          url: "",
          templateUrl: "views/jobs/resource/details.html",
          controller: "JobsResourceDetailsController",
          resolve: {
              deps: ['$ocLazyLoad', function($ocLazyLoad) {
                return $ocLazyLoad.load([
                  {
                    name: 'AgaveToGo',
                    files: [
                        'js/services/ActionsService.js',
                        'js/services/MessageService.js',
                        'js/services/PermissionsService.js',
                        'js/controllers/jobs/resource/JobsResourceDetailsController.js'
                    ]
                  }
                ]);
              }]
          }
        })

        .state("jobs.history", {
          url: "/history",
          controller: "JobsResourceHistoryController",
          templateUrl: "views/jobs/resource/history.html",
          resolve: {
              deps: ['$ocLazyLoad', function($ocLazyLoad) {
                return $ocLazyLoad.load([
                  {
                    name: 'AgaveToGo',
                    files: [
                        'js/services/ActionsService.js',
                        'js/controllers/jobs/resource/JobsResourceHistoryController.js'
                    ]
                  }
                ]);
              }]
          }
        })

        .state("jobs.stats", {
          url: "/jobs",
          controller: "JobsResourceStatsController",
          templateUrl: "views/jobs/resource/stats.html",
          resolve: {
              deps: ['$ocLazyLoad', function($ocLazyLoad) {
                return $ocLazyLoad.load([
                  {
                    name: 'AgaveToGo',
                    files: [
                        'js/controllers/jobs/resource/JobsResourceStatsController.js'
                    ]
                  }
                ]);
              }]
          }
        })

        /**********************************************************************/
        /**********************************************************************/
        /***                                                                ***/
        /***                       Notifications Routes                     ***/
        /***                                                                ***/
        /**********************************************************************/
        /**********************************************************************/

        .state('notifications-noslash', {
            url: "/notifications",
            templateUrl: "views/notifications/manager.html",
            data: {pageTitle: 'Notifications Manager'},
            controller: "NotificationsManagerDirectoryController",
            resolve: {
                deps: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        serie: true,
                        name: 'AgaveToGo',
                        insertBefore: '#ng_load_plugins_before',
                        files: [
                            'js/services/ActionsService.js',
                            'js/controllers/notifications/NotificationsManagerDirectoryController.js'
                        ]
                    });
                }]
            }
        })

        .state('notifications-manager-noslash', {
            url: "/notifications/manager",
            templateUrl: "views/notifications/manager.html",
            data: {pageTitle: 'Notifications Manager'},
            controller: "NotificationsManagerDirectoryController",
            resolve: {
                deps: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        serie: true,
                        name: 'AgaveToGo',
                        insertBefore: '#ng_load_plugins_before',
                        files: [
                            'js/services/ActionsService.js',
                            'js/services/MessageService.js',
                            'js/controllers/QueryBuilderController.js',
                            'js/controllers/notifications/NotificationsManagerDirectoryController.js'
                        ]
                    });
                }]
            }
        })

        .state('notifications-manager', {
            url: "/notifications/manager/:associatedUuid",
            params: {
              associatedUuid: '',
              resourceType: ''
            },
            templateUrl: "views/notifications/manager.html",
            data: {pageTitle: 'Notifications Manager'},
            controller: "NotificationsManagerDirectoryController",
            resolve: {
                deps: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        serie: true,
                        name: 'AgaveToGo',
                        insertBefore: '#ng_load_plugins_before',
                        files: [
                            'js/services/ActionsService.js',
                            'js/services/MessageService.js',
                            'js/controllers/QueryBuilderController.js',
                            'js/controllers/notifications/NotificationsManagerDirectoryController.js'
                        ]
                    });
                }]
            }
        })

        .state('notifications-edit', {
            url: "/notifications/edit/:notificationId",
            templateUrl: "views/notifications/resource/edit.html",
            controller: "NotificationsResourceEditController",
            resolve: {
                deps: ['$ocLazyLoad', function($ocLazyLoad) {
                  return $ocLazyLoad.load([
                    {
                      serie: true,
                      name: 'AgaveToGo',
                      files: [
                          'js/services/ActionsService.js',
                          'js/services/MessageService.js',
                          'js/controllers/notifications/resource/NotificationsResourceEditController.js'
                      ]
                    }
                  ]);
                }]
            }
        })

        .state('notifications-add-noslash', {
            url: "/notifications/add",
            params: {
              associatedUuid: '',
              resourceType: ''
            },
            templateUrl: "views/notifications/resource/add.html",
            controller: "NotificationsResourceAddController",
            resolve: {
                deps: ['$ocLazyLoad', function($ocLazyLoad) {
                  return $ocLazyLoad.load([
                    {
                      serie: true,
                      name: 'AgaveToGo',
                      files: [
                          'js/services/ActionsService.js',
                          'js/services/MessageService.js',
                          'js/controllers/notifications/resource/NotificationsResourceAddController.js'
                      ]
                    }
                  ]);
                }]
            }
        })

        .state('notifications-add', {
            url: "/notifications/add/:associatedUuid",
            params: {
              associatedUuid: '',
              resourceType: ''
            },
            templateUrl: "views/notifications/resource/add.html",
            controller: "NotificationsResourceAddController",
            resolve: {
                deps: ['$ocLazyLoad', function($ocLazyLoad) {
                  return $ocLazyLoad.load([
                    {
                      serie: true,
                      name: 'AgaveToGo',
                      files: [
                          'js/services/ActionsService.js',
                          'js/services/MessageService.js',
                          'js/controllers/notifications/resource/NotificationsResourceAddController.js'
                      ]
                    }
                  ]);
                }]
            }
        })

        .state('notifications-alerts-id', {
            url: "/notifications/alerts/:id",
            templateUrl: "views/notifications/alerts.html",
            data: {pageTitle: 'Notifications Alerts'},
            controller: "NotificationsAlertsDirectoryController",
            resolve: {
                deps: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        serie: true,
                        name: 'AgaveToGo',
                        insertBefore: '#ng_load_plugins_before',
                        files: [
                            'js/services/ActionsService.js',
                            'js/services/MessageService.js',
                            'js/controllers/QueryBuilderController.js',
                            'js/controllers/notifications/NotificationsAlertsDirectoryController.js'
                        ]
                    });
                }]
            }
        })

        .state('notifications-history', {
            url: "/notifications/alerts",
            templateUrl: "views/notifications/alerts.html",
            data: {pageTitle: 'Notifications History'},
            controller: "NotificationsAlertsDirectoryController",
            resolve: {
                deps: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        serie: true,
                        name: 'AgaveToGo',
                        insertBefore: '#ng_load_plugins_before',
                        files: [
                            'js/services/ActionsService.js',
                            'js/controllers/QueryBuilderController.js',
                            'js/controllers/notifications/NotificationsAlertsDirectoryController.js'
                        ]
                    });
                }]
            }
        })

        .state('notifications', {
            abtract: true,
            url: "/notifications/:id",
            templateUrl: "views/notifications/resource/resource.html",
            controller: "NotificationsResourceController",
            resolve: {
              deps: ['$ocLazyLoad', function($ocLazyLoad) {
                return $ocLazyLoad.load([
                  {
                    name: 'AgaveToGo',
                      files: [
                        'js/controllers/notifications/resource/NotificationsResourceController.js'
                      ]
                  }
                ]);
              }]
            }
        })

        .state('notifications.details', {
            url: "",
            templateUrl: "views/notifications/resource/details.html",
            controller: "NotificationsResourceDetailsController",
            resolve: {
                deps: ['$ocLazyLoad', function($ocLazyLoad) {
                  return $ocLazyLoad.load([
                    {
                      serie: true,
                      name: 'AgaveToGo',
                      files: [
                          'js/services/ActionsService.js',
                          'js/services/PermissionsService.js',
                          'js/controllers/notifications/resource/NotificationsResourceDetailsController.js'
                      ]
                    }
                  ]);
                }]
            }
        })

        /**********************************************************************/
        /**********************************************************************/
        /***                                                                ***/
        /***                       Monitors Routes                          ***/
        /***                                                                ***/
        /**********************************************************************/
        /**********************************************************************/

        .state('monitors-noslash', {
            url: "/monitors",
            templateUrl: "views/monitors/manager.html",
            data: {pageTitle: 'Monitors Manager'},
            controller: "MonitorsManagerDirectoryController",
            resolve: {
                deps: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        serie: true,
                        name: 'AgaveToGo',
                        insertBefore: '#ng_load_plugins_before',
                        files: [
                            'js/services/ActionsService.js',
                            'js/services/MessageService.js',
                            'js/controllers/QueryBuilderController.js',
                            'js/controllers/monitors/MonitorsManagerDirectoryController.js'
                        ]
                    });
                }]
            }
        })

        .state('monitors-manager-noslash', {
            url: "/monitors/manager",
            templateUrl: "views/monitors/manager.html",
            data: {pageTitle: 'Monitors Manager'},
            controller: "MonitorsManagerDirectoryController",
            resolve: {
                deps: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        serie: true,
                        name: 'AgaveToGo',
                        insertBefore: '#ng_load_plugins_before',
                        files: [
                            'js/services/ActionsService.js',
                            'js/services/MessageService.js',
                            'js/controllers/QueryBuilderController.js',
                            'js/controllers/monitors/MonitorsManagerDirectoryController.js'
                        ]
                    });
                }]
            }
        })

        .state('monitors-manager', {
            url: "/monitors/manager/:systemId",
            params: {
              systemId: ''
            },
            templateUrl: "views/monitors/manager.html",
            data: {pageTitle: 'Monitors Manager'},
            controller: "MonitorsManagerDirectoryController",
            resolve: {
                deps: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        serie: true,
                        name: 'AgaveToGo',
                        insertBefore: '#ng_load_plugins_before',
                        files: [
                            'js/services/ActionsService.js',
                            'js/services/MessageService.js',
                            'js/controllers/QueryBuilderController.js',
                            'js/controllers/monitors/MonitorsManagerDirectoryController.js'
                        ]
                    });
                }]
            }
        })

        .state('monitors-edit', {
            url: "/monitors/edit/:monitorId",
            templateUrl: "views/monitors/resource/edit.html",
            controller: "MonitorsResourceEditController",
            resolve: {
                deps: ['$ocLazyLoad', function($ocLazyLoad) {
                  return $ocLazyLoad.load([
                    {
                      serie: true,
                      name: 'AgaveToGo',
                      files: [
                          'js/services/ActionsService.js',
                          'js/services/MessageService.js',
                          'js/controllers/monitors/resource/MonitorsResourceEditController.js'
                      ]
                    }
                  ]);
                }]
            }
        })

        .state('monitors-add-noslash', {
            url: "/monitors/add",
            params: {
              associatedUuid: '',
              resourceType: ''
            },
            templateUrl: "views/monitors/resource/add.html",
            controller: "MonitorsResourceAddController",
            resolve: {
                deps: ['$ocLazyLoad', function($ocLazyLoad) {
                  return $ocLazyLoad.load([
                    {
                      serie: true,
                      name: 'AgaveToGo',
                      files: [
                          'js/services/ActionsService.js',
                          'js/services/MessageService.js',
                          'js/controllers/monitors/resource/MonitorsResourceAddController.js'
                      ]
                    }
                  ]);
                }]
            }
        })

        .state('monitors-add', {
            url: "/monitors/add/:systemId",
            params: {
              systemId: ''
            },
            templateUrl: "views/monitors/resource/add.html",
            controller: "MonitorsResourceAddController",
            resolve: {
                deps: ['$ocLazyLoad', function($ocLazyLoad) {
                  return $ocLazyLoad.load([
                    {
                      serie: true,
                      name: 'AgaveToGo',
                      files: [
                          'js/services/ActionsService.js',
                          'js/services/MessageService.js',
                          'js/controllers/monitors/resource/MonitorsResourceAddController.js'
                      ]
                    }
                  ]);
                }]
            }
        })

        .state('monitors-checks', {
            url: "/monitors/checks",
            templateUrl: "views/monitors/checks.html",
            data: {pageTitle: 'Monitors Checks'},
            controller: "MonitorsChecksDirectoryController",
            resolve: {
                deps: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        serie: true,
                        name: 'AgaveToGo',
                        insertBefore: '#ng_load_plugins_before',
                        files: [
                            'js/services/ActionsService.js',
                            'js/services/MessageService.js',
                            'js/controllers/QueryBuilderController.js',
                            'js/controllers/monitors/MonitorsChecksDirectoryController.js'
                        ]
                    });
                }]
            }
        })

        .state('monitors-checks-id', {
            url: "/monitors/checks/:monitorId",
            templateUrl: "views/monitors/checks.html",
            data: {pageTitle: 'Monitors Checks'},
            controller: "MonitorsChecksDirectoryController",
            resolve: {
                deps: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        serie: true,
                        name: 'AgaveToGo',
                        insertBefore: '#ng_load_plugins_before',
                        files: [
                            'js/services/ActionsService.js',
                            'js/services/MessageService.js',
                            'js/controllers/QueryBuilderController.js',
                            'js/controllers/monitors/MonitorsChecksDirectoryController.js'
                        ]
                    });
                }]
            }
        })

        .state('monitors', {
            abtract: true,
            url: "/monitors/:id",
            templateUrl: "views/monitors/resource/resource.html",
            controller: "MonitorsResourceController",
            resolve: {
              deps: ['$ocLazyLoad', function($ocLazyLoad) {
                return $ocLazyLoad.load([
                  {
                    name: 'AgaveToGo',
                      files: [
                        'js/controllers/monitors/resource/MonitorsResourceController.js'
                      ]
                  }
                ]);
              }]
            }
        })

        .state('monitors.details', {
            url: "",
            templateUrl: "views/monitors/resource/details.html",
            controller: "MonitorsResourceDetailsController",
            resolve: {
                deps: ['$ocLazyLoad', function($ocLazyLoad) {
                  return $ocLazyLoad.load([
                    {
                      serie: true,
                      name: 'AgaveToGo',
                      files: [
                          'js/services/ActionsService.js',
                          'js/services/MessageService.js',
                          'js/services/PermissionsService.js',
                          'js/controllers/monitors/resource/MonitorsResourceDetailsController.js'
                      ]
                    }
                  ]);
                }]
            }
        })

        /**********************************************************************/
        /**********************************************************************/
        /***                                                                ***/
        /***                       Applications Routes                      ***/
        /***                                                                ***/
        /**********************************************************************/
        /**********************************************************************/

        .state('apps-edit', {
            url: "/apps/edit/:appId",
            templateUrl: "views/apps/edit-wizard.html",
            data: {pageTitle: 'App Edit Wizard'},
            controller: "AppEditWizardController",
            resolve: {
                deps: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        serie: true,
                        name: 'AgaveToGo',
                        files: [
                            "../bower_components/codemirror/lib/codemirror.css",
                            "../bower_components/codemirror/theme/neo.css",
                            "../bower_components/codemirror/lib/codemirror.js",
                            "../bower_components/angular-ui-codemirror/ui-codemirror.min.js",

                            'js/services/MessageService.js',
                            'js/controllers/apps/AppEditWizardController.js'
                        ]
                    },
                    "ui.codemirror"
                    );
                }]
            }
        })


        .state('apps-new', {
            url: "/apps/new",
            templateUrl: "views/apps/wizard.html",
            data: {pageTitle: 'App Builder Wizard'},
            controller: "AppBuilderWizardController",
            resolve: {
                deps: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        serie: true,
                        name: 'AgaveToGo',
                        files: [
                            "../bower_components/codemirror/lib/codemirror.css",
                            "../bower_components/codemirror/theme/neo.css",
                            "../bower_components/codemirror/lib/codemirror.js",
                            "../bower_components/angular-ui-codemirror/ui-codemirror.min.js",

                            'js/services/MessageService.js',
                            'js/controllers/apps/AppBuilderWizardController.js'
                        ]
                    },
                    "ui.codemirror"
                    );
                }]
            }
        })

        .state('apps-manage', {
            url: "/apps",
            templateUrl: "views/apps/manager.html",
            data: {pageTitle: 'App Manager'},
            controller: "AppDirectoryController",
            resolve: {
                deps: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        serie: true,
                        name: 'AgaveToGo',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [
                            'js/services/ActionsService.js',
                            'js/services/MessageService.js',
                            'js/services/PermissionsService.js',
                            'js/controllers/QueryBuilderController.js',
                            'js/controllers/apps/AppDirectoryController.js',
                            'js/controllers/modals/ModalConfirmResourceActionController.js',
                            'js/controllers/modals/ModalPermissionEditorController.js'
                        ]
                    });
                }]
            }
        })

        .state('apps-manage-slash', {
            url: "/apps/",
            templateUrl: "views/apps/manager.html",
            data: {pageTitle: 'App Manager'},
            controller: "AppDirectoryController",
            resolve: {
                deps: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        serie: true,
                        name: 'AgaveToGo',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [
                            '../assets/global/scripts/datatable.js',
                            '../bower_components/holderjs/holder.js',
                            'js/services/ActionsService.js',
                            'js/services/PermissionsService.js',
                            'js/controllers/QueryController.js',
                            'js/controllers/apps/AppDirectoryController.js',
                            'js/controllers/modals/ModalConfirmResourceActionController.js',
                            'js/controllers/modals/ModalPermissionEditorController.js'
                        ]
                    });
                }]
            }
        })


        .state("apps", {
          abtract: true,
          url:"/apps/:appId",
          templateUrl:"views/apps/resource/resource.html",
          controller: "AppsResourceController",
          resolve: {
            deps: ['$ocLazyLoad', function($ocLazyLoad) {
              return $ocLazyLoad.load([
                {
                  name: 'AgaveToGo',
                    files: [
                      'js/controllers/apps/resource/AppsResourceController.js'
                    ]
                }
              ]);
            }]
          }
        })

        .state("apps.details", {
          url: "",
          templateUrl: "views/apps/resource/details.html",
          controller: "AppsResourceDetailsController",
          resolve: {
              deps: ['$ocLazyLoad', function($ocLazyLoad) {
                return $ocLazyLoad.load([
                  {
                    serie: true,
                    name: 'AgaveToGo',
                    files: [
                        'js/services/ActionsService.js',
                        'js/services/MessageService.js',
                        'js/services/PermissionsService.js',
                        'js/controllers/apps/resource/AppsResourceDetailsController.js'
                    ]
                  }
                ]);
              }]
          }
        })

        .state("apps.stats", {
          url: "/stats",
          controller: "AppsResourceStatsController",
          templateUrl: "views/apps/resource/stats.html",
          resolve: {
              deps: ['$ocLazyLoad', function($ocLazyLoad) {
                return $ocLazyLoad.load([
                  {
                    name: 'AgaveToGo',
                    files: [
                        'js/controllers/apps/resource/AppsResourceStatsController.js'
                    ]
                  }
                ]);
              }]
          }
        })

        .state("apps.run", {
          url: "/run",
          controller: "AppsResourceRunController",
          templateUrl: "views/apps/resource/job-form.html",
          resolve: {
              deps: ['$ocLazyLoad', function($ocLazyLoad) {
                return $ocLazyLoad.load([
                  {
                    serie: true,
                    name: 'AgaveToGo',
                    files: [
                        'js/services/MessageService.js',
                        'js/controllers/apps/resource/AppsResourceRunController.js'
                    ]
                  }
                ]);
              }]
          }
        })


        /**********************************************************************/
        /**********************************************************************/
        /***                                                                ***/
        /***                       Data Management Routes                   ***/
        /***                                                                ***/
        /**********************************************************************/
        /**********************************************************************/

        // TO-DO: need to improve this with redirect
        .state('data-explorer-noslash', {
            url: "/data/explorer/:systemId",
            templateUrl: "views/data/explorer.html",
            data: { pageTitle: 'File Explorer' },
            controller: "FileExplorerController",
            resolve: {
                deps: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        {
                            serie: true,
                            name: 'AgaveToGo',
                            insertBefore: '#ng_load_plugins_before',
                            files: [
                                "js/services/MessageService.js",
                                "js/controllers/data/FileExplorerController.js"
                            ]
                        }
                    ]);
                }]
            }
        })

        // AngularJS plugins
        .state('data-explorer', {
            url: "/data/explorer/:systemId/{path:any}",
            templateUrl: "views/data/explorer.html",
            data: { pageTitle: 'File Explorer' },
            controller: "FileExplorerController",
            resolve: {
                deps: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        {
                            serie: true,
                            name: 'AgaveToGo',
                            insertBefore: '#ng_load_plugins_before',
                            files: [
                                /********* File Manager ******/
                                "js/services/MessageService.js",
                                "js/controllers/data/FileExplorerController.js"
                            ]
                        }
                    ]);
                }]
            }
        })


        /**********************************************************************/
        /**********************************************************************/
        /***                                                                ***/
        /***                       User Profile Routes                      ***/
        /***                                                                ***/
        /**********************************************************************/
        /**********************************************************************/

        // User Profile
        .state("profile", {
            url: "/profile/:username",
            templateUrl: "views/profile/main.html",
            data: {pageTitle: 'User Profile'},
            controller: "UserProfileController",
            resolve: {
                deps: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'AgaveToGo',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [
                            '../assets/global/plugins/bootstrap-fileinput/bootstrap-fileinput.css',
                            '../assets/pages/css/profile.css',
                            '../assets/pages/css/search.css',

                            '../assets/global/plugins/jquery.sparkline.min.js',
                            '../assets/global/plugins/bootstrap-fileinput/bootstrap-fileinput.js',

                            '../assets/pages/scripts/profile.min.js',
                            '../bower_components/faker/build/build/faker.min.js',

                            'js/services/MessageService.js',
                            'js/controllers/profiles/UserProfileController.js'
                        ]
                    });
                }]
            }
        })

        // User Profile Dashboard
        .state("profile.dashboard", {
            url: "/dashboard",
            templateUrl: "views/profile/dashboard.html",
            data: {pageTitle: 'User Profile'}
        })

        // User Profile Account
        .state("profile.account", {
            url: "/account",
            templateUrl: "views/profile/account.html",
            data: {pageTitle: 'User Account'}
        })

        // User Profile Help
        .state("profile.help", {
            url: "/help",
            templateUrl: "views/profile/help.html",
            data: {pageTitle: 'User Help'}
        })

        // User Profile Search
        .state("profile.search", {
            url: "/search",
            templateUrl: "views/profile/search.html",
            data: {pageTitle: 'Directory Search'}
        })

        /**********************************************************************/
        /**********************************************************************/
        /***                                                                ***/
        /***                       Systems Routes                           ***/
        /***                                                                ***/
        /**********************************************************************/
        /**********************************************************************/

        .state('systems-manage', {
            url: "/systems",
            templateUrl: "views/systems/manager.html",
            data: {pageTitle: 'Systems Manager'},
            controller: "SystemDirectoryController",
            resolve: {
                deps: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        serie: true,
                        name: 'AgaveToGo',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [
                            //'../bower_components/datatables/media/css/dataTables.bootstrap.min.css',
                            //'../bower_components/datatables/media/css/jquery.dataTables.min.css',
                            //
                            //'../bower_components/datatables/media/js/dataTables.bootstrap.js',
                            //'../bower_components/datatables/media/js/jquery.dataTables.js',
                            '../assets/global/scripts/datatable.js',
                            '../bower_components/holderjs/holder.js',
                            'js/services/ActionsService.js',
                            'js/services/MessageService.js',
                            'js/services/RolesService.js',
                            'js/controllers/QueryBuilderController.js',
                            'js/controllers/systems/SystemDirectoryController.js'
                        ]
                    });
                }]
            }
        })

        .state('systems-new', {
            url: "/systems/new",
            templateUrl: "views/systems/wizard.html",
            data: {pageTitle: 'System Builder Wizard'},
            controller: "SystemBuilderWizardController",
            resolve: {
                deps: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load({
                            serie: true,
                            name: 'AgaveToGo',
                            insertBefore: '#ng_load_plugins_before',
                            files: [
                              'js/services/MessageService.js',
                              'js/controllers/systems/SystemBuilderWizardController.js',
                              'js/controllers/data/FileExplorerController.js',
                              '../bower_components/codemirror/lib/codemirror.css',
                              '../bower_components/codemirror/theme/neo.css',
                              '../bower_components/codemirror/theme/solarized.css',
                              '../bower_components/codemirror/mode/javascript/javascript.js',
                              '../bower_components/codemirror/mode/markdown/markdown.js',
                              '../bower_components/codemirror/mode/clike/clike.js',
                              '../bower_components/codemirror/mode/shell/shell.js',
                              '../bower_components/codemirror/mode/python/python.js',
                              '../bower_components/codemirror/lib/codemirror.js',
                              '../bower_components/angular-ui-codemirror/ui-codemirror.min.js',
                            ]
                        },
                        // "FileManagerApp",
                        "ui.codemirror"
                    );
                }]
            }
        })

        .state('systems-edit', {
            url: "/systems/edit/:systemId",
            templateUrl: "views/systems/edit-wizard.html",
            data: {pageTitle: 'System Editor Wizard'},
            controller: "SystemEditorWizardController",
            resolve: {
                deps: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load({
                            serie: true,
                            name: 'AgaveToGo',
                            insertBefore: '#ng_load_plugins_before',
                            files: [
                                'js/services/MessageService.js',
                                'js/controllers/systems/SystemEditorWizardController.js',
                                '../bower_components/codemirror/lib/codemirror.css',
                                '../bower_components/codemirror/theme/neo.css',
                                '../bower_components/codemirror/theme/solarized.css',
                                '../bower_components/codemirror/mode/javascript/javascript.js',
                                '../bower_components/codemirror/mode/markdown/markdown.js',
                                '../bower_components/codemirror/mode/clike/clike.js',
                                '../bower_components/codemirror/mode/shell/shell.js',
                                '../bower_components/codemirror/mode/python/python.js',
                                '../bower_components/codemirror/lib/codemirror.js',
                                '../bower_components/angular-ui-codemirror/ui-codemirror.min.js',
                            ]
                        },
                        // "FileManagerApp",
                        "ui.codemirror"
                    );
                }]
            }
        })

        .state("systems", {
          abtract: true,
          url:"/systems/:systemId",
          templateUrl:"views/systems/resource/resource.html",
          controller: "SystemsResourceController",
          resolve: {
            deps: ['$ocLazyLoad', function($ocLazyLoad) {
              return $ocLazyLoad.load([
                {
                  name: 'AgaveToGo',
                    files: [
                      'js/controllers/systems/resource/SystemsResourceController.js'
                    ]
                }
              ]);
            }]
          }
        })

        .state("systems.details", {
          url: "",
          templateUrl: "views/systems/resource/details.html",
          controller: "SystemsResourceDetailsController",
          resolve: {
              deps: ['$ocLazyLoad', function($ocLazyLoad) {
                return $ocLazyLoad.load([
                  {
                    serie: true,
                    name: 'AgaveToGo',
                    files: [
                        'js/services/ActionsService.js',
                        'js/services/MessageService.js',
                        'js/services/RolesService.js',
                        'js/controllers/systems/resource/SystemsResourceDetailsController.js'
                    ]
                  }
                ]);
              }]
          }
        })

        .state("systems.queues", {
          url: "/queues",
          controller: "SystemsResourceQueuesController",
          templateUrl: "views/systems/resource/queues.html",
          resolve: {
              deps: ['$ocLazyLoad', function($ocLazyLoad) {
                return $ocLazyLoad.load([
                  {
                    name: 'AgaveToGo',
                    files: [
                        'js/services/MessageService.js',
                        'js/controllers/systems/resource/SystemsResourceQueuesController.js'
                    ]
                  }
                ]);
              }]
          }
        })

        .state("systems.apps", {
          url: "/apps",
          templateUrl: "views/systems/resource/apps.html",
          controller: "SystemsResourceAppsController",
          resolve: {
              deps: ['$ocLazyLoad', function($ocLazyLoad) {
                return $ocLazyLoad.load([
                  {
                    name: 'AgaveToGo',
                    files: [
                        'js/services/MessageService.js',
                        'js/controllers/systems/resource/SystemsResourceAppsController.js'
                    ]
                  }
                ]);
              }]
          }
        })

        .state("systems.stats", {
          url: "/stats",
          controller: "SystemsResourceStatsController",
          templateUrl: "views/systems/resource/stats.html",
          resolve: {
              deps: ['$ocLazyLoad', function($ocLazyLoad) {
                return $ocLazyLoad.load([
                  {
                    name: 'AgaveToGo',
                    files: [
                        'js/services/MessageService.js',
                        'js/controllers/systems/resource/SystemsResourceStatsController.js'
                    ]
                  }
                ]);
              }]
          }
        })




        /**********************************************************************/
        /**********************************************************************/
        /***                                                                ***/
        /***                       Plugin Routes                            ***/
        /***                                                                ***/
        /**********************************************************************/
        /**********************************************************************/

        // UI Select
        .state('uiselect', {
            url: "/ui_select.html",
            templateUrl: "views/ui_select.html",
            data: {pageTitle: 'AngularJS Ui Select'},
            controller: "UISelectController",
            resolve: {
                deps: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load([{
                        name: 'ui.select',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [
                            '../assets/global/plugins/angularjs/plugins/ui-select/select.min.css',
                            '../assets/global/plugins/angularjs/plugins/ui-select/select.min.js'
                        ]
                    }, {
                        name: 'AgaveToGo',
                        files: [
                            'js/controllers/UISelectController.js'
                        ]
                    }]);
                }]
            }
        })

        // UI Bootstrap
        .state('uibootstrap', {
            url: "/ui_bootstrap.html",
            templateUrl: "views/ui_bootstrap.html",
            data: {pageTitle: 'AngularJS UI Bootstrap'},
            controller: "GeneralPageController",
            resolve: {
                deps: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load([{
                        name: 'AgaveToGo',
                        files: [
                            'js/controllers/GeneralPageController.js'
                        ]
                    }]);
                }]
            }
        })

        // Tree View
        .state('tree', {
            url: "/tree",
            templateUrl: "views/tree.html",
            data: {pageTitle: 'jQuery Tree View'},
            controller: "GeneralPageController",
            resolve: {
                deps: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load([{
                        name: 'AgaveToGo',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [
                            '../assets/global/plugins/jstree/dist/themes/default/style.min.css',
                            '../assets/global/plugins/jstree/dist/jstree.min.js',
                            '../assets/pages/scripts/ui-tree.min.js',
                            'js/controllers/GeneralPageController.js'
                        ]
                    }]);
                }]
            }
        })

        // Form Tools
        .state('formtools', {
            url: "/form-tools",
            templateUrl: "views/form_tools.html",
            data: {pageTitle: 'Form Tools'},
            controller: "GeneralPageController",
            resolve: {
                deps: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load([{
                        name: 'AgaveToGo',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [
                            '../assets/global/plugins/bootstrap-fileinput/bootstrap-fileinput.css',
                            '../assets/global/plugins/bootstrap-switch/css/bootstrap-switch.min.css',
                            '../assets/global/plugins/bootstrap-markdown/css/bootstrap-markdown.min.css',
                            '../assets/global/plugins/typeahead/typeahead.css',
                            '../assets/global/plugins/fuelux/js/spinner.min.js',
                            '../assets/global/plugins/bootstrap-fileinput/bootstrap-fileinput.js',
                            '../assets/global/plugins/jquery-inputmask/jquery.inputmask.bundle.min.js',
                            '../assets/global/plugins/jquery.input-ip-address-control-1.0.min.js',
                            '../assets/global/plugins/bootstrap-pwstrength/pwstrength-bootstrap.min.js',
                            '../assets/global/plugins/bootstrap-switch/js/bootstrap-switch.min.js',
                            '../assets/global/plugins/bootstrap-maxlength/bootstrap-maxlength.min.js',
                            '../assets/global/plugins/bootstrap-touchspin/bootstrap.touchspin.js',
                            '../assets/global/plugins/typeahead/handlebars.min.js',
                            '../assets/global/plugins/typeahead/typeahead.bundle.min.js',
                            '../assets/pages/scripts/components-form-tools-2.min.js',

                            'js/controllers/GeneralPageController.js'
                        ]
                    }]);
                }]
            }
        })

        // Date & Time Pickers
        .state('pickers', {
            url: "/pickers",
            templateUrl: "views/pickers.html",
            data: {pageTitle: 'Date & Time Pickers'},
            controller: "GeneralPageController",
            resolve: {
                deps: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load([{
                        name: 'AgaveToGo',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [
                            '../assets/global/plugins/clockface/css/clockface.css',
                            '../assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker3.min.css',
                            '../assets/global/plugins/bootstrap-timepicker/css/bootstrap-timepicker.min.css',
                            '../assets/global/plugins/bootstrap-colorpicker/css/colorpicker.css',
                            '../assets/global/plugins/bootstrap-daterangepicker/daterangepicker-bs3.css',
                            '../assets/global/plugins/bootstrap-datetimepicker/css/bootstrap-datetimepicker.min.css',
                            '../assets/global/plugins/moment.min.js',
                            '../assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.min.js',
                            '../assets/global/plugins/bootstrap-timepicker/js/bootstrap-timepicker.min.js',
                            '../assets/global/plugins/clockface/js/clockface.js',
                            '../assets/global/plugins/bootstrap-daterangepicker/daterangepicker.js',
                            '../assets/global/plugins/bootstrap-colorpicker/js/bootstrap-colorpicker.js',
                            '../assets/global/plugins/bootstrap-datetimepicker/js/bootstrap-datetimepicker.min.js',

                            '../assets/pages/scripts/components-date-time-pickers.min.js',

                            'js/controllers/GeneralPageController.js'
                        ]
                    }]);
                }]
            }
        })

        // Custom Dropdowns
        .state('dropdowns', {
            url: "/dropdowns",
            templateUrl: "views/dropdowns.html",
            data: {pageTitle: 'Custom Dropdowns'},
            controller: "GeneralPageController",
            resolve: {
                deps: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load([{
                        name: 'AgaveToGo',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [
                            '../assets/global/plugins/bootstrap-select/css/bootstrap-select.min.css',
                            '../assets/global/plugins/select2/css/select2.min.css',
                            '../assets/global/plugins/select2/css/select2-bootstrap.min.css',

                            '../assets/global/plugins/bootstrap-select/js/bootstrap-select.min.js',
                            '../assets/global/plugins/select2/js/select2.full.min.js',

                            '../assets/pages/scripts/components-bootstrap-select.min.js',
                            '../assets/pages/scripts/components-select2.min.js',

                            'js/controllers/GeneralPageController.js'
                        ]
                    }]);
                }]
            }
        })

        // Advanced Datatables
        .state('datatablesAdvanced', {
            url: "/datatables/managed.html",
            templateUrl: "views/datatables/managed.html",
            data: {pageTitle: 'Advanced Datatables'},
            controller: "GeneralPageController",
            resolve: {
                deps: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'AgaveToGo',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [
                            '../assets/global/plugins/datatables/datatables.min.css',
                            '../assets/global/plugins/datatables/plugins/bootstrap/datatables.bootstrap.css',

                            '../assets/global/plugins/datatables/datatables.all.min.js',

                            '../assets/pages/scripts/table-datatables-managed.min.js',

                            'js/controllers/GeneralPageController.js'
                        ]
                    });
                }]
            }
        })

        // Ajax Datetables
        .state('datatablesAjax', {
            url: "/datatables/ajax.html",
            templateUrl: "views/datatables/ajax.html",
            data: {pageTitle: 'Ajax Datatables'},
            controller: "GeneralPageController",
            resolve: {
                deps: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'AgaveToGo',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [
                            '../assets/global/plugins/datatables/datatables.min.css',
                            '../assets/global/plugins/datatables/plugins/bootstrap/datatables.bootstrap.css',
                            '../assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker3.min.css',

                            '../assets/global/plugins/datatables/datatables.all.min.js',
                            '../assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.min.js',
                            '../assets/global/scripts/datatable.js',

                            'js/scripts/table-ajax.js',
                            'js/controllers/GeneralPageController.js'
                        ]
                    });
                }]
            }
        })

        /**********************************************************************/
        /**********************************************************************/
        /***                                                                ***/
        /***                       Project Routes                           ***/
        /***                                                                ***/
        /**********************************************************************/
        /**********************************************************************/

        // Projects
        .state('projects', {
            url: "/projects",
            templateUrl: "views/projects/dashboard.html",
            data: {pageTitle: 'Projects'},
            controller: "ProjectDashboardController",
            resolve: {
                deps: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'AgaveToGo',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [
                            '../assets/apps/css/todo.css',
                            'js/services/Projects.js',
                            'js/services/Tasks.js',
                            'js/services/Comments.js',
                            'js/controllers/projects/ProjectDashboardController.js'
                        ]
                    });
                }]
            }
        })

        .state('project.new', {
            url: "/projects/new",
            templateUrl: "views/projects/editor.html",
            data: {pageTitle: 'New Project'}
        })

        .state('project.edit', {
            url: "/projects/edit",
            templateUrl: "views/projects/editor.html",
            data: {pageTitle: 'New Project'}
        })
        /**********************************************************************/
        /**********************************************************************/
        /***                                                                ***/
        /***                       Metadata Routes                           ***/
        /***                                                                ***/
        /**********************************************************************/
        /**********************************************************************/

        // Metadata
        .state('metadata-manage', {
            url: "/metadata",
            templateUrl: "views/metadata/manager.html",
            data: {pageTitle: 'Metadata Manager'},
            controller: "MetadataController",
            resolve: {
                deps: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        serie: true,
                        name: 'AgaveToGo',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [
                            '../assets/global/scripts/datatable.js',
                            '../bower_components/holderjs/holder.js',
                            'js/services/ActionsService.js',
                            'js/services/MessageService.js',
                            'js/services/PermissionsService.js',
                            'js/services/MetadataService.js',
                            'js/services/FilesMetadataService.js',
                            'js/controllers/MetadataQueryBuilderController.js',
                            'js/controllers/metadata/MetadataController.js',
                            'js/controllers/metadata/resource/ModalMetadataResourceCreateController.js',
                            'js/controllers/metadata/resource/ModalMetadataResourceDetailsController.js',
                            'js/controllers/metadata/resource/ModalMetadataResourceEditController.js'
                        ]
                    });
                }]
            }
        })
/*
        .state("metadata", {
          abtract: true,
          url:"/metadata/:id",
          templateUrl:"views/metadata/resource/resource.html",
          controller: "MetadataResourceController",
          resolve: {
            deps: ['$ocLazyLoad', function($ocLazyLoad) {
              return $ocLazyLoad.load([
                {
                  name: 'AgaveToGo',
                    files: [
                      'js/services/FilesMetadataService.js',
                      'js/services/MetadataService.js',
                      'js/controllers/metadata/resource/MetadataResourceController.js'
                    ]
                }
              ]);
            }]
          }
        })
*/
        .state("metadata.details", {
          url: "",
          templateUrl: "views/metadata/resource/details.html",
          controller: "MetadataResourceDetailsController",
          resolve: {
              deps: ['$ocLazyLoad', function($ocLazyLoad) {
                return $ocLazyLoad.load([
                  {
                    name: 'AgaveToGo',
                    files: [
                        'js/services/ActionsService.js',
                        'js/services/MessageService.js',
                        'js/services/PermissionsService.js',
                        'js/services/FilesMetadataService.js',
                        'js/services/MetadataService.js',
                        'js/controllers/metadata/resource/MetadataResourceDetailsController.js'
                    ]
                  }
                ]);
              }]
          }
        })
        .state('metadata-add', {
            url: "/metadata/add/:schemauuid",
            templateUrl: "views/metadata/resource/add.html",
            controller: "MetadataResourceAddController",
            resolve: {
                deps: ['$ocLazyLoad', function($ocLazyLoad) {
                  return $ocLazyLoad.load([
                    {
                      serie: true,
                      name: 'AgaveToGo',
                      files: [
                          'js/services/ActionsService.js',
                          'js/services/MessageService.js',
                          'js/services/MetadataService.js',
                          'js/controllers/metadata/resource/MetadataResourceAddController.js'
                      ]
                    }
                  ]);
                }]
            }
        })

        .state('metadata-add-association', {
            url: "/metadata/association/add/:uuid?filename",
            params:{
              filename: '',
            },
            templateUrl: "views/metadata/resource/association.html",
            controller: "MetadataResourceAddAssociationController",
            resolve: {
                deps: ['$ocLazyLoad', function($ocLazyLoad) {
                  return $ocLazyLoad.load([
                    {
                      serie: true,
                      name: 'AgaveToGo',
                      files: [
                          'js/services/ActionsService.js',
                          'js/services/MessageService.js',
                          'js/controllers/MetadataQueryBuilderController.js',
                          'js/controllers/metadata/resource/MetadataResourceAddAssociationController.js'
                      ]
                    }
                  ]);
                }]
            }
        })

        .state('metadata-edit', {
            url: "/metadata/edit/:uuid",
            templateUrl: "views/metadata/resource/edit.html",
            controller: "MetadataResourceEditController",
            resolve: {
                deps: ['$ocLazyLoad', function($ocLazyLoad) {
                  return $ocLazyLoad.load([
                    {
                      serie: true,
                      name: 'AgaveToGo',
                      files: [
                          'js/services/ActionsService.js',
                          'js/services/MessageService.js',
                          'js/services/MetadataService.js',
                          'js/controllers/metadata/resource/MetadataResourceEditController.js'
                      ]
                    }
                  ]);
                }]
            }
        })

        .state('metadata-unapproved', {
            url: "/metadata/unapproved",
            templateUrl: "views/metadata/resource/unapproved.html",
            controller: "MetadataResourceUnapprovedController",
            resolve: {
                deps: ['$ocLazyLoad', function($ocLazyLoad) {
                  return $ocLazyLoad.load([
                    {
                      serie: true,
                      name: 'AgaveToGo',
                      files: [
                          'js/services/ActionsService.js',
                          'js/services/MessageService.js',
                          'js/services/MetadataService.js',
                          'js/controllers/metadata/resource/MetadataResourceUnapprovedController.js',
                          'js/controllers/metadata/resource/ModalMetadataResourceDetailsController.js',
                          'js/controllers/metadata/resource/ModalMetadataResourceEditController.js',
                          'js/services/FilesMetadataService.js'
                      ]
                    }
                  ]);
                }]
            }
        })

        /**********************************************************************/
        /**********************************************************************/
        /***                                                                ***/
        /***                       MetadataSchemas Routes                           ***/
        /***                                                                ***/
        /**********************************************************************/
        /**********************************************************************/

        // MetadataSchemas
        .state('metadataschemas-manage', {
            url: "/metadataschemas",
            templateUrl: "views/metadataschemas/manager.html",
            data: {pageTitle: 'Metadata Schemas Manager'},
            controller: "MetadataSchemasController",
            resolve: {
                deps: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        serie: true,
                        name: 'AgaveToGo',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [
                            '../assets/global/scripts/datatable.js',
                            '../bower_components/holderjs/holder.js',
                            'js/services/ActionsService.js',
                            'js/services/MessageService.js',
                            'js/controllers/MetadataQueryBuilderController.js',
                            'js/controllers/metadataschemas/MetadataSchemasController.js'
                        ]
                    });
                }]
            }
        })

        .state("metadataschemas", {
          abtract: true,
          url:"/metadataschemas/:id",
          templateUrl:"views/metadataschemas/resource/resource.html",
          controller: "MetadataSchemasResourceController",
          resolve: {
            deps: ['$ocLazyLoad', function($ocLazyLoad) {
              return $ocLazyLoad.load([
                {
                  name: 'AgaveToGo',
                    files: [
                      'js/controllers/metadataschemas/resource/MetadataSchemasResourceController.js'
                    ]
                }
              ]);
            }]
          }
        })

        .state("metadataschemas.details", {
          url: "",
          templateUrl: "views/metadataschemas/resource/details.html",
          controller: "MetadataSchemasResourceDetailsController",
          resolve: {
              deps: ['$ocLazyLoad', function($ocLazyLoad) {
                return $ocLazyLoad.load([
                  {
                    name: 'AgaveToGo',
                    files: [
                        'js/services/ActionsService.js',
                        'js/services/MessageService.js',
                        'js/services/PermissionsService.js',
                        'js/controllers/metadataschemas/resource/MetadataSchemasResourceDetailsController.js'
                    ]
                  }
                ]);
              }]
          }
        })

        /**********************************************************************/
        /**********************************************************************/
        /***                                                                ***/
        /***                       DataDescriptors Routes                   ***/
        /***                                                                ***/
        /**********************************************************************/
        /**********************************************************************/


        .state('datadescriptors-manage', {
            url: "/datadescriptors",
            templateUrl: "views/datadescriptors/manager.html",
            data: {pageTitle: 'Data Descriptors Manager'},
            controller: "DataDescriptorsController",
            resolve: {
                deps: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        serie: true,
                        name: 'AgaveToGo',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [
                            '../assets/global/scripts/datatable.js',
                            '../bower_components/holderjs/holder.js',
                            'js/services/ActionsService.js',
                            'js/services/MessageService.js',
                            'js/services/PermissionsService.js',
                            'js/services/MetadataService.js',
                            'js/services/FilesMetadataService.js',
                            'js/controllers/MetadataQueryBuilderController.js',
                            'js/controllers/datadescriptors/DataDescriptorsController.js',
                            'js/controllers/metadata/resource/ModalMetadataResourceCreateController.js',
                            'js/controllers/metadata/resource/ModalMetadataResourceDetailsController.js',
                            'js/controllers/metadata/resource/ModalMetadataResourceEditController.js'
                        ]
                    });
                }]
            }
        })

        /**********************************************************************/
        /**********************************************************************/
        /***                                                                ***/
        /***                       FileMetadata Routes                           ***/
        /***                                                                ***/
        /**********************************************************************/
        /**********************************************************************/

        // Metadata
        .state('datadescriptor', {
            url: "/datadescriptor/:uuid?action",
            templateUrl: "views/datadescriptor/manager.html",
            data: {pageTitle: 'DataDescriptor'},
            controller: "DataDescriptorController",
            resolve: {
                deps: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        serie: true,
                        name: 'AgaveToGo',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [
                            '../assets/global/scripts/datatable.js',
                            '../bower_components/holderjs/holder.js',
                            'js/services/ActionsService.js',
                            'js/services/MessageService.js',
                            'js/services/FilesMetadataService.js',
                            'js/services/MetadataService.js',
                            'js/controllers/MetadataQueryBuilderController.js',
                            '../bower_components/bootstrap-datepicker/dist/js/bootstrap-datepicker.min.js',
                            //'../bower_components/uh-togo-angular-filemanager/dist/angular-filemanager.min.js  ',
                            '../assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker.min.css',
                            'js/controllers/datadescriptor/DataDescriptorController.js',
                            'js/controllers/metadata/resource/ModalMetadataResourceCreateController.js',
                            'js/controllers/metadata/resource/ModalMetadataResourceEditController.js',
                            'js/controllers/metadata/resource/ModalMetadataResourceDetailsController.js'
                        ]
                    });
                }]
            }
        })

        .state('filemetadata-manage', {
            url: "/filemetadata/:uuid?action",
            templateUrl: "views/filemetadata/manager.html",
            data: {pageTitle: 'File Metadata Manager'},
            controller: "FileMetadataController",
            resolve: {
                deps: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        serie: true,
                        name: 'AgaveToGo',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [
                            '../assets/global/scripts/datatable.js',
                            '../bower_components/holderjs/holder.js',
                            'js/services/ActionsService.js',
                            'js/services/MessageService.js',
                            'js/services/FilesMetadataService.js',
                            'js/services/MetadataService.js',
                            'js/controllers/MetadataQueryBuilderController.js',
                            '../bower_components/bootstrap-datepicker/dist/js/bootstrap-datepicker.min.js',
                            '../assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker.min.css',
                            'js/controllers/filemetadata/FileMetadataController.js',
                            'js/controllers/metadata/resource/ModalMetadataResourceCreateController.js',
                            'js/controllers/metadata/resource/ModalMetadataResourceEditController.js',
                            'js/controllers/metadata/resource/ModalMetadataResourceDetailsController.js'
                        ]
                    });
                }]
            }
        })

        .state("filemetadata", {
          //abtract: true,
          url:"/filemetadata/:id",
          templateUrl:"views/filemetadata/resource/resource.html",
          controller: "FileMetadataResourceController",
          resolve: {
            deps: ['$ocLazyLoad', function($ocLazyLoad) {
              return $ocLazyLoad.load([
                {
                  name: 'AgaveToGo',
                    files: [
                      'js/services/ActionsService.js',
                      'js/services/MessageService.js',
                      'js/controllers/filemetadata/resource/FileMetadataResourceController.js'
                    ]
                }
              ]);
            }]
          }
        })


        .state('filemetadata-add', {
            url: "/filemetadata/add/:uuid/:schemauuid",
            templateUrl: "views/filemetadata/resource/add.html",
            controller: "FileMetadataResourceAddController",
            resolve: {
                deps: ['$ocLazyLoad', function($ocLazyLoad) {
                  return $ocLazyLoad.load([
                    {
                      serie: true,
                      name: 'AgaveToGo',
                      files: [
                          'js/services/ActionsService.js',
                          'js/services/MessageService.js',
                          'js/services/MetadataService.js',
                          'js/controllers/filemetadata/resource/FileMetadataResourceAddController.js'
                      ]
                    }
                  ]);
                }]
            }
        })

        .state('filemetadata-multipleadd', {
            url: "/filemetadata/multiple/add/?fileUuids?filePaths}",
            params:{
              //schemauuid:'',
              //fileObjs: null
              fileUuids: { array: true },
              filePaths: { array: true }
            },
            templateUrl: "views/filemetadata/resource/multipleadd.html",
            controller: "FileMetadataResourceMultipleAddController",
            resolve: {
                deps: ['$ocLazyLoad', function($ocLazyLoad) {
                  return $ocLazyLoad.load([
                    {
                      serie: true,
                      name: 'AgaveToGo',
                      files: [
                          'js/services/ActionsService.js',
                          'js/services/MessageService.js',
                          'js/services/MetadataService.js',
                          'js/services/FilesMetadataService.js',
                          'js/controllers/MetadataQueryBuilderController.js',
                          'js/services/MetadataService.js',
                          'js/controllers/filemetadata/resource/FileMetadataResourceMultipleAddController.js',
                          'js/controllers/metadata/resource/ModalMetadataResourceCreateController.js',
                          'js/controllers/metadata/resource/ModalMetadataResourceEditController.js',
                          'js/controllers/metadata/resource/ModalMetadataResourceDetailsController.js'
                      ]
                    }
                  ]);
                }]
            }
        })

        .state('filemetadata-edit', {
            url: "/filemetadata/edit/:uuid/:filemetadatauuid",
            templateUrl: "views/filemetadata/resource/edit.html",
            controller: "FileMetadataResourceEditController",
            resolve: {
                deps: ['$ocLazyLoad', function($ocLazyLoad) {
                  return $ocLazyLoad.load([
                    {
                      serie: true,
                      name: 'AgaveToGo',
                      files: [
                          'js/services/ActionsService.js',
                           'js/services/MessageService.js',
                          'js/controllers/MetadataQueryBuilderController.js',
                          'js/controllers/filemetadata/resource/FileMetadataResourceEditController.js'
                      ]
                    }
                  ]);
                }]
            }
        })

        /**********************************************************************/
        /**********************************************************************/
        /***                                                                ***/
        /***                       Postits Routes                           ***/
        /***                                                                ***/
        /**********************************************************************/
        /**********************************************************************/

        // Postits
        .state('postits-manage', {
            url: "/postits",
            templateUrl: "views/postits/manager.html",
            data: {pageTitle: 'Postits Manager'},
            controller: "PostitsListController",
            resolve: {
                deps: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        serie: true,
                        name: 'AgaveToGo',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [
                            '../assets/global/scripts/datatable.js',
                            '../bower_components/holderjs/holder.js',
                            '../bower_components/clipboard/dist/clipboard.js',
                            '../bower_components/ngclipboard/dist/ngclipboard.js',
                            'js/services/ActionsService.js',
                            'js/services/MessageService.js',
                            'js/controllers/QueryBuilderController.js',
                            'js/controllers/postits/PostitsListController.js'
                        ]
                    });
                }]
            }
        })
        /*
        .state("postits", {
          abtract: true,
          url:"/postits/:id",
          templateUrl:"views/postits/resource/resource.html",
          controller: "PostitsListResourceController",
          resolve: {
            deps: ['$ocLazyLoad', function($ocLazyLoad) {
              return $ocLazyLoad.load([
                {
                  name: 'AgaveToGo',
                    files: [
                      'js/controllers/postits/resource/PostitsListResourceController.js'
                    ]
                }
              ]);
            }]
          }
        })

        .state("postits.details", {
          url: "",
          templateUrl: "views/postits/resource/details.html",
          controller: "PostitsListResourceDetailsController",
          resolve: {
              deps: ['$ocLazyLoad', function($ocLazyLoad) {
                return $ocLazyLoad.load([
                  {
                    name: 'AgaveToGo',
                    files: [
                        'js/services/ActionsService.js',
                        'js/services/MessageService.js',
                        'js/services/PermissionsService.js',
                        'js/controllers/postits/resource/PostitsListResourceDetailsController.js'
                    ]
                  }
                ]);
              }]
          }
        })
        */


        /**********************************************************************/
        /**********************************************************************/
        /***                                                                ***/
        /***                       Search Routes                           ***/
        /***                                                                ***/
        /**********************************************************************/
        /**********************************************************************/

        // Search
        .state('search', {
            url: "/search",
            templateUrl: "views/search/explorer.html",
            data: {pageTitle: 'Ike Wai Search'},
            controller: "SearchController",
            resolve: {
                deps: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        serie: true,
                        name: 'AgaveToGo',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [
                            '../assets/global/scripts/datatable.js',
                            '../bower_components/holderjs/holder.js',
                            'js/services/ActionsService.js',
                            'js/services/MessageService.js',
                            'js/services/FilesMetadataService.js',
                            'js/services/MetadataService.js',
                            'js/controllers/MetadataQueryBuilderController.js',
                            'js/controllers/search/SearchController.js'
                        ]
                    });
                }]
            }
        })

        .state('basic-search', {
            url: "/basic-search",
            templateUrl: "views/search/basic-search.html",
            data: {pageTitle: 'Search Ike'},
            controller: "BasicSearchController",
            resolve: {
                deps: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        serie: true,
                        name: 'AgaveToGo',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [
                            '../assets/global/scripts/datatable.js',
                            '../bower_components/holderjs/holder.js',
                            'js/services/ActionsService.js',
                            'js/services/MessageService.js',
                            'js/services/PermissionsService.js',
                            'js/services/MetadataService.js',
                            'js/services/FilesMetadataService.js',
                            'js/controllers/MetadataQueryBuilderController.js',
                            'js/controllers/search/BasicSearchController.js',
                            'js/controllers/metadata/resource/ModalMetadataResourceDetailsController.js',
                        ]
                    });
                }]
            }
        })

        .state('faceted-search', {
            url: "/faceted-search",
            templateUrl: "views/search/faceted-search.html",
            data: {pageTitle: 'Search Ike'},
            controller: "FacetedSearchController",
            resolve: {
                deps: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        serie: true,
                        name: 'AgaveToGo',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [
                            '../assets/global/scripts/datatable.js',
                            '../bower_components/holderjs/holder.js',
                            'js/services/ActionsService.js',
                            'js/services/MessageService.js',
                            'js/services/PermissionsService.js',
                            'js/services/MetadataService.js',
                            'js/services/FilesMetadataService.js',
                            'js/controllers/MetadataQueryBuilderController.js',
                            'js/controllers/search/FacetedSearchController.js',
                            'js/controllers/metadata/resource/ModalMetadataResourceDetailsController.js',
                        ]
                    });
                }]
            }
        })

        .state('map-search', {
            url: "/map-search",
            templateUrl: "views/search/map-search.html",
            data: {pageTitle: 'Search Ike'},
            controller: "MapSearchController",
            resolve: {
                deps: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        serie: true,
                        name: 'AgaveToGo',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [
                            '../assets/global/scripts/datatable.js',
                            '../bower_components/holderjs/holder.js',
                            'js/services/ActionsService.js',
                            'js/services/MessageService.js',
                            'js/services/PermissionsService.js',
                            'js/services/MetadataService.js',
                            'js/services/FilesMetadataService.js',
                            'js/controllers/MetadataQueryBuilderController.js',
                            'js/controllers/search/MapSearchController.js',
                            'js/controllers/metadata/resource/ModalMetadataResourceDetailsController.js',
                        ]
                    });
                }]
            }
        })

        /**********************************************************************/
        /**********************************************************************/
        /***                                                                ***/
        /***                       Study Routes                           ***/
        /***                                                                ***/
        /**********************************************************************/
        /**********************************************************************/

        // Studies
        .state('studies', {
            url: "/studies",
            templateUrl: "views/studies/manager.html",
            data: {pageTitle: 'Ike Wai Studies'},
            controller: "StudiesController",
            resolve: {
                deps: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        serie: true,
                        name: 'AgaveToGo',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [
                            '../assets/global/scripts/datatable.js',
                            '../bower_components/holderjs/holder.js',
                            'js/services/ActionsService.js',
                            'js/services/MessageService.js',
                            'js/services/FilesMetadataService.js',
                            'js/services/MetadataService.js',
                            'js/controllers/MetadataQueryBuilderController.js',
                            'js/controllers/studies/StudiesController.js'
                        ]
                    });
                }]
            }
        })

        // Studies
        .state('studies-add', {
            url: "/studies/add",
            templateUrl: "views/studies/resource/add.html",
            data: {pageTitle: 'Ike Wai Add Studies'},
            controller: "StudiesResourceAddController",
            resolve: {
                deps: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        serie: true,
                        name: 'AgaveToGo',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [
                            '../assets/global/scripts/datatable.js',
                            '../bower_components/holderjs/holder.js',
                            'js/services/ActionsService.js',
                            'js/services/MessageService.js',
                            'js/services/FilesMetadataService.js',
                            'js/services/MetadataService.js',
                            'js/controllers/MetadataQueryBuilderController.js',
                            'js/controllers/studies/resource/StudiesResourceAddController.js'
                        ]
                    });
                }]
            }
        })

        .state("study-details", {
          url: "/studies/details/:id",
          templateUrl: "views/studies/resource/details.html",
          controller: "StudiesResourceDetailsController",
          resolve: {
              deps: ['$ocLazyLoad', function($ocLazyLoad) {
                return $ocLazyLoad.load([
                  {
                    name: 'AgaveToGo',
                    files: [
                        'js/services/ActionsService.js',
                        'js/services/MessageService.js',
                        'js/services/PermissionsService.js',
                        'js/services/FilesMetadataService.js',
                        'js/services/MetadataService.js',
                        'js/controllers/studies/resource/StudiesResourceDetailsController.js'
                    ]
                  }
                ]);
              }]
          }
        })

        .state("study-edit-locations", {
          url: "/studies/edit/locations/:id",
          templateUrl: "views/studies/resource/edit-locations.html",
          controller: "StudiesResourceEditLocationsController",
          resolve: {
              deps: ['$ocLazyLoad', function($ocLazyLoad) {
                return $ocLazyLoad.load([
                  {
                    name: 'AgaveToGo',
                    files: [
                        'js/services/ActionsService.js',
                        'js/services/MessageService.js',
                        'js/services/PermissionsService.js',
                        'js/services/FilesMetadataService.js',
                        'js/services/MetadataService.js',
                        'js/controllers/studies/resource/StudiesResourceEditLocationsController.js'
                    ]
                  }
                ]);
              }]
          }
        })

        /**********************************************************************/
        /**********************************************************************/
        /***                                                                ***/
        /***                       Stagged File Routes                           ***/
        /***                                                                ***/
        /**********************************************************************/
        /**********************************************************************/

        .state("stagged", {
          url: "/stagged",
          templateUrl: "views/stagged/manage.html",
          controller: "StaggedController",
          resolve: {
              deps: ['$ocLazyLoad', function($ocLazyLoad) {
                return $ocLazyLoad.load([
                  {
                    name: 'AgaveToGo',
                    files: [
                        'js/services/ActionsService.js',
                        'js/services/MessageService.js',
                        'js/services/FilesMetadataService.js',
                        'js/services/MetadataService.js',
                        'js/controllers/stagged/StaggedController.js',
                        'js/controllers/stagged/ModalRejectStagingRequestController.js'
                    ]
                  }
                ]);
              }]
          }
        })

        /**********************************************************************/
        /**********************************************************************/
        /***                                                                ***/
        /***                       Impersonate Routes                           ***/
        /***                                                                ***/
        /**********************************************************************/
        /**********************************************************************/

        .state("impersonate", {
          url: "/impersonate",
          templateUrl: "views/impersonate/manage.html",
          controller: "ImpersonateController",
          resolve: {
              deps: ['$ocLazyLoad', function($ocLazyLoad) {
                return $ocLazyLoad.load([
                  {
                    name: 'AgaveToGo',
                    files: [
                        'js/services/ActionsService.js',
                        'js/services/MessageService.js',
                        'js/services/FilesMetadataService.js',
                        'js/services/MetadataService.js',
                        'js/controllers/impersonate/ImpersonateController.js'
                    ]
                  }
                ]);
              }]
          }
        })

        .state('help', {
            url: "/help",
            templateUrl: "views/help/help.html",
            data: {pageTitle: 'Help'},
            controller: "GeneralPageController",
            resolve: {
                deps: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load([{
                        name: 'AgaveToGo',
                        files: [
                            'js/controllers/GeneralPageController.js'
                        ]
                    }]);
                }]
            }
        })

        .state('feedback', {
            url: "/feedback",
            templateUrl: "views/help/feedback.html",
            data: {pageTitle: 'Help'},
            controller: "GeneralPageController",
            resolve: {
                deps: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load([{
                        name: 'AgaveToGo',
                        files: [
                            'js/controllers/GeneralPageController.js'
                        ]
                    }]);
                }]
            }
        })

	    .state('walkthrough', {
	        url: "/walkthrough",
	        templateUrl: "views/help/walkthrough.html",
	        data: {pageTitle: 'Walkthrough'},
	        controller: "GeneralPageController",
	        resolve: {
	            deps: ['$ocLazyLoad', function($ocLazyLoad) {
	                return $ocLazyLoad.load([{
	                    name: 'AgaveToGo',
	                    files: [
	                        'js/controllers/GeneralPageController.js'
	                    ]
	                }]);
	            }]
	        }
	    })

}]);

/* Init global settings and run the app */
//AgaveToGo.run(["$rootScope", "settings", "$state", 'ProfilesController', function($rootScope, settings, $state) { //}, ProfilesController) {
AgaveToGo.run(['$rootScope', 'settings', '$state', '$http', '$templateCache', '$localStorage', '$window', 'CacheFactory', 'NotificationsService','Idle','$interval', function($rootScope, settings, $state, $http, $templateCache, $localStorage, $window, CacheFactory, NotificationsService, Idle, $interval) {
    $rootScope.$state = $state; // state to be accessed from view
    $rootScope.$settings = settings; // state to be accessed from view

    $http.defaults.cache = CacheFactory('defaultCache', {
        maxAge: 24 * 60 * 60 * 1000, // Items added to this cache expire after 1 day
        cacheFlushInterval: 30 * 24 * 60 * 60 * 1000, // This cache will clear itself every 30 days
        deleteOnExpire: 'aggressive', // Items will be deleted from this cache when they expire
        storageMode: 'localStorage'
    });


    $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams){
        // Temp fix until I find better solution
        // This is to avoid changing url location on filemanager promise returns
        if ((fromState.name === 'data-explorer-noslash' || fromState.name === 'data-explorer') && (toState.name !== 'data-explorer-noslash' || toState.name !== 'data-explorer')){
          $rootScope.locationChange = false;
        } else {
          $rootScope.locationChange = true;
        }

        if (typeof $localStorage.token !== 'undefined'){
          var currentDate = new Date();
          var expirationDate = Date.parse($localStorage.token.expires_at);
          var diff = (expirationDate - currentDate) / 60000;
          if (diff < 0) {
            $window.location.href = '/auth';
          }
        } else {
          $window.location.href = '/auth';
        }
    });
    Idle.watch();
     /*$interval(function() {
        console.log('HEY');
    }, 1000);*/
}]);
