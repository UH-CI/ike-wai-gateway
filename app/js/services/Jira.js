angular.module('JiraService', []).service('Jira', ['$rootScope', '$http', '$q',
function ($rootScope, $http, $q) {

    this.baseUrl = "https://public.agaveapi.co/servicedesk/rest/api/2/";

    this.failedPromise = function (message) {
        "use strict";
        var deferred = $q.defer();
        deferred.reject({data: {message: [message], code: 400}});
        return deferred.promise;
    };

    this.search = function(ticketStatus) {
      var options = {
          url: this.baseUrl + 'search?jql=status%3d' + ticketStatus,
          method: 'GET'
      };
      var deferred = $q.defer();
      var response = $http(options);

      response.then(function(resp) {
          deferred.resolve(resp.data);
        }, function (error) {
          deferred.reject(error);
        });

      return deferred.promise;
    };
}]);
