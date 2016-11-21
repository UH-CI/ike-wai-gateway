angular.module('AgaveToGo').service('FilesMetadataService',['$uibModal', '$rootScope', '$localStorage', '$location', '$state', '$timeout', '$q', '$translate', 'PostitsController', 'MetaController', 'MessageService', function($uibModal, $rootScope, $localStorage, $location, $state, $timeout, $q, $translate, PostitsController, MetaController, MessageService){

  function deferredHandler(data, deferred, errorMessage) {
      if (!data || typeof data !== 'object') {
          return deferred.reject('Bridge response error, please check the docs');
      }
      if (data.result && data.result.error) {
          return deferred.reject(data);
      }
      if (data.error) {
          return deferred.reject(data);
      }
      if (errorMessage) {
          return deferred.reject(errorMessage);
      }
      return deferred.resolve(data);
  }

  this.download = function(file_href, callback) {

        var data = {
            force: "true"
        };

        var postitIt = new PostItRequest();
        postitIt.setMaxUses(2);
        postitIt.setMethod("GET");
        postitIt.setUrl([file_href, $.param(data)].join('?'));

        return PostitsController.addPostit(postitIt)
            .then(function(resp) {

                  var link = document.createElement('a');
                  link.setAttribute('download', null);
                  link.setAttribute('href', resp._links.self.href);
                  link.style.display = 'none';
                  document.body.appendChild(link);
                  link.click();

                  document.body.removeChild(link);

                return callback(resp.data);

            });
    };

    this.downloadSelected = function(fileUrlsSelected){
      var self = this;
      var promises = [];
      angular.forEach(fileUrlsSelected, function(file_url){
        promises.push(
          self.download(file_url, function(value){
            //self.files.push(value);
          })
        );
      });

      var deferred = $q.defer();

      return $q.all(promises).then(
        function(data) {
          deferredHandler(data, deferred);

        },
        function(data) {
          deferredHandler(data, deferred, $translate.instant('error_dowwnloading_files'));

      });
      return true;
    };

}]);
