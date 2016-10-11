describe('SystemsResourceDetailsController', function() {
    var tester, injector, $scope, $stateParams, $translate, SystemsController, ActionsService, RolesService, MessageService;

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
      systemId = 'docker.tacc.utexas.edu'

      SystemsController.getSystemDetails(systemId)
        .then(function(response) {
            system = response.result;
            expect(system.available).toBeDefined();
            expect(system.default).toBeDefined();
            expect(system.description).toBeDefined();
            expect(system.id).toBeDefined();
            expect(system.type).toBeDefined();
            expect(system.lastModified).toBeDefined();
            expect(system.name).toBeDefined();
            expect(system.owner).toBeDefined();
            expect(system.public).toBeDefined();
            expect(system.revision).toBeDefined();
            expect(system.scratchDir).toBeDefined();
            expect(system.status).toBeDefined();
            expect(system.uuid).toBeDefined();
            expect(system.workDir).toBeDefined();
            expect(system._links.credentials.href).toBeDefined();
            expect(system._links.history.href).toBeDefined();
            expect(system._links.roles.href).toBeDefined();
            expect(system._links.self.href).toBeDefined();
            expect(system._links.metadata.href).toBeDefined();
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
      systemId = 'docker.tacc.utexas.edu';

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
      $stateParams.systemId = 'docker.tacc.utexas.edu';

      var SystemsResourceDetailsController = $controller('SystemsResourceDetailsController', {
        $scope: scope,
        $rootScope: $rootScope,
        $stateParams: $stateParams,
        $translate: $translate,
        SystemsController: SystemsController,
        ActionsService: ActionsService,
        RolesService: RolesService,
        MessageService: MessageService
      });

      expect(SystemsResourceDetailsController).toBeDefined();
      expect(scope.system.available).toBe(true);
      expect(scope.system.default).toBe(false);
      expect(scope.system.description).toBe('Cloud VM used for Docker demonstrations and tutorials.');
      expect(scope.system.id).toBe('docker.tacc.utexas.edu');
      expect(scope.system.type).toBe('EXECUTION');
      expect(scope.system.lastModified).toBe('2016-09-15T04:20:16.000-05:00');
      expect(scope.system.name).toBe('Demo Docker VM');
      expect(scope.system.owner).toBe('dooley');
      expect(scope.system.public).toBe(true);
      expect(scope.system.revision).toBe(2);
      expect(scope.system.scratchDir).toBe('/scratch/');
      expect(scope.system.status).toBe('UP');
      expect(scope.system.uuid).toBe('6398732088614645274-242ac117-0001-006');
      expect(scope.system.workDir).toBe('');
      expect(scope.system._links.credentials.href).toBe('https://public.agaveapi.co/systems/v2/docker.tacc.utexas.edu/credentials');
      expect(scope.system._links.history.href).toBe('https://public.agaveapi.co/systems/v2/docker.tacc.utexas.edu/history');
      expect(scope.system._links.roles.href).toBe('https://public.agaveapi.co/systems/v2/docker.tacc.utexas.edu/roles');
      expect(scope.system._links.self.href).toBe('https://public.agaveapi.co/systems/v2/docker.tacc.utexas.edu');
      expect(scope.system._links.metadata.href).toBe('https://public.agaveapi.co/meta/v2/data/?q=%7B%22associationIds%22%3A%226398732088614645274-242ac117-0001-006%22%7D');
    }));
});
