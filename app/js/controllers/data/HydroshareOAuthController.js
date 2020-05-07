angular.module('AgaveToGo').controller('HydroshareOAuthController', function ($rootScope, $scope, $state, $stateParams, $translate, $uibModal, $localStorage, $http, MetaController) {

    /*
    Followed the instructions at these resources:
    https://github.com/hydroshare/hydroshare/wiki/HydroShare-REST-API#oauth-20-support
    https://github.com/hydroshare/hydroshare/wiki/Accessing-HydroShare-REST-API-using-CURL
    https://docs.google.com/document/d/1UbZjr-f0Kvq27-jdPzFMjEcBcgWxn-M0UDi7cZ4GFe8/edit

    // for Hydroshare ikewai account:
    // created a web app connector: Ikewai Web App Connector
    https://www.hydroshare.org/resource/6be34cb8d1674d56935b1e0c53f2ead9/
    
    To edit:
    - https://www.hydroshare.org/o/applications/129/

    Go to application setup:
    https://www.hydroshare.org/o/applications/

    It gives me the client id and client secret.  There, I set the Redirect Uris field to:
    Client type:
      Confidential
    Authorization Grant Type:
      Authorization Code
    Redirect URI: 
      https://tolocalhost.com
      Note: this will eventually be changed to http://ikewai.its.hawaii.edu/app/, but it has to be this for development 
      as localhost can't be used as it must be an https address.
      When testing on ikewai-dev, set this to: https://ikewai-dev.its.hawaii.edu/app/

    Then go to https://tolocalhost.com, and set the hostname to:
      localhost:9000/app/#/hsoauth

---------------------------------

    To make all this actually run and do something, use this URL:
    
    https://www.hydroshare.org/o/authorize/?response_type=code&client_id=tEtcSxDF96anO7HkSSQnNgQQxyqIXx55JOnfXz4t&redirect_uri=https%3A%2F%2Ftolocalhost.com
   

    https://www.hydroshare.org/o/authorize/?response_type=code&client_id=tEtcSxDF96anO7HkSSQnNgQQxyqIXx55JOnfXz4t&redirect_uri=https%3A%2F%2Fikewai-dev.its.hawaii.edu%2Fapp%2F%23%2Fhsoauth

    */

    // this is the ikewai account
    // clientID & clientSecret from: https://www.hydroshare.org/o/applications/129/
    // likely should move this to metadata
    clientID = "tEtcSxDF96anO7HkSSQnNgQQxyqIXx55JOnfXz4t";
    clientSecret = "XgSOOzYnaKM7j0moFu3CgT0x5s1lkay8bTgeeuKMGihgM4Nf6bWcJY6pw9Wpo1EKo86QJdDtfPN1vzmwwmAt0HVI3s3CIr9QIyp95U2tjxGnL2Aai0x8FsZguE1UEetT";

    // the 'tolocalhost.com' url is used for dev environment (localhost).  Will need to be changed for prod.
    baseHSURL = "https://www.hydroshare.org";

    // the 'tolocalhost.com' url is used for dev environment (localhost).  Will need to be changed for prod.
    //redirectURL = "https%3A%2F%2Ftolocalhost.com";
    redirectURL = "https://ikewai-dev.its.hawaii.edu/app/#/hsoauth";
    redirectURLEncoded = encodeURIComponent(redirectURL);

    $scope.requesting = false;
    
    $scope.getStep1HSAuthToken = function(){
        console.log("HydroshareOAuthController.getStep1HSAuthToken");
        
        $scope.requesting = true;
        var post_data = {};
        // keep this commented out line as it's handy for copying/pasting into browser for testing
        //var authUrl = 'https://www.hydroshare.org/o/authorize/?response_type=code&client_id=tEtcSxDF96anO7HkSSQnNgQQxyqIXx55JOnfXz4t&redirect_uri=https%3A%2F%2Ftolocalhost.com';

        var authUrl = `${baseHSURL}/o/authorize/?response_type=code&client_id=${clientID}&redirect_uri=${redirectURL}`;
        console.log("authUrl: " + authUrl);

        $http({
            method: 'GET',
            url: authUrl
        }).then(function successCallback(response) {
            console.log("success");
            // JG TODO: need to add error checking, check for error result from HS as well
            var code = location.toString().split("code=")[1];
            console.log("code: " + code);
            code = code.split("#")[0];
            console.log("Authcode: " + code);
            $scope.getStep2HSAccessToken(code);
        }, function errorCallback(response) {
            alert("HydroshareOAuthController.getStep1HSAuthToken Error. Try Again!");
        });
    }

    $scope.getStep2HSAccessToken = function(code) {
        console.log("HydroshareOAuthController.getStep2HSAccessToken: " + code);
        // go back to HS w/ code to get the token
        //var tokenURL = `https://www.hydroshare.org/o/token/?grant_type=authorization_code&code=${code}&client_id=${clientID}&client_secret=${clientSecret}&redirect_uri=${redirectURL}`;
        //var tokenURL = `${baseHSURL}/o/token/?grant_type=authorization_code&code=${code}&client_id=${clientID}&client_secret=${clientSecret}&redirect_uri=${redirectURL}`;
        //var tokenURL = `${baseHSURL}/o/token/?grant_type=authorization_code&code=${code}&client_id=${clientID}&client_secret=${clientSecret}&redirect_uri=https://tolocalhost.com`;

        // From HS docs:
        // The call, if successful, returns the following parameters in JSON format: 
        // access_token, token_type, expires_in (num seconds to expiration), refresh_token, scope. 
        // You might want to store HS user id and access token in a cookie session so that 
        // you don't need to ask user to approve OAuth again and again when the web app is 
        // invoked by the same user for multiple times.

        var tokenURL = `${baseHSURL}/o/token/`;

        // this was getting {"error":"unsupported_grant_type"} until I encoded all the data arguments.
        var req = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8','Accept': '*/*'
            },
            url: tokenURL,
            data: 'grant_type=authorization_code' 
            + '&client_id=' + encodeURIComponent(clientID)
            + '&client_secret=' + encodeURIComponent(clientSecret)
            + '&code=' + encodeURIComponent(code)
            + '&redirect_uri=' + redirectURLEncoded,
        }

        $http(req).then(function (response) {
            // JG TODO: need to add error checking, check for error result from HS as well
            console.log("success");

            var hydroshareAccessToken = response.data.access_token;
            console.log("hydroshareAccessToken: " + $localStorage.hydroshareAccessToken);

            // token expires in 2592000 seconds = 43,200 min = 720 h, 30 days
            var m = response.data.expires_in / 60;
            var h = m / 60;
            var days = h /24;
            var date = new Date();
            date.setDate(date.getDate() + days);

            // expiration date toString looks like this:
            // Sat Jun 06 2020 10:34:29 GMT-1000 (Hawaii-Aleutian Standard Time)
            // need a string like: 2020-05-29T16:16:39-05:00

            var dateString = date.toISOString();
            dateString = dateString.split("T")[0] + "T00:00:00-05:00";
            //console.log("hydroshare expiration date: " + date + ", dateString: " + dateString);
            
            $scope.updateAccessToken(hydroshareAccessToken, dateString);
        },
        function (response) {
            console.log(angular.toJson(response));
        })
    }

    $scope.updateAccessToken = function(hydroshareAccessToken, expirationDate) {
        console.log("updateAccessToken: " + hydroshareAccessToken + ", " + expirationDate);
        $scope.requesting = true;
        var query = "{'name':'HydroshareAccessToken'}";
        MetaController.listMetadata(query).then(function (response) {
            if (response.result.length > 0) {
                var obj = response.result[0];
                console.log("obj.uuid: " + obj);
                obj.value.access_token = hydroshareAccessToken;
                obj.value.expiration_date = expirationDate;
                
                MetaController.updateMetadata(obj, obj.uuid).then(function (response) {
                    console.log('HydroshareAccessToken has been updated');
                },
                function (response) {
                    console.log('HydroshareAccessToken object update failed');
                });
                
            }
            else {
                console.log('No existing HydroshareAccessToken object was found');
            }
        },
        function (response) {
            console.log('Something went wrong.  Retrieval of the existing HydroshareAccessToken object failed');
        });
        $scope.requesting = false;
    }

    $scope.getStep1HSAuthToken();
});