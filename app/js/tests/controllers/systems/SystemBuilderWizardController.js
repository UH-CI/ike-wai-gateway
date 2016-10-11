describe('SystemBuilderWizardController', function() {
    var tester, injector, $timeout, $rootScope, $scope, $state, $stateParams, $uibModal, $localStorage, $location, $translate, WizardHandler, SystemsController, FilesController, MessageService;

    beforeEach(function(){
      module('AgaveToGo');
      module('AgavePlatformScienceAPILib');
      module('pascalprecht.translate');
      module('schemaForm');
      module('schemaFormWizard');
      module('ui.bootstrap');
      module('ui.router');
      module('ui.select');
    });

    beforeEach(function() {
      // increase request timeouts
      jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;
      tester = ngMidwayTester('AgavePlatformScienceAPILib');
      TestConfiguration = tester.inject('TestConfiguration');
      Configuration = tester.injector().get('Configuration');
      Configuration.BASEURI = TestConfiguration.BASEURI;
      Configuration.oAuthAccessToken = TestConfiguration.oAuthAccessToken;

      SystemsController = tester.inject('SystemsController');
      FilesController = tester.inject('FilesController');
      tester.digest();
    });

    afterEach(function() {
      tester.destroy();
      tester = null;
    });

    it('$scope.fetchSystems() - SystemsController.listSystems real https', function(done) {
      SystemsController.listSystems(99999)
          .then(function(response) {
              systems = response.result;
              expect(systems).not.toEqual(undefined);
              if (systems.length > 0){
                  expect(systems[0].id).toBeDefined();
                  expect(systems[0].name).toBeDefined();
                  expect(systems[0].type).toBeDefined();
                  expect(systems[0].description).toBeDefined();
                  expect(systems[0].status).toBeDefined();
                  expect(systems[0].public).toBeDefined();
                  expect(systems[0].lastUpdated).toBeDefined();
                  expect(systems[0].default).toBeDefined();
                  expect(systems[0]._links.self.href).toBeDefined();
              }
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

    it('$scope.fetchSystems() - SystemsController.listSystems mock', inject(function($rootScope, $controller, $timeout, $state, $stateParams, $uibModal, $localStorage, $location, $translate, WizardHandler, SystemsController, FilesController, MessageService) {
      var listSystems = function() {
       return {
         then: function(callback) {
           return callback({result:[
             {
            	"id": "docker.tacc.utexas.edu",
            	"name": "Demo Docker VM",
            	"type": "EXECUTION",
            	"description": "Cloud VM used for Docker demonstrations and tutorials.",
            	"status": "UP",
            	"public": true,
            	"lastUpdated": "2016-09-15T04:20:16.000-05:00",
            	"default": false,
            	"_links": {
            		"self": {
            			"href": "https://public.agaveapi.co/systems/v2/docker.tacc.utexas.edu"
            		}
            	}
            }
          ]});
         }
       }
      };

      var scope = $rootScope.$new();
      spyOn(SystemsController, 'listSystems').and.callFake(listSystems);

      var SystemBuilderWizardController = $controller('SystemBuilderWizardController', {
        $scope: scope,
        $rootScope: $rootScope,
        $timeout: $timeout,
        $state: $state,
        $stateParams: $stateParams,
        $uibModal: $uibModal,
        $localStorage: $localStorage,
        $location: $location,
        $translate: $translate,
        WizardHandler: WizardHandler,
        SystemsController: SystemsController,
        FilesController: FilesController,
        MessageService: MessageService
      });

      scope.fetchSystems();
      expect(scope.systems).toBeDefined();
      expect(scope.systems[0].id).toBe('docker.tacc.utexas.edu');
      expect(scope.systems[0].name).toBe('Demo Docker VM');
      expect(scope.systems[0].type).toBe('EXECUTION');
      expect(scope.systems[0].description).toBe('Cloud VM used for Docker demonstrations and tutorials.');
      expect(scope.systems[0].status).toBe('UP');
      expect(scope.systems[0].public).toBe(true);
      expect(scope.systems[0].lastUpdated).toBe('2016-09-15T04:20:16.000-05:00');
      expect(scope.systems[0].default).toBe(false);
      expect(scope.systems[0]._links.self.href).toBe('https://public.agaveapi.co/systems/v2/docker.tacc.utexas.edu');

    }));
});
