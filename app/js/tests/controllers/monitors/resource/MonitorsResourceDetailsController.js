describe('MonitorsResourceDetailsDirectoryController', function() {
    var tester, injector, monitorId, TestConfiguration, Configuration, MessageService, MonitorsController;

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

    it('$scope.getMonitor - MonitorsController.getMonitoringTask real https', function(done) {
      monitorId = '7619208969218888166-242ac11e-0001-014';
      MonitorsController.getMonitoringTask(monitorId)
          .then(function(response) {
              monitor = response.result;
              expect(monitor).not.toEqual(undefined);
              if (monitor){
                  expect(monitor.id).toBeDefined();
                  expect(monitor.target).toBeDefined();
                  expect(monitor.owner).toBeDefined();
                  expect(monitor.frequency).toBeDefined();
                  expect(monitor.updateSystemStatus).toBeDefined();
                  expect(monitor.internalUsername).toBeDefined();
                  expect(monitor.lastSuccess).toBeDefined();
                  expect(monitor.lastUpdated).toBeDefined();
                  expect(monitor.nextUpdate).toBeDefined();
                  expect(monitor.created).toBeDefined();
                  expect(monitor.active).toBeDefined();
                  expect(monitor.lastCheck.id).toBeDefined();
                  expect(monitor.lastCheck.result).toBeDefined();
                  expect(monitor.lastCheck.message).toBeDefined();
                  expect(monitor.lastCheck.type).toBeDefined();
                  expect(monitor.lastCheck.created).toBeDefined();
                  expect(monitor._links.self.href).toBeDefined();
                  expect(monitor._links.checks.href).toBeDefined();
                  expect(monitor._links.notifications.href).toBeDefined();
                  expect(monitor._links.owner.href).toBeDefined();
                  expect(monitor._links.system.href).toBeDefined();
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

    it('$scope.getMonitor - MonitorsController.getMonitoringTask mock', inject(function($rootScope, $controller, $stateParams, $translate, MonitorsController, ActionsService, MessageService) {
      var getMonitoringTask = function(id) {
       return {
         then: function(callback) {
           return callback({result:{
            "id": "7619208969218888166-242ac11e-0001-014",
            "target": "stampede-mrojas2",
            "owner": "mrojas",
            "frequency": 720,
            "updateSystemStatus": false,
            "internalUsername": null,
            "lastSuccess": "2016-09-23T04:40:37.000-05:00",
            "lastUpdated": "2016-09-23T04:40:37.000-05:00",
            "nextUpdate": "2016-09-23T16:40:35.000-05:00",
            "created": "2016-09-01T18:39:36.000-05:00",
            "active": true,
            "lastCheck": {
            "id": "6684647377673055770-242ac11e-0001-015",
            "result": "PASSED",
            "message": null,
            "type": "LOGIN",
            "created": "2016-09-07T10:13:32.000-05:00"
            },
            "_links": {
              "self": {
                "href": "https://api.araport.org/monitor/v2/7619208969218888166-242ac11e-0001-014"
              },
              "checks": {
                "href": "https://api.araport.org/monitor/v2/7619208969218888166-242ac11e-0001-014/checks"
              },
              "notifications": {
                "href": "https://api.araport.org/notifications/v2/?associatedUuid=7619208969218888166-242ac11e-0001-014"
              },
              "owner": {
                "href": "https://api.araport.org/profiles/v2/mrojas"
              },
              "system": {
                "href": "https://api.araport.org/systems/v2/stampede-mrojas2"
              }
            }
          }});
         }
       };
     };

      $stateParams.id = '7619208969218888166-242ac11e-0001-014';

      spyOn(MonitorsController, 'getMonitoringTask').and.callFake(getMonitoringTask);
      var scope = $rootScope.$new();
      var MonitorsResourceDetailsController= $controller('MonitorsResourceDetailsController', {
        $scope: scope,
        $rootScope: $rootScope,
        $stateParams: $stateParams,
        $translate: $translate,
        MonitorsController: MonitorsController,
        ActionsService: ActionsService,
        MessageService: MessageService
      });

      expect(MonitorsResourceDetailsController).toBeDefined();
      expect(scope.monitor).not.toBe(null);
      expect(scope.monitor.id).toBe('7619208969218888166-242ac11e-0001-014');
      expect(scope.monitor.target).toBe('stampede-mrojas2');
      expect(scope.monitor.owner).toBe('mrojas');
      expect(scope.monitor.frequency).toBe(720);
      expect(scope.monitor.updateSystemStatus).toBe(false);
      expect(scope.monitor.internalUsername).toBe(null);
      expect(scope.monitor.lastSuccess).toBe('2016-09-23T04:40:37.000-05:00');
      expect(scope.monitor.lastUpdated).toBe('2016-09-23T04:40:37.000-05:00');
      expect(scope.monitor.nextUpdate).toBe('2016-09-23T16:40:35.000-05:00');
      expect(scope.monitor.created).toBe('2016-09-01T18:39:36.000-05:00');
      expect(scope.monitor.active).toBe(true);
      expect(scope.monitor.lastCheck.id).toBe('6684647377673055770-242ac11e-0001-015');
      expect(scope.monitor.lastCheck.result).toBe('PASSED');
      expect(scope.monitor.lastCheck.message).toBe(null);
      expect(scope.monitor.lastCheck.type).toBe('LOGIN');
      expect(scope.monitor.lastCheck.created).toBe('2016-09-07T10:13:32.000-05:00');
      expect(scope.monitor._links.self.href).toBe('https://api.araport.org/monitor/v2/7619208969218888166-242ac11e-0001-014');
      expect(scope.monitor._links.checks.href).toBe('https://api.araport.org/monitor/v2/7619208969218888166-242ac11e-0001-014/checks');
      expect(scope.monitor._links.notifications.href).toBe('https://api.araport.org/notifications/v2/?associatedUuid=7619208969218888166-242ac11e-0001-014');
      expect(scope.monitor._links.owner.href).toBe('https://api.araport.org/profiles/v2/mrojas');
      expect(scope.monitor._links.system.href).toBe('https://api.araport.org/systems/v2/stampede-mrojas2');
    }));
});
