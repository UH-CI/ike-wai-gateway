describe('SystemsResourceQueuesController', function() {
    var tester, injector, $scope, queues, $stateParams, $translate, SystemsController, MessageService;

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

    it('$scope.refresh SystemsController.getSystemDetails real https', function(done) {
      systemId = 'stampede-mrojas'

      SystemsController.getSystemDetails(systemId)
        .then(function(response) {
            queues = response.result.queues;
            expect(queues[0].customDirectives).toBeDefined();
            expect(queues[0].default).toBeDefined();
            expect(queues[0].description).toBeDefined();
            expect(queues[0].mappedName).toBeDefined();
            expect(queues[0].maxJobs).toBeDefined();
            expect(queues[0].maxMemoryPerNode).toBeDefined();
            expect(queues[0].maxNodes).toBeDefined();
            expect(queues[0].maxProcessorsPerNode).toBeDefined();
            expect(queues[0].maxRequestedTime).toBeDefined();
            expect(queues[0].maxUserJobs).toBeDefined();
            expect(queues[0].name).toBeDefined();
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

    it('$scope.refresh - SystemsController.getSystemDetails mock', inject(function($rootScope, $controller,  $injector, $state, $stateParams, $q, $translate, SystemsController, RolesService, ActionsService, MessageService) {
      systemId = 'stampede-mrojas'

      var getSystemDetails = function() {
        return {
          then: function(callback) {
            return callback({result:
              {
               "maxSystemJobs": 10,
               "workDir": "",
               "_links": {
                 "history": {
                   "href": "https://public.agaveapi.co/systems/v2/docker.tacc.utexas.edu/history"
                 },
                 "roles": {
                   "href": "https://public.agaveapi.co/systems/v2/docker.tacc.utexas.edu/roles"
                 },
                 "credentials": {
                   "href": "https://public.agaveapi.co/systems/v2/docker.tacc.utexas.edu/credentials"
                 },
                 "self": {
                   "href": "https://public.agaveapi.co/systems/v2/docker.tacc.utexas.edu"
                 },
                 "metadata": {
                   "href": "https://public.agaveapi.co/meta/v2/data/?q=%7B%22associationIds%22%3A%226398732088614645274-242ac117-0001-006%22%7D"
                 }
               },
               "scratchDir": "/scratch/",
               "type": "EXECUTION",
               "id": "docker.tacc.utexas.edu",
               "revision": 2,
               "description": "Cloud VM used for Docker demonstrations and tutorials.",
               "name": "Demo Docker VM",
               "login": {
                 "port": 22,
                 "protocol": "SSH",
                 "host": "129.114.6.50",
                 "proxy": null,
                 "auth": {
                   "type": "SSHKEYS"
                 }
               },
               "maxSystemJobsPerUser": 2,
               "site": "iplantc.org",
               "lastModified": "2016-09-15T04:20:16.000-05:00",
               "status": "UP",
               "scheduler": "FORK",
               "startupScript": null,
               "available": true,
               "default": false,
               "environment": null,
               "owner": "dooley",
               "executionType": "CLI",
               "globalDefault": false,
               "uuid": "6398732088614645274-242ac117-0001-006",
               "queues": [{
                 "maxProcessorsPerNode": 1,
                 "default": true,
                 "maxMemoryPerNode": 2,
                 "mappedName": null,
                 "description": null,
                 "name": "debug",
                 "maxRequestedTime": "24:00:00",
                 "maxJobs": 10,
                 "customDirectives": null,
                 "maxNodes": 1,
                 "maxUserJobs": 2
               }],
               "public": true,
               "storage": {
                 "mirror": false,
                 "port": 22,
                 "homeDir": "/home",
                 "protocol": "SFTP",
                 "host": "129.114.6.50",
                 "proxy": null,
                 "rootDir": "/data",
                 "auth": {
                   "type": "SSHKEYS"
                 }
               }
             }
            });
          }
        };
      };


      spyOn(SystemsController, 'getSystemDetails').and.callFake(getSystemDetails);
      var scope = $rootScope.$new();
      $stateParams.systemId = 'stampede-mrojas';

      var SystemsResourceQueuesController = $controller('SystemsResourceQueuesController', {
        $scope: scope,
        $rootScope: $rootScope,
        $stateParams: $stateParams,
        $translate: $translate,
        SystemsController: SystemsController,
        MessageService: MessageService
      });

      expect(SystemsResourceQueuesController).toBeDefined();
      expect(scope.queues.length).toBe(1)
      expect(scope.queues[0].maxProcessorsPerNode).toBe(1);
      expect(scope.queues[0].default).toBe(true);
      expect(scope.queues[0].maxMemoryPerNode).toBe(2);
      expect(scope.queues[0].mappedName).toBe(null);
      expect(scope.queues[0].description).toBe(null);
      expect(scope.queues[0].name).toBe('debug');
      expect(scope.queues[0].maxRequestedTime).toBe('24:00:00');
      expect(scope.queues[0].maxJobs).toBe(10);
      expect(scope.queues[0].customDirectives).toBe(null);
      expect(scope.queues[0].maxNodes).toBe(1);
      expect(scope.queues[0].maxUserJobs).toBe(2);

    }));
});
