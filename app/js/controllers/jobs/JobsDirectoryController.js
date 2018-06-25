angular.module('AgaveToGo').controller('JobsDirectoryController', function ($scope, $state, $translate, JobsController, AppsController, SystemsController, ActionsService, MessageService) {
    $scope._COLLECTION_NAME = 'jobs';
    $scope._RESOURCE_NAME = 'job';

    //$scope._APPS_COLLECTION_NAME = 'apps';
    $scope.apps = [];
    $scope.selectedApp = "";
    //$scope.app = "";

    $scope.sortType = 'startTime';
    $scope.sortReverse  = true;
    $scope.query = '';

    $scope.refresh = function() {
      $scope.requesting = true;

      JobsController.searchJobs(
        $scope.query
      )
        .then(
          function (response) {
            $scope.totalItems = response.result.length;
            $scope.pagesTotal = Math.ceil(response.result.length / $scope.limit);
            $scope[$scope._COLLECTION_NAME] = response.result;
            $scope.requesting = false;
          },
          function(response){
            MessageService.handle(response, $translate.instant('error_jobs_list'));
            $scope.requesting = false;
          }
      );

      $scope.getAppsList();
    };

    $scope.getAppsList = function() {
      $scope.requesting = true;

      SystemsController.listSystems(99999).then(
          function (response) {
            $scope.systems = response.result;

            AppsController.searchApps(
              $scope.query
            )
              .then(
                function(response){
                  $scope.apps = [];
                  _.each(response.result, function(app){
                    if ($scope.query.indexOf("available.eq=false") === -1){
                      app.available = true;
                      $scope.apps.push(app);
                    } else {
                      $scope.apps.push(app);
                    }
                  });
                  $scope.requesting = false;
                }, function(response){
                  MessageService.handle(response, $translate.instant('error_apps_search'));
                  $scope.requesting = false;
                }
              );
          },
          function(response){
            MessageService.handle(response, $translate.instant('error_apps_search'));
            $scope.requesting = false;
          }
      );
    }

    //$scope.makeNewJob = function() {
    //  console.log("test");
    //}

    $scope.searchTools = function(query){
      $scope.query = query;
      $scope.refresh();
    }

    $scope.browse = function(id){
      JobsController.getJobDetails(id)
        .then(
          function(response){
            $state.go('data-explorer', {'systemId': response.result.archiveSystem, path: response.result.archivePath});
          },
          function(response){
            MessageService.handle(response, $translate.instant('error_jobs_list'));
            $scope.requesting = false;
          }
        );
    }

    $scope.refresh();

    $scope.confirmAction = function(resourceType, resource, resourceAction, resourceList, resourceIndex){
      ActionsService.confirmAction(resourceType, resource, resourceAction, resourceList, resourceIndex);
    }

});
