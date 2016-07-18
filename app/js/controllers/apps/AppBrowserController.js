angular.module('AgaveToGo').controller('AppBrowserController', function($rootScope, $filter, $compile, $scope, Commons, $timeout, AppsController) {

    $scope.apps = [];
    $scope.currentApp = {};
    //$scope.paginatedAppResults = [];
    $scope.currentAppDetails = '<agave-app-details></agave-app-details>';
    //$scope.paginatedAppListing = '<agave-app-listing></agave-app-listing>'
    $scope.offset = 0;
    $scope.limit = 25;
    //$scope.numberOfClicks = 1;

    $scope.runApp = function (appId) {

    };

    var initCatalog = function() {
        // init cubeportfolio
        $('#js-grid-lightbox-gallery').cubeportfolio({
            filters: '#js-filters-lightbox-gallery1, #js-filters-lightbox-gallery2',
            loadMore: '#js-loadMore-lightbox-gallery',
            loadMoreAction: 'click',
            layoutMode: 'grid',
            loadMoreFuture: AppsController.listApps,
            mediaQueries: [{
                width: 1500,
                cols: 5
            }, {
                width: 1100,
                cols: 4
            }, {
                width: 800,
                cols: 3
            }, {
                width: 480,
                cols: 2
            }, {
                width: 320,
                cols: 1
            }],
            defaultFilter: '*',
            animationType: 'rotateSides',
            gapHorizontal: 10,
            gapVertical: 10,
            gridAdjustment: 'responsive',
            caption: 'zoom',
            displayType: 'sequentially',
            displayTypeSpeed: 100,

            // lightbox
            lightboxDelegate: '.cbp-lightbox',
            lightboxGallery: true,
            lightboxTitleSrc: 'data-title',
            lightboxCounter: '<div class="cbp-popup-lightbox-counter">{{current}} of {{total}}</div>',

            // singlePageInline
            singlePageInlineDelegate: '.cbp-singlePageInline',
            singlePageInlinePosition: 'below',
            singlePageInlineInFocus: true,
            singlePageInlineCallback: function (appId, element) {
                var t = this;

                App.blockUI({
                    target: '#js-grid-lightbox-gallery',
                    overlayColor: 'none',
                    animate: true
                });

                AppsController.getAppDetails(appId).then(
                    function (data) {
                        $scope.currentApp = data;

                        t.updateSinglePageInline($compile($scope.currentAppDetails)($scope));

                        AppsController.getAppPermission(appId).then(
                            function (pems) {
                                var username = App.getAuthenticatedUserProfile().username;
                                angular.forEach(pems, function (pem, key) {
                                    if (currentUsername === pem.username) {
                                        $scope.currentApp.pems = pems;
                                    }
                                });
                            },
                            function (data) {
                                // console.log("User does not have permission to edit this app");
                            });

                        App.unblockUI('#js-grid-lightbox-gallery');
                    },
                    function (data) {
                        App.alert({
                            type: 'danger',
                            message: "There was an error contacting the apps service. If this " +
                            "persists, please contact your system administrator."
                        });
                        t.updateSinglePageInline($compile($scope.currentAppDetails)($scope));

                        App.unblockUI('#js-grid-lightbox-gallery');
                    });
            },
        });

        App.unblockUI('#js-grid-lightbox-gallery');
    }

    App.blockUI({
        target: '#app-gallery',
        overlayColor: 'none',
        animate: true
    });
    $('#js-loadMore-lightbox-gallery').hide();

    AppsController.listApps($scope.limit, $scope.offset, '').then(
        function (data) {
            $scope.apps = data;
            $timeout(function () {
                initCatalog();
            }, 50);
            App.unblockUI('#app-gallery');
            $('#js-loadMore-lightbox-gallery').show();
        },
        function (data) {
            //self.deferredHandler(data, deferred, $translate.instant('error_creating_folder'));
            App.alert({
                type: 'danger',
                message: "There was an error contacting the apps service. If this " +
                "persists, please contact your system administrator.",
            });
            initCatalog();
            $('.cbp-l-loadMore-link').hide();
            App.unblockUI('#app-gallery');
        });
})
.directive('agaveAppDetails', function($filter) {
    return {
        restrict: 'EA',
        scope: true,
        replace: true,
        templateUrl: '../app/views/apps/ajax_details.html',
        link: function ($scope, element, attributes) {
            setTimeout(function () {}, 10);
        }
    };
})
.filter('appImage', ['Commons', function (Commons) {
    return function (icon) {
        return icon ? icon : '../assets/global/img/portfolio/600x600/'+Commons.randomInt(1,100)+'.jpg';
    };
}])
.filter("sanitize", ['$sce', function($sce) {
    return function(htmlCode){
        return $sce.trustAsHtml(htmlCode);
    }
}]);
