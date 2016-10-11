describe('SystemsResourceController', function() {
    var tester, injector, $rootScope, $scope, $state, $stateParams;

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

    it('SystemResourceController mock', inject(function($rootScope, $controller, $state, $stateParams ) {
      var scope = $rootScope.$new();

      var SystemsResourceController = $controller('SystemsResourceController', {
        $scope: scope,
        $rootScope: $rootScope,
        $state: $state,
        $stateParams: $stateParams
      });

      expect(SystemsResourceController).toBeDefined();
      expect(scope.tabs).toBeDefined();
      expect(scope.tabs[0].heading).toBe('Details');
      expect(scope.tabs[0].route).toBe('systems.details');
      expect(scope.tabs[0].active).toBe(false);

      expect(scope.tabs[1].heading).toBe('Queues');
      expect(scope.tabs[1].route).toBe('systems.queues');
      expect(scope.tabs[1].active).toBe(false);

      expect(scope.tabs[2].heading).toBe('Apps');
      expect(scope.tabs[2].route).toBe('systems.apps');
      expect(scope.tabs[2].active).toBe(false);
    }));
});
