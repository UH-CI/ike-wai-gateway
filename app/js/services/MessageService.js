angular.module('AgaveToGo').service('MessageService',['$rootScope', function($rootScope){

  this.handle = function(response, message){
    var errorMessage = '';
    if (response.errorResponse){
      if (typeof response.errorResponse.message !== 'undefined') {
        errorMessage = message + ' - ' + response.errorResponse.message
      } else if (typeof response.errorResponse.fault !== 'undefined'){
        errorMessage = message + ' - ' + response.errorResponse.fault.message;
      } else {
        errorMessage = message;
      }
    } else {
      errorMessage = message;
    }
    App.alert(
      {
        type: 'danger',
        message: errorMessage
      }
    );
  };
}]);
