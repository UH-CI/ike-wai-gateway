/**
 * Directive for editing system roles
 */
AgaveToGo.directive('jobProgressBar', function($timeout, JobsController, moment) {
    return {
        restrict: 'E',
        replace: true,
        scope: {
            system: '=ngModel',
        },
        templateUrl: '../app/tpl/directives/job-progress-bar.html',
        link: function ($scope, elem, attrs) {

            JobsController.getJobHistory($scope.job.id, 99999, 0).then(
                function(history) {

                    var createTime = $filter('amParseUnix')(history[0].created);
                    var stagingStartTime = null;
                    var stagingEndTime = null;
                    var runStartTime = null;
                    var runEndTime = null;
                    var archiveStartTime = null;
                    var archiveEndTime = null;
                    var finishTime = $filter('amParseUnix')(history[history.length-1].created);

                    var totalTime = finishTime - createTime;

                    angular.forEach(history, function (hist, key) {
                        if (hist.status === "STAGING_INPUTS" && !stagingStartTime) {
                            stagingStartTime = $filter('amParseUnix')(hist.created);
                        } else if (hist.status === "STAGING_COMPLETE" || hist.status === "STAGING_FAILED" ) {
                            stagingEndTime = $filter('amParseUnix')(hist.created);
                        } else if (hist.status === "CLEANING_UP") {
                            runEndTime = $filter('amParseUnix')(hist.created);
                        } else if (hist.status === "RUNNING") {
                            runStartTime = $filter('amParseUnix')(hist.created);
                        } else if (hist.status === "ARCHIVING") {
                            archiveStartTime = $filter('amParseUnix')(hist.created);
                        } else if (hist.status === "ARCHIVING_SUCCESS" || hist.status === "ARCHIVING_FAILED") {
                            archiveEndTime = $filter('amParseUnix')(hist.created);
                        }
                    });

                    $timeout(function()
                    {
                        if (stagingStartTime) {
                            $scope.waiting = (stagingStartTime - creatTime) / totalTime;
                        }

                        if (stagingEndTime){
                            $scope.staging = (stagingEndTime - stagingStartTime) / totalTime;
                        }

                        if (runStartTime){
                            $scope.queued = (runStartTime - stagingEndTime) / totalTime;
                        }

                        if (runEndTime){
                            $scope.running = (runEndTime - runStartTime) / totalTime;
                        }

                        if (archiveEndTime){
                            $scope.archiving = (archiveEndTime - archiveStartTime) / totalTime;
                        }
                    }, 50);
                },
                function(data) {
                    App.alert({
                        type: 'danger',
                        message: "There was an error fetching the job history. if this " +
                        "persists, please contact your system administrator.",
                    });
                });
        }
    };
});
