describe('SystemsResourceAppsController', function() {
    var tester, injector, systemId, limit, offset, apps, TestConfiguration, $injector, $rootScope, $scope, $stateParams, $translate, AppsController, MessageService;

    beforeEach(function(){
      module('AgaveToGo');
      module('AgavePlatformScienceAPILib');
      module('pascalprecht.translate');
      module('ui.bootstrap');
      module('ui.router');
    });

    beforeEach(function() {
      // increase request timeouts
      jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;
      tester = ngMidwayTester('AgavePlatformScienceAPILib');
      TestConfiguration = tester.inject('TestConfiguration');
      Configuration = tester.injector().get('Configuration');
      Configuration.BASEURI = TestConfiguration.BASEURI;
      Configuration.oAuthAccessToken = TestConfiguration.oAuthAccessToken;

      AppsController = tester.inject('AppsController');
      tester.digest();
    });

    afterEach(function() {
      tester.destroy();
      tester = null;
    });

    it('$scope.refresh AppsController.listApp real https', function(done) {
      systemId = 'docker.tacc.utexas.edu'
      limit = 99999
      offset = 0
      AppsController.listApps(limit, offset, { 'executionapps[0].like': systemId })
        .then(function(response) {
            apps = response.result;
            expect(apps).not.toEqual(undefined);
            expect(apps[0].id).toBeDefined();
            expect(apps[0].name).toBeDefined();
            expect(apps[0].version).toBeDefined();
            expect(apps[0].revision).toBeDefined();
            expect(apps[0].executionSystem).toBeDefined();
            expect(apps[0].shortDescription).toBeDefined();
            expect(apps[0].isPublic).toBeDefined();
            expect(apps[0].label).toBeDefined();
            expect(apps[0].lastModified).toBeDefined();
            expect(apps[0]._links.self.href).toBeDefined();
            done();
        }, function(response) {
            var errorMessage = 'https fail';
            if (response.errorResponse){
              if (typeof response.errorResponse.message !== 'undefined') {
                errorMessage = response.errorResponse.message
              } else if (typeof response.errorResponse.fault !== 'undefined'){
                errorMessage = response.errorResponse.fault.message;
              }
                done(errorMessage);
            } else {
                done.fail(errorMessage);
            }
        });
    });

    it('$scope.refresh - AppsController.listApp mock', inject(function($rootScope, $controller,  $injector, $state, $stateParams, $q, $translate, SystemsController, RolesService, ActionsService, MessageService) {
      systemId = 'docker.tacc.utexas.edu';
      limit = 99999;
      offset = 0;
      var listApps = function(limit, $offset, { 'executionapps[0].like': systemId }) {
       return {
         then: function(callback) {
           return callback({result:[
             {
               "id": "cloud-runner-0.1.0",
               "name": "cloud-runner",
               "version": "0.1.0",
               "revision": 3,
               "executionSystem": "docker.tacc.utexas.edu",
               "shortDescription": "Generic template for running arbitrary code in Agave's Dockerized cloud.",
               "isPublic": false,
               "label": "Run your code in the cloud",
               "lastModified": "2016-07-18T15:19:23.000-05:00",
               "_links": {
                 "self": {
                   "href": "https://public.agaveapi.co/apps/v2/cloud-runner-0.1.0"
                 }
               }
             }
           ]});
         }
       };
     };

      spyOn(AppsController, 'listApps').and.callFake(listApps);
      var scope = $rootScope.$new();
      $stateParams.systemId = 'docker.tacc.utexas.edu';

      var SystemsResourceAppsController = $controller('SystemsResourceAppsController', {
        $scope: scope,
        $rootScope: $rootScope,
        $stateParams: $stateParams,
        $translate: $translate,
        AppsController: AppsController,
        MessageService: MessageService
      });

      expect(SystemsResourceAppsController).toBeDefined();
      expect(scope.limit).toBe(99999);
      expect(scope.offset).toBe(0);
      expect(scope.apps.length).toBe(1);
      expect(scope.apps[0].id).toBe('cloud-runner-0.1.0')
      expect(scope.apps[0].name).toBe('cloud-runner')
      expect(scope.apps[0].version).toBe('0.1.0')
      expect(scope.apps[0].revision).toBe(3)
      expect(scope.apps[0].executionSystem).toBe('docker.tacc.utexas.edu')
      expect(scope.apps[0].shortDescription).toBe('Generic template for running arbitrary code in Agave\'s Dockerized cloud.')
      expect(scope.apps[0].isPublic).toBe(false)
      expect(scope.apps[0].label).toBe('Run your code in the cloud')
      expect(scope.apps[0].lastModified).toBe('2016-07-18T15:19:23.000-05:00')
      expect(scope.apps[0]._links.self.href).toBe('https://public.agaveapi.co/apps/v2/cloud-runner-0.1.0')
    }));
});
