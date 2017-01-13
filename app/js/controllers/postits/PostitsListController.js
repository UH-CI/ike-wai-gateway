angular.module('AgaveToGo').controller('PostitsListController', function ($scope, $state, $translate, PostitsController, FilesController, ActionsService, MessageService) {
    $scope._COLLECTION_NAME = 'postits';
    $scope._RESOURCE_NAME = 'postits';

    $scope.sortType = 'url';
    $scope.sortReverse  = true;
    $scope.query = '';//"{'owner':'seanbc'}";
    $scope.postitsSelected = { 
    	postits: []	
    };
    $scope.checkAll = false;
    
    $scope.refresh = function() {
      $scope.requesting = true;

      PostitsController.listPostits(
        $scope.query
      )
        .then(
          function (response) {
            $scope.totalItems = response.length;
            $scope.pagesTotal = Math.ceil(response.length / $scope.limit);
            $scope[$scope._COLLECTION_NAME] = response;
            $scope.requesting = false;
          },
          function(response){
            MessageService.handle(response, $translate.instant('error_postits_list'));
            $scope.requesting = false;
          }
      );
    };
    
    $scope.checkAllPostits = function(checkAll){
    	$scope.checkAll = !checkAll;
        if ($scope.checkAll){
        	$scope.postitsSelected.postits = angular.copy($scope[$scope._COLLECTION_NAME]);
        }
        else {
        	$scope.postitsSelected.postits = [];
        }
    }
    
    $scope.searchTools = function(query){
      $scope.query = query;
      $scope.refresh();
    }

    $scope.refresh();
    
    $scope.confirmAction = function(resourceType, resource, resourceAction, resourceList, resourceIndex){
      ActionsService.confirmAction(resourceType, resource, resourceAction, resourceList, resourceIndex);
    }
    
    $scope.email = function(url){
    	window.open('mailto:?subject=Sharing%20a%20link&body=Here%20is%20the%20link%20to%20my%20file' + url);
    };
    
    // handle the case where there are multiple items to email.
    $scope.emailMultiple = function(selected){
    	if (selected.length >= 1) {
            var str = 'mailto:?subject=Sharing%20a%20link&body=';
	        angular.forEach(selected, function(postit){
	        	str += postit._links.self.href + "%0A";
	        })
	        window.open(str);
    	}
    	// clear out the selected array or the item shows up in the next selection
    	selected.length = 0;
    };
    
    $scope.deletePostits = function(selected, allPostits){
    	// if only one item was selected, use the confirm for a single item
        if (selected.length === 1) {
        	$scope.confirmAction('postit', selected[0], 'delete', $scope[$scope._COLLECTION_NAME])
        	// clear out the selected array or the item shows up in the next selection
        	selected.length = 0;
        }
        else {
        	// if multiple items were selected, handle accordingly
            var str = '';
            angular.forEach(selected, function(postit){
            	str += postit._links.self.href + "\n\n";
            });
        	ActionsService.confirmMultipleAction(str, 'postits', selected, 'delete', $scope[$scope._COLLECTION_NAME]);
        }
    };
    
    
    
});
