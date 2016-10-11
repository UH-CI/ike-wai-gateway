describe('MonitorsManagerDirectoryController', function() {
    var tester, injector, TestConfiguration, ActionsService, Configuration, MessageService, MonitorsController;

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

      MonitorsController = tester.inject('MonitorsController');
      tester.digest();
    });

    afterEach(function() {
      tester.destroy();
      tester = null;
    });

    it('$scope.refresh MonitorsController.searchMonitors real https', function(done) {
      MonitorsController.searchMonitors('')
          .then(function(response) {
              monitors = response.result;
              expect(monitors).not.toEqual(undefined);
              if (monitors.length > 0){
                  expect(monitors[0].id).toBeDefined();
                  expect(monitors[0].target).toBeDefined();
                  expect(monitors[0].active).toBeDefined();
                  expect(monitors[0].frequency).toBeDefined();
                  expect(monitors[0].lastUpdated).toBeDefined();
                  expect(monitors[0]._links.self.href).toBeDefined();
                  expect(monitors[0]._links.history.href).toBeDefined();
                  expect(monitors[0]._links.checks.href).toBeDefined();
                  expect(monitors[0]._links.target.href).toBeDefined();
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

    it('$scope.refresh - MonitorsController.searchMonitors mock', inject(function($rootScope, $controller, $stateParams, $translate, MonitorsController, ActionsService, MessageService) {
      var searchMonitors = function() {
       return {
         then: function(callback) {
           return callback({result:[
             {
           		"id": "2126446968775250406-242ac11e-0001-014",
           		"target": "stampede-mrojas3",
           		"updateSystemStatus": false,
           		"active": true,
           		"frequency": 720,
           		"lastSuccess": "2016-09-19T22:34:17.000-05:00",
           		"lastUpdated": "2016-09-20T08:34:16.000-05:00",
           		"_links": {
           			"self": {
           				"href": "https://api.araport.org/monitor/v2/2126446968775250406-242ac11e-0001-014"
           			},
           			"history": {
           				"href": "https://api.araport.org/monitor/v2/2126446968775250406-242ac11e-0001-014/history"
           			},
           			"checks": {
           				"href": "https://api.araport.org/monitor/v2/2126446968775250406-242ac11e-0001-014/checks"
           			},
           			"target": {
           				"href": "https://api.araport.org/systems/v2/stampede-mrojas3"
           			}
           		}
           	}
           ]});
         }
       };
     };

      spyOn(MonitorsController, 'searchMonitors').and.callFake(searchMonitors);
      var scope = $rootScope.$new();
      var MonitorsManagerDirectoryController = $controller('MonitorsManagerDirectoryController', {
        $scope: scope,
        $rootScope: $rootScope,
        $stateParams: $stateParams,
        $translate: $translate,
        MonitorsController: MonitorsController,
        ActionsService: ActionsService,
        MessageService: MessageService
      });

      expect(MonitorsManagerDirectoryController).toBeDefined();
      expect(scope._COLLECTION_NAME).toBe('monitors');
      expect(scope._RESOURCE_NAME).toBe('monitor');
      expect(scope.sortType).toBe('target');
      expect(scope.sortReverse).toBe(false);
      expect(scope[scope._COLLECTION_NAME].length).toBe(1);
      expect(scope[scope._COLLECTION_NAME][0].id).toBe('2126446968775250406-242ac11e-0001-014');
      expect(scope[scope._COLLECTION_NAME][0].target).toBe('stampede-mrojas3');
      expect(scope[scope._COLLECTION_NAME][0].updateSystemStatus).toBe(false);
      expect(scope[scope._COLLECTION_NAME][0].active).toBe(true);
      expect(scope[scope._COLLECTION_NAME][0].frequency).toBe(720);
      expect(scope[scope._COLLECTION_NAME][0].lastSuccess).toBe('2016-09-19T22:34:17.000-05:00');
      expect(scope[scope._COLLECTION_NAME][0].lastUpdated).toBe('2016-09-20T08:34:16.000-05:00');
      expect(scope[scope._COLLECTION_NAME][0]._links.self.href).toBe('https://api.araport.org/monitor/v2/2126446968775250406-242ac11e-0001-014');
      expect(scope[scope._COLLECTION_NAME][0]._links.history.href).toBe('https://api.araport.org/monitor/v2/2126446968775250406-242ac11e-0001-014/history');
      expect(scope[scope._COLLECTION_NAME][0]._links.checks.href).toBeDefined('https://api.araport.org/monitor/v2/2126446968775250406-242ac11e-0001-014/checks');
      expect(scope[scope._COLLECTION_NAME][0]._links.target.href).toBeDefined('https://api.araport.org/systems/v2/stampede-mrojas3');
    }));
});
