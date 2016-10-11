angular.module('AgaveToGo').service('FilesMetadataService',['$uibModal', '$rootScope', '$localStorage', '$location', '$state', '$timeout', '$q', '$translate', 'SystemsController', 'MetaDataController', 'MessageService', function($uibModal, $rootScope, $localStorage, $location, $state, $timeout, $q, $translate, SystemsController, MetadataController, MessageService){
  this.getMetadata = function(system){


 
  };

  this.edit = function(resourceType, resource){
    switch(resourceType){
      case 'apps': $state.go('apps-edit', {'appId': resource.id });
        break;
      case 'systems': $state.go('systems-edit', {'systemId': resource.id });
        break;
    }
  }
}]);
