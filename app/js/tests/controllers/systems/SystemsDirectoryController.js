describe('SystemDirectoryController', function() {
    var tester, injector, TestConfiguration, $injector, $rootScope, $scope, $state, $stateParams, $q, $translate, SystemsController, RolesService, ActionsService, MessageService;

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

      SystemsController = tester.inject('SystemsController');
      tester.digest();
    });

    afterEach(function() {
      tester.destroy();
      tester = null;
    });

    it('$scope.refresh SystemsController.searchSystems real https', function(done) {
      SystemsController.searchSystems('')
          .then(function(response) {
              systems = response.result;
              expect(systems).not.toEqual(undefined);
              if (systems.length > 0){
                  expect(systems[0].default).toBeDefined();
                  expect(systems[0].description).toBeDefined();
                  expect(systems[0].id).toBeDefined();
                  expect(systems[0].lastUpdated).toBeDefined();
                  expect(systems[0].name).toBeDefined();
                  expect(systems[0].public).toBeDefined();
                  expect(systems[0].status).toBeDefined();
                  expect(systems[0].type).toBeDefined();
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

    it('$scope.refresh - SystemsController.searchSystems mock', inject(function($rootScope, $controller,  $injector, $state, $stateParams, $q, $translate, SystemsController, RolesService, ActionsService, MessageService) {
      var searchSystems = function() {
       return {
         then: function(callback) {
           return callback({result:[
             {
             	"id": "stampede-mrojas",
             	"name": "Private stampede system",
             	"type": "EXECUTION",
             	"description": "My private stampede system",
             	"status": "UP",
             	"public": false,
             	"lastUpdated": "2016-07-29T17:00:35.000-05:00",
             	"default": true,
             	"_links": {
             		"self": {
             			"href": "https://public.agaveapi.co/systems/v2/stampede-mrojas"
             		}
             	}
             }
           ]});
         }
       };
     };

      spyOn(SystemsController, 'searchSystems').and.callFake(searchSystems);
      var scope = $rootScope.$new();
      var SystemDirectoryController = $controller('SystemDirectoryController', {
        $scope: scope,
        $rootScope: $rootScope,
        $injector: $injector,
        $state: $state,
        $stateParams: $stateParams,
        $q: $q,
        $translate: $translate,
        SystemsController: SystemsController,
        RolesService: RolesService,
        ActionsService: ActionsService,
        MessageService: MessageService
      });

      expect(SystemDirectoryController).toBeDefined();
      expect(scope._COLLECTION_NAME).toBe('systems');
      expect(scope._RESOURCE_NAME).toBe('system');
      expect(scope.sortType).toBe('id');
      expect(scope.sortReverse).toBe(false);
      expect(scope[scope._COLLECTION_NAME].length).toBe(1);
      expect(scope[scope._COLLECTION_NAME][0].id).toBe('stampede-mrojas');
      expect(scope[scope._COLLECTION_NAME][0].name).toBe('Private stampede system');
      expect(scope[scope._COLLECTION_NAME][0].type).toBe('EXECUTION');
      expect(scope[scope._COLLECTION_NAME][0].description).toBe('My private stampede system');
      expect(scope[scope._COLLECTION_NAME][0].status).toBe('UP');
      expect(scope[scope._COLLECTION_NAME][0].public).toBe(false);
      expect(scope[scope._COLLECTION_NAME][0].lastUpdated).toBe('2016-07-29T17:00:35.000-05:00');
      expect(scope[scope._COLLECTION_NAME][0].default).toBe(true);
      expect(scope[scope._COLLECTION_NAME][0]._links.self.href).toBe('https://public.agaveapi.co/systems/v2/stampede-mrojas');
    }));
});
