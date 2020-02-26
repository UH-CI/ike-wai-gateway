angular.module('AgaveToGo').controller('HydroshareOAuthController', function ($rootScope, $scope, $state, $stateParams, $translate, $uibModal, $localStorage, $http) {

// ACCESS TOKEN: CgbXs1ROY6uAKaA4zJe6Ax5iocwQEu
// issued on 2/25/2020 @ 12:35PM

// ACCESS TOKEN: Jkt5cNJ9NDtrvxpxl92t5zqBEx4kns
// issued on 2/25/2020 @ 12:44PM

// ACCESS TOKEN: gXaz8O0LPTGqvdrMdVOlcOoUGxxJV5
// issued on 2/26/2020 @ 11:53AM

// Hydroshare Access Token: g6QWYGsTM1RdNG3110oS8Li41gtXgW
// HydroshareOAuthController.js:97 Hydroshare Access Token expiration Date: 2020-03-27T22:32:16.236Z

    /*
    $scope.alerts=[]
    $scope.user = ($localStorage.client && angular.copy($localStorage.client)) || {
            username: '',
            password: '',
            client_key: '',
            client_secret: '',
            remember: 0
    };
    */

    /*
    Followed the instructions at these resources:
    https://github.com/hydroshare/hydroshare/wiki/HydroShare-REST-API#oauth-20-support
    https://github.com/hydroshare/hydroshare/wiki/Accessing-HydroShare-REST-API-using-CURL
    https://docs.google.com/document/d/1UbZjr-f0Kvq27-jdPzFMjEcBcgWxn-M0UDi7cZ4GFe8/edit

    Made three apps in HS under my name, called IkewaiJenDev and IkewaiJenDev2 and IkewaiJenDev3.  Was trying different things.
    https://www.hydroshare.org/o/applications/122
    or
    https://www.hydroshare.org/o/applications/125
    or 
    https://www.hydroshare.org/o/applications/126

    //To edit, it's at:
    //https://www.hydroshare.org/resource/518a3a537a6244ee8fdf22ef494aab68/
    //There, the App-launching URL pattern is set to:
    //https://tolocalhost.com/?app=ikewai&res_id=${HS_RES_ID}&usr=${HS_USR_NAME}&src=hs
    
    In the application setup at URL:
    https://www.hydroshare.org/o/applications/

    It gives me the client id and client secret.  There, I set the Redirect Uris field to:
    https://tolocalhost.com
    
    At https://tolocalhost.com, 
    I set the hostname to:
    localhost:9000/app/#/hsoauth

    Had to do it through this convoluted method because I need a url with https,
    which I can't do on localhost.  Will correct all this when we move to prod.

    To make all this actually run and do something, use this URL:
    //https://www.hydroshare.org/o/authorize/?response_type=code&client_id=CcHMaDUQgC6gKEDAneliAUs96vNRcTt7VNA5fn6p&redirect_uri=https%3A%2F%2Ftolocalhost.com
    
    //https://www.hydroshare.org/o/authorize/?response_type=code&client_id=L06JBbQ2labJh0uCDAqVi2bg4pcHNvJqSdnQbnmf&redirect_uri=https%3A%2F%2Ftolocalhost.com

    //https://www.hydroshare.org/o/authorize/?response_type=code&client_id=1d1iBa0gnDOAfQzLLuGWrsUoY8n7oKBT4brPAmTG&redirect_uri=https%3A%2F%2Ftolocalhost.com
    */


    // // clientID & clientSecret from: https://www.hydroshare.org/o/applications/122
    clientID = "CcHMaDUQgC6gKEDAneliAUs96vNRcTt7VNA5fn6p";
    clientSecret = "S2bhzLwSKk4qfHJTROmNevtcwkNByBvLnNgGoAj7yJEVqOW5rfFY8FHoAvGn1z4ryseNz1u8eE2sEGNbpLgVQpsd2ITBGVcviQEA2wwIIMii4En6uib539K76rOVIqsg";
    // https://www.hydroshare.org/o/authorize/?response_type=code&client_id=CcHMaDUQgC6gKEDAneliAUs96vNRcTt7VNA5fn6p&redirect_uri=https%3A%2F%2Ftolocalhost.com


    // //clientID & clientSecret from: https://www.hydroshare.org/o/applications/125
    //clientID = "L06JBbQ2labJh0uCDAqVi2bg4pcHNvJqSdnQbnmf";
    //clientSecret = "CDyTDVhSv9rJeJGIf2eyLSZW1vA6BWqVpyXIFHHLY6TS3zgOSeO0cAkQVM7Po1Y6mExxV8thGGFfQozYihh8hC0Mhl3EceCahOsxo118udfTMlpNsm54qtuQg81j7Ogl";
    // https://www.hydroshare.org/o/authorize/?response_type=code&client_id=L06JBbQ2labJh0uCDAqVi2bg4pcHNvJqSdnQbnmf&redirect_uri=https%3A%2F%2Ftolocalhost.com


    // clientID & clientSecret from: https://www.hydroshare.org/o/applications/126
    //clientID = "1d1iBa0gnDOAfQzLLuGWrsUoY8n7oKBT4brPAmTG";
    //clientSecret = "1ZyV9VFMoWpankJx4Prq82cOHqA5VGFr98K8HadmbmrAaNZPuvNf0fepRzkL7FDn27SYkznWb2SvPhCFQACycKtOmoEL9f9NyUB0MTfTDRlNiYA3NeitcZaGLim1p4VG";
    // https://www.hydroshare.org/o/authorize/?response_type=code&client_id=1d1iBa0gnDOAfQzLLuGWrsUoY8n7oKBT4brPAmTG&redirect_uri=https%3A%2F%2Ftolocalhost.com


    // the 'tolocalhost.com' url is used for dev environment (localhost).  Will need to be changed for prod.
    redirectURL = "https%3A%2F%2Ftolocalhost.com";
    baseHSURL = "https://www.hydroshare.org";

    $scope.requesting = false;

    // check to see if we need to re-auth or if we are still good.
    $scope.doHSAuthProcess = function() {
        // This doesn't work.  Not holding the values through the redirect.  Need
        // to get this going through the site rather than the weird workaround I'm doing.

        console.log("HydroshareOAuthController.doHSAuthProcess");
        console.log("Hydroshare Access Token: " + $localStorage.hydroshareAccessToken);
        console.log("Hydroshare Access Token expiration Date: " + $localStorage.hydroshareExpirationDate);
        console.log("Hydroshare User Info: " + $localStorage.hydroshareUserInfo.username);

        //var hsDate = new Date($localStorage.hydroshareExpirationDate);
        //console.log("hsDate:   " + hsDate);
        //var testDate = new Date();
        //testDate.setDate(testDate.getDate() + 30);
        //console.log("testDate: " + testDate);
        //console.log("date comparison: " + (hsDate < testDate));

        // authenticate if our access token isn't set, the expiration date isn't set,
        // or the expiration date (the date we got the token + 30 days) is less than today.
        if (typeof $localStorage.hydroshareExpirationDate == 'undefined' || 
            !$localStorage.hydroshareExpirationDate ||
            typeof $localStorage.hydroshareAccessToken == 'undefined' ||
            !$localStorage.hydroshareAccessToken ||
            ($localStorage.hydroshareExpirationDate < new Date())) {
                console.log("Would call getStep1HSAuthToken");
                $scope.getStep1HSAuthToken();
        }
        //console.log("" + typeof $scope.accessTokenExpirationDate == 'undefined');
        //console.log("" + typeof $scope.hydroshareAccessToken == 'undefined');
        //console.log("" + $scope.accessTokenExpirationDate < new Date());
    }
    

    $scope.getStep1HSAuthToken = function(){
        console.log("HydroshareOAuthController.getStep1HSAuthToken");
        
        $scope.requesting = true;
        var post_data = {};
        // keep this commented out line as it's handy for copying/pasting into browser for testing
        //var authUrl = 'https://www.hydroshare.org/o/authorize/?response_type=code&client_id=CcHMaDUQgC6gKEDAneliAUs96vNRcTt7VNA5fn6p&redirect_uri=https%3A%2F%2Ftolocalhost.com';
        //var authUrl = 'https://www.hydroshare.org/o/authorize/?response_type=code&client_id=L06JBbQ2labJh0uCDAqVi2bg4pcHNvJqSdnQbnmf&redirect_uri=https%3A%2F%2Ftolocalhost.com';
        //var authUrl = 'https://www.hydroshare.org/o/authorize/?response_type=code&client_id=1d1iBa0gnDOAfQzLLuGWrsUoY8n7oKBT4brPAmTG&redirect_uri=https%3A%2F%2Ftolocalhost.com';

        var authUrl = `${baseHSURL}/o/authorize/?response_type=code&client_id=${clientID}&redirect_uri=${redirectURL}`;
        console.log("authUrl: " + authUrl);

        $http({
            method: 'GET',
            url: authUrl
        }).then(function successCallback(response) {
            console.log("success");
            // JG TODO: need to add error checking, check for error result from HS as well
            var code = location.toString().split("code=")[1];
            console.log("Authcode: " + code);
            $scope.getStep2HSAccessToken(code);
        }, function errorCallback(response) {
            alert("HydroshareOAuthController.getStep1HSAuthToken Error. Try Again!");
        });
    }

    $scope.getStep2HSAccessToken = function(code) {
        console.log("HydroshareOAuthController.getStep2HSAccessToken");
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
            + '&redirect_uri=' + encodeURIComponent('https://tolocalhost.com'),
        }

        $http(req).then(function (response) {
            // JG TODO: need to add error checking, check for error result from HS as well
            console.log("success");

            $localStorage.hydroshareAccessToken = response.data.access_token;
            console.log("hydroshareAccessToken: " + $localStorage.hydroshareAccessToken);

            // token expires in 2592000 seconds = 43,200 min = 720 h, 30 days
            var m = response.data.expires_in / 60;
            var h = m / 60;
            var days = h /24;
            var date = new Date();
            date.setDate(date.getDate() + days);
            $localStorage.hydroshareExpirationDate = date;
            console.log("hydroshare expiration date: " + date);
            
            $scope.getHydroshareUserInfo();
        },
        function (response) {
            console.log(angular.toJson(response));
        })
    }

    $scope.getHydroshareAccessToken = function() {
        return $scope.hydroshareAccessToken;
    }
      
    $scope.getHydroshareUserInfo = function() {
        console.log("HydroshareOAuthController.getUserInfo");
        //var userInfoURL = `https://www.hydroshare.org/hsapi/userInfo/?access_token=${$scope.accessToken}&format=json`;
        var userInfoURL = `${baseHSURL}/hsapi/userInfo/?access_token=${$localStorage.hydroshareAccessToken}&format=json`;

        console.log("userInfoURL: " + userInfoURL);
        $http({
            method: 'GET',
            url: userInfoURL
        }).then(function successCallback(response) {
            // JG TODO: need to add error checking, check for error result from HS as well
            console.log("success");
            $localStorage.hydroshareUserInfo = response.data;
            //console.log("userInfo: " + $scope.userInfo);
            console.log("username: " + $localStorage.hydroshareUserInfo.username);
            // format:  {"username":"jgeis@hawaii.edu","first_name":"Jennifer","last_name":"Geis","title":"Software Engineer","id":1501,"organization":"University of Hawaii","email":"jgeis@hawaii.edu"}
        
            // likely want to comment this out when testing
            //$scope.submitToHydroshare();
        }, function errorCallback(response) {
            alert("HydroshareOAuthController.getUserInfo Error. Try Again!");
        });
    }

    // proof of concept, will move once working
    $scope.submitToHydroshare = function() {
        console.log("HydroshareOAuthController.submitToHydroshare");
        //var hsURL = `https://www.hydroshare.org/hsapi/resource/?access_token=${$scope.hydroshareAccessToken}`;
        var hsURL = `${baseHSURL}/hsapi/resource/?access_token=${$scope.hydroshareAccessToken}`;

        // TODO: hard code a DD UID and use that for testing

        var hsData = `{
            "title": "Some Title",
            "author": "Jennifer Geis",
            "creator": "Jennifer Geis",
            "from_date": "2019-10-09",
            "to_date": "2019-10-10",
            "abstract": "some abstract description",
            "keywords": [
                "keyword1",
                "keyword2"
            ],
            "abstract": "abstract string",
            "resource_type": "CompositeResource"
        }`;
        // file=@/PATH/TO/A/FILE
        // metadata = '[{"coverage":{"type":"period", "value":{"start":"01/01/2000", "end":"12/12/2010"}}}, {"creator":{"name":"John Smith"}}, {"creator":{"name":"Lisa Miller"}}]'
        // extra_metadata = '{"key-1": "value-1", "key-2": "value-2"}'
        // "edit_groups": set(page.edit_groups.all()),
        // "view_groups": set(page.view_groups.all()),
        // "edit_users": set(page.edit_users.all()),
        // "view_users": set(page.view_users.all()),
        // "can_edit": (user in set(page.edit_users.all())) \
        //             or (len(set(page.edit_groups.all()).intersection(set(user.groups.all()))) > 0)
        console.log("hsURL: " + hsURL);
        
        // // temporarily commented out so I can test w/o actually submitting to HS
        // $http({
        //     method: 'POST',
        //     url: hsURL,
        //     data: hsData
        // }).then(function successCallback(response) {
        //     // JG TODO: need to add error checking, check for error result from HS as well
        //     console.log("success");
        //     $scope.responseData = response.data;
        //     //console.log("userInfo: " + $scope.userInfo);
        //     console.log("resource_id: " + $scope.responseData.resource_id);
        //     // format:  {"username":"jgeis@hawaii.edu","first_name":"Jennifer","last_name":"Geis","title":"Software Engineer","id":1501,"organization":"University of Hawaii","email":"jgeis@hawaii.edu"}
        // }, function errorCallback(response) {
        //     alert("HydroshareOAuthController.submitToHydroshare Error. Try Again!");
        // });
    }


    //$scope.getStep1HSAuthToken();
    $scope.doHSAuthProcess();
});