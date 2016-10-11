'use strict';

describe('MonitorsResourceAddController', function() {
    var tester, injector, systems, monitorId, monitorCheck, TestConfiguration, Configuration, ActionsService, MessageService, SystemsController, MonitorsController;

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
      SystemsController = tester.inject('SystemsController');
      tester.digest();
    });

    afterEach(function() {
      tester.destroy();
      tester = null;
    });

    it('$scope.init() - SystemsController.listSystems real https', function(done) {
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

    it('$scope.init() - SystemsController.listSystems mock', inject(function($rootScope, $controller, $stateParams, $translate, MonitorsController, SystemsController, ActionsService, MessageService) {
      var listSystems = function(limit) {
       return {
         then: function(callback) {
           return callback({result:[
             {
                "id" : "stampede-mrojas2",
                "name" : "Private stampede system",
                "type" : "EXECUTION",
                "description" : "My private stampede account",
                "status" : "UP",
                "public" : false,
                "lastUpdated" : "2016-06-10T09:26:39.000-05:00",
                "default" : false,
                "_links" : {
                  "self" : {
                    "href" : "https://api.araport.org/systems/v2/stampede-mrojas2"
                  }
                }
             }
          ]});
         }
       };
      };

      spyOn(SystemsController, 'listSystems').and.callFake(listSystems);
      var scope = $rootScope.$new();
      var MonitorsResourceAddController = $controller('MonitorsResourceAddController', {
        $scope: scope,
        $rootScope: $rootScope,
        $stateParams: $stateParams,
        $translate: $translate,
        MonitorsController: MonitorsController,
        SystemsController: SystemsController,
        ActionsService: ActionsService,
        MessageService: MessageService,
      });

      expect(MonitorsResourceAddController).toBeDefined();
      expect(scope.systemsTitleMap).not.toBe(null);
      expect(scope.schema.type).toBeDefined();
      expect(scope.schema.properties.target).toBeDefined();
      expect(scope.schema.properties.active).toBeDefined();
      expect(scope.schema.properties.frequency).toBeDefined();
      expect(scope.schema.properties.updateSystemStatus).toBeDefined();
    }));


    it('$scope.test() - MonitorsController.createForceMonitoringTaskCheck real https', function(done) {
      monitorId = '7619208969218888166-242ac11e-0001-014';
      MonitorsController.createForceMonitoringTaskCheck(monitorId)
          .then(
            function(response) {
              monitorCheck = response.result;
              expect(monitorCheck).not.toEqual(undefined);
              if (monitorCheck){
                  expect(monitorCheck.id).toBeDefined();
                  expect(monitorCheck.type).toBeDefined();
                  expect(monitorCheck.result).toBeDefined();
                  expect(monitorCheck.message).toBeDefined();
                  expect(monitorCheck.created).toBeDefined();
                  expect(monitorCheck._links.self.href).toBeDefined();
                  expect(monitorCheck._links.monitor.href).toBeDefined();
                  expect(monitorCheck._links.system.href).toBeDefined();
              }
              done();
            },
            function(response) {
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
            }
          );
    });

    it('$scope.test() - MonitorsController.createMonitoringTaskCheck', inject(function($rootScope, $controller, $stateParams, $translate, MonitorsController, SystemsController, ActionsService, MessageService) {
      var createForceMonitoringTaskCheck = function(monitorId) {
        return {
          then: function(callback) {
            return callback({result:{
              "id": "5483218855808331290-242ac11d-0001-015",
            	"type": "LOGIN",
            	"result": "PASSED",
            	"message": null,
            	"created": "2016-09-23T16:14:24.715-05:00",
            	"_links": {
            		"self": {
            			"href": "https://api.araport.org/monitor/v2/7619208969218888166-242ac11e-0001-014/checks/5483218855808331290-242ac11d-0001-015"
            		},
            		"monitor": {
            			"href": "https://api.araport.org/monitor/v2/7619208969218888166-242ac11e-0001-014"
            		},
            		"system": {
            			"href": "https://api.araport.org/systems/v2/stampede-mrojas2"
            		}
            	}
            }});
          }
        };
      };

      var scope = $rootScope.$new();
      scope.monitorId = '7619208969218888166-242ac11e-0001-014';
      spyOn(MonitorsController, 'createForceMonitoringTaskCheck').and.callFake(createForceMonitoringTaskCheck);


      var MonitorsResourceAddController = $controller('MonitorsResourceAddController', {
        $scope: scope,
        $rootScope: $rootScope,
        $stateParams: $stateParams,
        $translate: $translate,
        MonitorsController: MonitorsController,
        SystemsController: SystemsController,
        ActionsService: ActionsService,
        MessageService: MessageService,
      });


      scope.test();
      expect(MonitorsResourceAddController).toBeDefined();
      expect(scope.monitorCheck).not.toBe(null);
      expect(scope.monitorCheck.id).toBe('5483218855808331290-242ac11d-0001-015');
      expect(scope.monitorCheck.type).toBe('LOGIN');
      expect(scope.monitorCheck.result).toBe('PASSED');
      expect(scope.monitorCheck.message).toBe(null);
      expect(scope.monitorCheck.created).toBe('2016-09-23T16:14:24.715-05:00');
      expect(scope.monitorCheck._links.self.href).toBe('https://api.araport.org/monitor/v2/7619208969218888166-242ac11e-0001-014/checks/5483218855808331290-242ac11d-0001-015');
      expect(scope.monitorCheck._links.monitor.href).toBe('https://api.araport.org/monitor/v2/7619208969218888166-242ac11e-0001-014');
      expect(scope.monitorCheck._links.system.href).toBe('https://api.araport.org/systems/v2/stampede-mrojas2');
    }));


    it('$scope.submit() - MonitorsController.addMonitoringTasks mock', inject(function($rootScope, $controller, $stateParams, $translate, MonitorsController, SystemsController, ActionsService, MessageService) {
      var addMonitoringTasks = function(model) {
        return {
          then: function(callback) {
            return callback({result:{
              "id": "2099704986510421530-242ac11d-0001-014",
              "target": "stampede-mrojas3-clone",
              "owner": "mrojas",
              "frequency": 720,
              "updateSystemStatus": false,
              "internalUsername": null,
              "lastSuccess": null,
              "lastUpdated": "2016-09-23T19:36:08.967-05:00",
              "nextUpdate": "2016-09-23T19:36:08.967-05:00",
              "created": "2016-09-23T19:36:08.967-05:00",
              "active": true,
              "lastCheck": {},
              "_links": {
                "self": {
                  "href": "https://api.araport.org/monitor/v2/2099704986510421530-242ac11d-0001-014"
                },
                "checks": {
                  "href": "https://api.araport.org/monitor/v2/2099704986510421530-242ac11d-0001-014/checks"
                },
                "notifications": {
                  "href": "https://api.araport.org/notifications/v2/?associatedUuid=2099704986510421530-242ac11d-0001-014"
                },
                "owner": {
                  "href": "https://api.araport.org/profiles/v2/mrojas"
                },
                "system": {
                  "href": "https://api.araport.org/systems/v2/stampede-mrojas3-clone"
                }
              }
            }});
          }
        };
      };

      var scope = $rootScope.$new();
      scope.monitorId = '7619208969218888166-242ac11e-0001-014';
      spyOn(MonitorsController, 'addMonitoringTasks').and.callFake(addMonitoringTasks);

      var MonitorsResourceAddController = $controller('MonitorsResourceAddController', {
        $scope: scope,
        $rootScope: $rootScope,
        $stateParams: $stateParams,
        $translate: $translate,
        MonitorsController: MonitorsController,
        SystemsController: SystemsController,
        ActionsService: ActionsService,
        MessageService: MessageService,
      });

      scope.submit();

      expect(MonitorsResourceAddController).toBeDefined();
      expect(MonitorsController.addMonitoringTasks).toHaveBeenCalled();
      expect(scope.monitorId).toBe('2099704986510421530-242ac11d-0001-014');
      expect(scope.requesting).toBe(false);
    }));



});
