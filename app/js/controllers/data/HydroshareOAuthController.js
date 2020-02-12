angular.module('AgaveToGo').controller('HydroshareOAuthController', function ($scope, $state, $stateParams, $translate, $uibModal, $rootScope, $localStorage, $http) {
//function ($scope, $state, $stateParams, $http) {

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

    // clientID & clientSecret from: https://www.hydroshare.org/o/applications/122/
    clientID = "CcHMaDUQgC6gKEDAneliAUs96vNRcTt7VNA5fn6p";
    clientSecret = "S2bhzLwSKk4qfHJTROmNevtcwkNByBvLnNgGoAj7yJEVqOW5rfFY8FHoAvGn1z4ryseNz1u8eE2sEGNbpLgVQpsd2ITBGVcviQEA2wwIIMii4En6uib539K76rOVIqsg";
    // the 'tolocalhost.com' url is used for dev environment (localhost).  Will need to be changed for prod.
    redirectURL = "https%3A%2F%2Ftolocalhost.com";
    baseHSURL = "https://www.hydroshare.org";

    $scope.requesting =false;
    $scope.getHSAuthToken = function(){
        console.log("HydroshareOAuthController.getHSAuthToken");
        $scope.requesting = true;
        var post_data = {};
        // keep this commented out line as it's handy for copying/pasting into browser for testing
        //var authUrl = 'https://www.hydroshare.org/o/authorize/?response_type=code&client_id=CcHMaDUQgC6gKEDAneliAUs96vNRcTt7VNA5fn6p&redirect_uri=https%3A%2F%2Ftolocalhost.com';
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
            $scope.getAccessToken(code);
          }, function errorCallback(response) {
            alert("HydroshareOAuthController.getHSAuthToken Error. Try Again!");
        });
    }

    $scope.getAccessToken = function(code) {
        console.log("HydroshareOAuthController.getAccessToken");
        // go back to HS w/ code to get the token
        //var tokenURL = `https://www.hydroshare.org/o/token/?grant_type=authorization_code&code=${code}&client_id=${clientID}&client_secret=${clientSecret}&redirect_uri=${redirectURL}`;
        var tokenURL = `${baseHSURL}/o/token/?grant_type=authorization_code&code=${code}&client_id=${clientID}&client_secret=${clientSecret}&redirect_uri=${redirectURL}`;

        console.log("tokenURL: " + tokenURL);
        // From HS docs:
        // The call, if successful, returns the following parameters in JSON format: 
        // access_token, token_type, expires_in (num seconds to expiration), refresh_token, scope. 
        // You might want to store HS user id and access token in a cookie session so that 
        // you don't need to ask user to approve OAuth again and again when the web app is 
        // invoked by the same user for multiple times.
        $http({
            method: 'POST',
            url: tokenURL
        }).then(function successCallback(response) {
            // JG TODO: need to add error checking, check for error result from HS as well
            console.log("success");
            $scope.hydroshareAccessToken = response.data.access_token;
            console.log("hydroshareAccessToken: " + $scope.hydroshareAccessToken);
            $scope.getHydroshareUserInfo();
        }, function errorCallback(response) {
            alert("HydroshareOAuthController.getAccessToken Error. Try Again!");
        });
    }

    $scope.getHydroshareAccessToken = function() {
        return $scope.hydroshareAccessToken;
    }
      
    $scope.getHydroshareUserInfo = function() {
        console.log("HydroshareOAuthController.getUserInfo");
        //var userInfoURL = `https://www.hydroshare.org/hsapi/userInfo/?access_token=${$scope.accessToken}&format=json`;
        var userInfoURL = `${baseHSURL}/hsapi/userInfo/?access_token=${$scope.hydroshareAccessToken}&format=json`;

        console.log("userInfoURL: " + userInfoURL);
        $http({
            method: 'GET',
            url: userInfoURL
        }).then(function successCallback(response) {
            // JG TODO: need to add error checking, check for error result from HS as well
            console.log("success");
            $scope.userInfoHS = response.data;
            //console.log("userInfo: " + $scope.userInfo);
            console.log("username: " + $scope.userInfoHS.username);
            // format:  {"username":"jgeis@hawaii.edu","first_name":"Jennifer","last_name":"Geis","title":"Software Engineer","id":1501,"organization":"University of Hawaii","email":"jgeis@hawaii.edu"}
        
            $scope.submitToHydroshare();
        }, function errorCallback(response) {
            alert("HydroshareOAuthController.getUserInfo Error. Try Again!");
        });
    }

    // proof of concept, will move once working
    $scope.submitToHydroshare = function() {
        console.log("HydroshareOAuthController.submitToHydroshare");
        //var userInfoURL = `https://www.hydroshare.org/hsapi/userInfo/?access_token=${$scope.accessToken}&format=json`;
        var hsURL = `${baseHSURL}/hsapi/resource/?access_token=${$scope.hydroshareAccessToken}`;
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
        $http({
            method: 'POST',
            url: hsURL,
            data: hsData
        }).then(function successCallback(response) {
            // JG TODO: need to add error checking, check for error result from HS as well
            console.log("success");
            $scope.responseData = response.data;
            //console.log("userInfo: " + $scope.userInfo);
            console.log("resource_id: " + $scope.responseData.resource_id);
            // format:  {"username":"jgeis@hawaii.edu","first_name":"Jennifer","last_name":"Geis","title":"Software Engineer","id":1501,"organization":"University of Hawaii","email":"jgeis@hawaii.edu"}
        }, function errorCallback(response) {
            alert("HydroshareOAuthController.submitToHydroshare Error. Try Again!");
        });
    }


    $scope.getHSAuthToken();
});