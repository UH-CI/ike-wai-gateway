angular.module('AgaveToGo').controller('UserProfileController', function($rootScope, $scope, $stateParams, $http, $timeout, $localStorage, $translate, $q, $filter, Commons, ProfilesController, JobsController, AppsController, SystemsController, MessageService) {
    $scope.jobCount = '-';
    $scope.systemCount = '-';
    $scope.appCount = '-';
    $scope.projects = [];

    if ($stateParams.username) {
        $scope.username = $stateParams.username;
    } else {
        $scope.username = 'me';
    }

    $scope.setUserProfile = function(profile) {
        setTimeout(function() {
            $scope.profile = profile;
        }, 100);
    }
    $scope.setJobCount = function(jobCount) {
        setTimeout(function() {
            $scope.jobCount = jobCount;
        }, 100);
    };

    $scope.setAppCount = function(appCount) {
        setTimeout(function() {
            $scope.appCount = appCount;
        }, 100);
    };

    $scope.setSystemCount = function(systemCount) {
        setTimeout(function() {
            $scope.systemCount = systemCount;
        }, 100);
    };

    var usergen = function (count) {
        var users = [];
        for (var i = 0; i < count; i++) {
            var firstName = faker.name.firstName(),
                lastName = faker.name.lastName();


            users.push({
                img: '../assets/pages/media/users/avatar' + (i % 10 + 1) + '.jpg',
                name: firstName + ' ' + lastName,
                firstName: firstName,
                lastName: lastName,
                username: faker.internet.userName(),
                created: faker.date.recent(14)
            });
        }

        return users;
    };

    $scope.fakeUsers = usergen(20);

    var projectStatGen = function (count, numberOfDays) {
        var leaders = [];
        var result = {};
        angular.forEach(usergen(count), function (leader, i) {
            leader.comments = Commons.randomInt(5, 200) * numberOfDays;
            leader.jobs = Commons.randomInt(5, 200) * numberOfDays;
            leader.documents = Commons.randomInt(5, 200) * numberOfDays;
            leader.karma = Commons.randomInt(60, 99);
            leaders.push(leader);

            var userCount = 0;
            var userSignups = [];
            var dataPoints = 12;

            for (var i = 0; i < numberOfDays; i++) {
                var dailyUsers = Commons.randomInt(1, 20);
                //if (numberOfDays > 30) {
                //    userSignups[Math.ceil(i / dataPoints)] = dailyUsers;
                //} else if (numberOfDays > 7) {
                //    userSignups[Math.ceil(i / dataPoints)] = dailyUsers;
                //} else {
                //    userSignups.push(dailyUsers);
                //}
                userCount += dailyUsers;
            }

            for (var i = 0; i < dataPoints; i++) {
                userSignups.push(Commons.randomInt(1, 20));
            }

            var totals = {
                users: userCount,
                signups: userSignups,
                comments: Math.ceil(Commons.sum(leaders, 'comments') * userCount / 10),
                jobs: Math.ceil(Commons.sum(leaders, 'jobs') * userCount / 10),
                documents: Math.ceil(Commons.sum(leaders, 'documents') * userCount / 10),
                karma: Commons.randomInt(60, 99)
            };

            result = {totals: totals,leaders: leaders};
        })
        return result;
    };

    $scope.projectStatsTimeframe = 'daily';

    $scope.projectLeaders = {
        daily: projectStatGen(4, 1),
        weekly: projectStatGen(4, 7),
        monthly: projectStatGen(4, 30),
        alltime: projectStatGen(4, 365)
    };

    $("#project_sparkline_total").sparkline($scope.projectLeaders.alltime.totals.signups, {
        type: 'bar',
        width: '100',
        barWidth: 5,
        height: '55',
        barColor: '#ffb848',
        negBarColor: '#e02222'
    });

    $("#project_sparkline_day").sparkline($scope.projectLeaders.daily.totals.signups, {
        type: 'bar',
        width: '100',
        barWidth: 5,
        height: '55',
        barColor: '#35aa47',
        negBarColor: '#e02222'
    });

    $("#project_sparkline_week").sparkline($scope.projectLeaders.weekly.totals.signups, {
        type: 'bar',
        width: '100',
        barWidth: 5,
        height: '55',
        barColor: '#ffb848',
        negBarColor: '#e02222'
    });

    $("#project_sparkline_month").sparkline($scope.projectLeaders.monthly.totals.signups, {
        type: 'bar',
        width: '100',
        barWidth: 5,
        height: '55',
        barColor: '#35aa47',
        negBarColor: '#e02222'
    });

    $scope.$on('$viewContentLoaded', function() {
        App.initAjax(); // initialize core components
        Layout.setSidebarMenuActiveLink('set', $('#sidebar_menu_link_profile')); // set profile link active in sidebar menu

        ProfilesController.getProfile($scope.username).then(
            function(data) {
                $scope.setUserProfile(data);
            },
            function(response) {
                MessageService.handle(response, $translate.instant('error_profiles_list'));
                $scope.requesting = false;
            });

        JobsController.listJobs(null, null, null, null, null, null, null, null, 999).then(function(data) {
            var jobCount = data.result.length;
            $scope.jobCount = jobCount;

            $scope.setJobCount(jobCount);
        });

        SystemsController.listSystems(999).then(function(response) {
            var systemCount = response.result.length;
            $scope.setSystemCount(response.result.length);
        });

        AppsController.listApps(999, 0, { filter: 'id' }).then(function(data) {
            var appCount = data.result.length;
            $scope.appCount = appCount;
            $scope.setAppCount(appCount);
        });
    });

    $scope.searchProfiles = function() {

        $scope.users = [];

        var isSuccess = true;
        var that = this;
        var searchTerm = $('#directory-search-input').val();
        var promises = [];
        var totalResults = 0;
        var users = [];
        if (searchTerm.indexOf(' ') < 0) {
            promises.push(ProfilesController.listProfiles(null, null, searchTerm, null, null).then(
                function (response) {
                    angular.forEach(response, function (user) {
                        users[user.username] = user;
                    });
                },
                function (response) {
                    MessageService.handle(response, $translate.instant('error_profiles_search'));
                }));

            promises.push(ProfilesController.listProfiles(null, null, null, searchTerm, null).then(
                function (response) {
                    angular.forEach(response, function (user) {
                        users[user.username] = user;
                    });
                },
                function (response) {
                    MessageService.handle(response, $translate.instant('error_profiles_search'));
                }));
        }
        else {
            promises.push(ProfilesController.listProfiles(null, searchTerm, null, null, null).then(
                function (response) {
                    angular.forEach(response, function (user) {
                        users[user.username] = user;
                    });
                },
                function (response) {
                    MessageService.handle(response, $translate.instant('error_profiles_search'));
                }));
        }

        promises.push(ProfilesController.listProfiles(searchTerm, null, null, null, null).then(
            function (response) {
                angular.forEach(response, function (user) {
                    users[user.username] = user;
                });
            },
            function (response) {
                MessageService.handle(response, $translate.instant('error_profiles_search'));
            }));

        promises.push(ProfilesController.listProfiles(null, null, null, null, searchTerm).then(
            function (response) {
                angular.forEach(response, function (user) {
                    users[user.username] = user;
                });
            },
            function (response) {
                MessageService.handle(response, $translate.instant('error_profiles_search'));
            }));

        var deferred = $q.all(promises).then(
            function(result) {
                $timeout(function() {
                    var arr = [];
                    for (var m in users) {
                        if (users.hasOwnProperty(m)) {
                            $scope.users.push(users[m]);
                        }
                    }
                }, 10);
            },
            function(message, result) {
                MessageService.handle(response, $translate.instant('error_profiles_search'));
            });
    };



    // set sidebar closed and body solid layout mode
    $rootScope.settings.layout.pageBodySolid = true;
    $rootScope.settings.layout.pageSidebarClosed = true;
});
