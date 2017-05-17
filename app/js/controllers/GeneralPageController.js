/* Setup general page controller */
angular.module('AgaveToGo').controller('GeneralPageController', ['$rootScope', '$scope', 'settings', function($rootScope, $scope, settings) {
    $scope.$on('$viewContentLoaded', function() {
    	// initialize core components
    	App.initAjax();

        // set default layout mode
    	$rootScope.settings.layout.pageContentWhite = true;
        $rootScope.settings.layout.pageBodySolid = false;
        $rootScope.settings.layout.pageSidebarClosed = false;
    });
    $('a.noscroll').click(function(e)
    		{
    		    // Special stuff to do when this link is clicked...

    		    // Cancel the default action
    		    e.preventDefault();
    });
}]);
