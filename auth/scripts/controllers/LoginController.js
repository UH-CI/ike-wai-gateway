angular.module('AgaveAuth').controller('LoginController', function ($injector, $timeout, $http, $location, $rootScope, $scope, $state, $stateParams, settings, $localStorage, $window, AccessToken, MetaController, TenantsController, Commons, Alerts) {

    settings.layout.tenantPage = true;
    settings.layout.loginPage = false;
    accessToken = "97796d6192dee73dd67ab6557f49586";
    $scope.useImplicit = true;
    $scope.randomState = function() {
        return (Math.ceil(Math.random() * 9));
    }
    $scope.alerts=[]
    $scope.user = ($localStorage.client && angular.copy($localStorage.client)) || {
            username: '',
            password: '',
            client_key: '',
            client_secret: '',
            remember: 0
    };
    $scope.tenantId = 'hawaii'
    /*if ($stateParams.tenantId) {
        $scope.tenantId = $stateParams.tenantId;
    } else {
        $state.go('tenants');
    }*/

    TYPE_HYDROSHARE = "HS";
    TYPE_IKEWAI = "IW";
    TYPE_REPO_PUSH = "RP";
    TYPE_REPO_UPDATE = "RU";
    TYPE_PUBLIC_FILES = "PF";
    TYPE_USAGE_STATS = "US";
    TYPE_NOTICES = "N";
    $scope.newDOIs = "";
    $scope.outputString = "Welcome to the `Ikewai project's water science gateway."
        + "  Currently, usage of the Gateway is limited to researchers involved in the `Ikewai project.<br /><br />"
        + "  <center>All `Ikewai project data will be made publically available at <br/><b><a href='http://ikewai.org'>ikewai.org</a></b></center><br/>";
    $scope.getRecentChangesForDisplay = function() {
        $scope.requesting = true;
        var data = {};

        var pastDate = new Date();
        var todaysDate = new Date();

        // originally was adjusting for the zero based month/day, but realized that actually worked
        // for us as we wanted to go back about a month.
        //var formattedDate = pastDate.getFullYear() + "-" + pastDate.getMonth() + "-" + pastDate.getDay();
        var formattedDate = pastDate.getFullYear()
        + "-" + ('0' + pastDate.getMonth()).slice(-2)
        + "-" + ('0' + pastDate.getDate()).slice(-2);

        //console.log("Date: " + formattedDate);
        var baseUrl = 'https://ikeauth.its.hawaii.edu/search/v2/data?q=';
        var doiQuery = '{"name":"DataDescriptor","value.gotDOIDate":{"$gt":"' + formattedDate + '"}}';
        var pushedToHydroshareQuery = '{"name":"DataDescriptor","value.pushedToHydroshareDate":{"$gt":"' + formattedDate + '"}}';
        var pushedToIkewaiQuery = '{"name":"DataDescriptor","value.pushedToIkewaiDate":{"$gt":"' + formattedDate + '"}}';
        var pushedToAnnotatedRepoQuery = '{"name":"PublishedFile","created":{ "$gt":"' + formattedDate + '"}}'
        var filesRecentlyMadePublicQuery = '{"name":"PublicFile","created":{ "$gt":"' + formattedDate + '"}}'
        var recentlyUpdatedAnnotateRepoItemsQuery = '{"name":"DataDescriptor","value.published":"True","lastUpdated":{ "$gt":"' + formattedDate + '"}}';
        var noticesQuery = '{"name":"Notices","value.expiration_date":{ "$gt":"' + todaysDate.toISOString() + '"}}';
        var usageStatsQuery = '{"name":"UsageStats"}'

        $scope.doQuery(baseUrl, doiQuery, "Recent DOIs obtained", TYPE_HYDROSHARE);
        //$scope.doQuery(baseUrl, pushedToHydroshareQuery, "Recent pushes to Hydroshare", TYPE_HYDROSHARE);
        $scope.doQuery(baseUrl, pushedToIkewaiQuery, "Recent pushes to Ikewai.org", TYPE_IKEWAI);
        $scope.doQuery(baseUrl, pushedToAnnotatedRepoQuery, "Recent pushes to annotated repository", TYPE_REPO_PUSH);
        $scope.doQuery(baseUrl, filesRecentlyMadePublicQuery, "Files recently made public", TYPE_PUBLIC_FILES);
        $scope.doQuery(baseUrl, recentlyUpdatedAnnotateRepoItemsQuery, "Recently updated file metadata in annotate repository", TYPE_REPO_UPDATE);
        $scope.doQuery(baseUrl, usageStatsQuery, "Gateway data storage statistics", TYPE_USAGE_STATS);
        $scope.doQuery(baseUrl, noticesQuery, "General Notices", TYPE_NOTICES);
    }

    $scope.doQuery = function(baseUrl, queryString, headerLabel, type) {
        console.log("queryUrl: " + queryString);
        var queryUrl = baseUrl + encodeURIComponent(queryString);
        //console.log("encodedQueryUrl: " + queryUrl);
        // access token used here was provided by Sean, it's a long lived, search only token.
        var req = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8','Accept': '*/*',
                'Authorization': 'Bearer ' + accessToken
            },
            url: queryUrl
        }
        $http(req).then(function (response) {
            $scope.requesting = false;
            angular.forEach(response.data.result, function (item, key) {
                if (item) {
                    //console.log("item: " + item.uuid);
                    if (key === 0) {
                        $scope.outputString += "<br />";
                        $scope.outputString += "<b>" + headerLabel + "</b>: <br />";
                    }
                    if (type === TYPE_HYDROSHARE) {
                        urlString = 'https://doi.org/10.4211/hs.' + item.value.hydroshareResourceId;
                        $scope.outputString += "   <a href='" + urlString + "'>" + item.value.title + "</a>";
                        $scope.outputString += " (" + (new Date(Date.parse(item.value.gotDOIDate)).toDateString()) + ")";
                    }
                    else if (type === TYPE_IKEWAI && item.value.pushedToIkewaiDate) {
                        // https://ikeauth.its.hawaii.edu/files/v2/download/public/system/ikewai-annotated-data/new_data/PEARC__Ike_Wai_Dissemination.pdf
                        $scope.outputString += "   " + item.value.title;
                        $scope.outputString += " (" + (new Date(Date.parse(item.value.pushedToIkewaiDate)).toDateString()) + ")";
                    }
                    else if (type === TYPE_PUBLIC_FILES) {
                        urlString = item.value.file_public_url;
                        filename = urlString.split('/').pop();
                        $scope.outputString += "   <a href='" + urlString + "'>" + filename  + "</a>";
                        $scope.outputString += " (" + (new Date(Date.parse(item.created)).toDateString()) + ")";
                    }
                    else if (type === TYPE_REPO_PUSH) {
                        $scope.outputString += "  " + item.value.filename;
                        $scope.outputString += " (" + (new Date(Date.parse(item.created)).toDateString()) + ")";
                    }
                    else if (type === TYPE_REPO_UPDATE) {
                        $scope.outputString += "  " + item.value.title;
                        $scope.outputString += " (" + (new Date(Date.parse(item.lastUpdated)).toDateString()) + ")";
                    }
                    else if (type === TYPE_USAGE_STATS) {
                        $scope.outputString += "   Number of files: " + item.value.allFilesCount + "<br />";
                        $scope.outputString += "   Storage space used: " + item.value.allStorage + "<br />";
                        $scope.outputString += "   Number of annotated files: " + item.value.annotatedFilesCount + "<br />";
                        $scope.outputString += "   Storage space used by annotate files: " + item.value.annotatedStorage;
                    }
                    else if (type === TYPE_NOTICES) {
                        console.log("Got a notice: " + item.value);
                        $scope.outputString += "   " + item.value.notice;
                    }
                    else {
                        $scope.outputString += "   " + item.value.title;
                    }
                    $scope.outputString += "<br />";
                }
            });
        })
    }

    $scope.getRecentChangesForDisplay();

    $scope.getTenantByCode = function (tenantId) {
        var namedTenant = false;
        angular.forEach(settings.tenants, function (tenant, key) {
            if (tenant.code === tenantId) {
                namedTenant = tenant;
                return false;
            }
        });

        if (namedTenant) {
            return namedTenant;
        } else {
            Alerts.danger({message: 'No tenant found matching ' + tenantId});
        }
    };
    $scope.requesting =false;
    $scope.getAuthToken = function(){
        $scope.requesting = true;
        var post_data = {};
        var url = 'https://ikewai.its.hawaii.edu:8888/login';
        var options = {
            withCredentials: true,
            headers:{ 'Authorization':  'Basic ' + btoa($scope.username + ":" + $scope.password)}
          }
        $http.post(url,post_data, options)
            .success(function (data, status, headers, config) {
                $scope.requesting=false;
                if (data.access_token){
                    $localStorage.token = data;
                    d = new Date();
                    $localStorage.token.expires_at = moment(d).add($localStorage.token.expires_in, 's').toDate();
                    $localStorage.tenant = {
                                    		"id": "0001411570998814-b0b0b0bb0b-0001-018",
                                    		"name": "IkeWai Tenant",
                                    		"baseUrl": "https://ikeauth.its.hawaii.edu/",
                                    		"code": "ikewai",
                                    		"contact": [{
                                    			"name": "Sean Cleveland",
                                    			"email": "seanbc@uhawaii.edu",
                                    			"url": "",
                                    			"type": "admin",
                                    			"primary": true
                                    		}],
                                    		"_links": {
                                    			"self": {
                                    				"href": "https://docker.example.com/tenants/v2/ikewai"
                                    			},
                                    			"publickey": {
                                    				"href": "https://ikeauth.its.hawaii.edu/apim/v2/publickey"
                                    			}
                                    		}
                                    	};
                    $localStorage.activeProfile = {"first_name":"","last_name":"","full_name":"","email":$scope.username+"@hawaii.edu","phone":"","mobile_phone":"","status":"","create_time":"","uid":0,"username": $scope.username}
                    $window.location.href = '/app';
                }
                else{
                    $scope.login_error=true;
                }
            })
            .error(function (data, status, header, config) {
                $scope.requesting=false;
                Alerts.danger({message:angular.toJson(data)});
            });

    }



    var updateCurrentTenant = function () {
        $timeout(function () {

            $scope.tenant = $scope.getTenantByCode($scope.tenantId);

            $rootScope.$broadcast('oauth:template:update', '/auth/views/templates/oauth-ng-button.html');

        }, 500);
    };

    $scope.$watch('settings.tenants', function(value){
        updateCurrentTenant();
    }, true);


    updateCurrentTenant();


    var getAccessToken = function(user, options) {
        // Check if `user` has required properties.
        if (!user || !user.username || !user.password) {
            Alerts.danger({message: 'Please supply a valid username and password'});
        }

        var data = {
            grant_type: 'password',
            username: $scope.user.username,
            password: $scope.user.password
        };

        data = queryString.stringify(data);

        options = angular.extend({
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': btoa($scope.user.client_key + ':' + $scope.user.client_secret)
            }
        },  options);

        return $http.post($scope.tenant.baseUrl + '/token', data, options).then(
            function(response) {
                $localStorage.token = response;
                $localStorage.client = $scope.user;
                $localStorage.tenant = $scope.tenant;
                $rootScope.broadcast('oauth:login', token);
                return response;
            },
            function(response) {
                $rootScope.broadcast('oauth:denied');
            });
    }

    /**
     * Retrieves the `refresh_token` and stores the `response.data` on cookies
     * using the `OAuthToken`.
     *
     * @return {promise} A response promise.
     */
    var getRefreshToken = function() {
        var data = {
            grant_type: 'refresh_token',
            refresh_token: $localStorage.token.refresh_token,
            scope: 'PRODUCTION'
        };

        if (null !== config.clientSecret) {
            data.client_secret = config.clientSecret;
        }

        data = queryString.stringify(data);

        var options = {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': btoa($scope.user.client_key + ':' + $scope.user.client_secret)
            }
        };

        return $http.post($scope.tenant.baseUrl + '/token', data, options).then(
            function (response) {
                $localStorage.token = response;
                $rootScope.broadcast('oauth:refresh', token);
                $localStorage.tenant = $scope.tenant;
                return response;
            },
            function(response) {
                $rootScope.broadcast('oauth:denied');
            });
    };
//forward user onto the oauth login page
/*$scope.$on('oauth:loggedOut', function(event) {
  //console.log('The user is not signed in');
  $timeout(function() {
    angular.element('a.btn.default.logged-out.ng-scope').trigger('click');
  });
});
*/
});
