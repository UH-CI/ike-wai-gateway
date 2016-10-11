describe('MonitorsChecksDirectoryController', function() {
    var tester, injector, monitorId, query, TestConfiguration, Configuration, MessageService, MonitorsController;

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

    it('$scope.refresh - MonitorsController.searchMonitoringTaskChecks real https', function(done) {
      monitorId = '7619208969218888166-242ac11e-0001-014';
      query = '';
      MonitorsController.searchMonitoringTaskChecks(monitorId, query)
          .then(function(response) {
              checks = response.result;
              expect(checks).not.toEqual(undefined);
              if (checks.length > 0){
                  expect(checks[0].id).toBeDefined();
                  expect(checks[0].type).toBeDefined();
                  expect(checks[0].result).toBeDefined();
                  expect(checks[0].message).toBeDefined();
                  expect(checks[0].created).toBeDefined();
                  expect(checks[0]._links.self.href).toBeDefined();
                  expect(checks[0]._links.monitor.href).toBeDefined();
                  expect(checks[0]._links.system.href).toBeDefined();
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

    it('$scope.refresh - MonitorsController.searchMonitoringTaskChecks mock', inject(function($rootScope, $controller, $stateParams, $translate, MonitorsController, ActionsService, MessageService) {
      var searchMonitoringTaskChecks = function(monitorId, query) {
       return {
         then: function(callback) {
           return callback({result:[
            {
              "id": "6684647377673055770-242ac11e-0001-015",
              "type": "LOGIN",
              "result": "PASSED",
              "message": null,
              "created": "2016-09-07T10:13:32.000-05:00",
              "_links": {
                "self": {
                    "href": "https://api.araport.org/monitor/v2/7619208969218888166-242ac11e-0001-014/checks/6684647377673055770-242ac11e-0001-015"
                },
                "monitor": {
                    "href": "https://api.araport.org/monitor/v2/7619208969218888166-242ac11e-0001-014"
                },
                "system": {
                    "href": "https://api.araport.org/systems/v2/stampede-mrojas2"
                }
              }
            }
           ]});
         }
       };
     };

      var handle = function(response, message) {
        return {
          handle: function(response, message) {
            if (typeof response !== 'undefined' && typeof message !== 'undefined'){
              return true;
            }
          }
        };
      };

      spyOn(MonitorsController, 'searchMonitoringTaskChecks').and.callFake(searchMonitoringTaskChecks);
      var scope = $rootScope.$new();
      $stateParams.monitorId = '7619208969218888166-242ac11e-0001-014';

      var MonitorsChecksDirectoryController = $controller('MonitorsChecksDirectoryController', {
        $scope: scope,
        $rootScope: $rootScope,
        $stateParams: $stateParams,
        $translate: $translate,
        MonitorsController: MonitorsController,
        ActionsService: ActionsService,
        MessageService: MessageService
      });


      expect(MonitorsChecksDirectoryController).toBeDefined();
      expect(MonitorsController.searchMonitoringTaskChecks).toHaveBeenCalled();
      expect(scope._COLLECTION_NAME).toBe('monitors');
      expect(scope._RESOURCE_NAME).toBe('monitor');
      expect(scope.sortType).toBe('created');
      expect(scope.sortReverse).toBe(true);

      expect(scope[scope._COLLECTION_NAME].length).toBe(1);
      expect(scope[scope._COLLECTION_NAME][0].id).toBe('6684647377673055770-242ac11e-0001-015');
      expect(scope[scope._COLLECTION_NAME][0].type).toBe('LOGIN');
      expect(scope[scope._COLLECTION_NAME][0].result).toBe('PASSED');
      expect(scope[scope._COLLECTION_NAME][0].message).toBe(null);
      expect(scope[scope._COLLECTION_NAME][0].created).toBe('2016-09-07T10:13:32.000-05:00');
      expect(scope[scope._COLLECTION_NAME][0]._links.self.href).toBe('https://api.araport.org/monitor/v2/7619208969218888166-242ac11e-0001-014/checks/6684647377673055770-242ac11e-0001-015');
      expect(scope[scope._COLLECTION_NAME][0]._links.monitor.href).toBe('https://api.araport.org/monitor/v2/7619208969218888166-242ac11e-0001-014');
      expect(scope[scope._COLLECTION_NAME][0]._links.system.href).toBeDefined('https://api.araport.org/systems/v2/stampede-mrojas2');
    }));
});
