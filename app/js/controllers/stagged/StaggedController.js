angular.module('AgaveToGo').controller('StaggedController', function($scope, $stateParams, $state, $translate, $timeout, $localStorage, $uibModal, $http, MetaController, FilesMetadataService, MetadataService, MessageService) {

  $scope.metadatum = null;
  $scope.requesting = true;
  $scope.stagged_uuid =null;
  $scope.getMetadatum = function(){
    $scope.requesting = true;
    if ($stateParams.id !== ''){
      MetadataService.fetchSystemMetadataUuid('stagged')
        .then(function(stagged_uuid){
          $scope.stagged_uuid = stagged_uuid
          MetaController.getMetadata(stagged_uuid)
            .then(
              function(response){
                $scope.metadatum = response.result;
                $scope.requesting = false;
              },
              function(response){
                MessageService.handle(response, $translate.instant('error_metadata_details'));
                $scope.requesting = false;
              }
            );
          },function(){
            MessageService.handle(response, $translate.instant('error_metadata_uuid'));
            $scope.requesting = false;
          });
    } else {
      MessageService.handle(response, $translate.instant('error_metadata_details'));
      $scope.requesting = false;
    }
  }

  $scope.openRejectReasonModal = function (fileUuid, size) {
      $scope.rejectedUuid = fileUuid;
      var modalInstance = $uibModal.open({
        animation: $scope.animationsEnabled,
        templateUrl: 'views/modals/ModalRejectStagingRequestReason.html',
        controller: 'ModalRejectStagingRequestController',
        scope: $scope,
        size: size,
        resolve: {

        }
      }
    );
  }

  $scope.$on("staging.request.rejected", function (event, reason) { 
    $scope.requesting = true;
    MetadataService.fetchSystemMetadataUuid('stagged')
      .then(function(stagged_uuid){
        MetaController.getMetadata(stagged_uuid)
        .then(function(resp){
        var current_stagged = resp.result
        console.log(current_stagged)
        console.log($scope.rejectedUuid)
        FilesMetadataService.rejectStaggingRequest(stagged_uuid, $scope.rejectedUuid, reason).then(function(result){
       // $scope.metadatum = null;
        //pause to let model update
       // MetaController.getMetadata($scope.rejectedUuid)
        //  .then(function(resp){
         //   console.log("metadata:" + resp)
            var href = "";
            angular.forEach(current_stagged._links.associationIds, function(association){
              if ($scope.rejectedUuid == association.rel){
                 href = association.href
              }
            })
            var user_email = current_stagged.value.emails[$scope.rejectedUuid]
            var post_data = {}//to:"seanbc@hawaii.edu",from:"noReply-ikewai@hawaii.edu",subject:"Staged Updated",message:"User: "+ email+" has updated stagged files."};
            var url = $localStorage.tenant.baseUrl.slice(0, -1)+':8080/email?to='+user_email+'&from=noReply-ikewai@hawaii.edu&subject="Revise Staged File '+href.split('system')[1]+'"&message="User: '+user_email+' your staged file '+href.split('system')[1]+' was flagged for review. \nPlease log into the Ike Wai Gateway and address the following: \n'+reason+'"';
            var options = {
             headers:{ 'Authorization':  'Bearer ' + $localStorage.token.access_token}
            }
            $http.post(url,post_data, options)
              .success(function (data, status, headers, config) {
                console.log({message:angular.toJson(data)})
                var url2 = $localStorage.tenant.baseUrl.slice(0, -1)+':8080/email?to=uhitsci@gmail.com&from=noReply-ikewai@hawaii.edu&subject="Revise Staged File '+href.split('system')[1]+'"&message="User: '+user_email+' your staged file '+href.split('system')[1]+' was flagged for review.\nPlease log into the Ike Wai Gateway and address the following: \n'+reason+'"';
                $http.post(url2,post_data, options)
                  .success(function (data, status, headers, config) {
                  })
                  .error(function (data, status, header, config) {
                      console.log({error_message:angular.toJson(data)});
                  });
              })
              .error(function (data, status, header, config) {
                  console.log({error_message:angular.toJson(data)});
              });

              
         // })
        $timeout(function(){$scope.getMetadatum()}, 400);
        $scope.getMetadatum();
        //$scope.requesting = false;
      });
    })
    },function(){
      MessageService.handle(response, $translate.instant('error_metadata_uuid'));
      $scope.requesting = false;
    });
  });

  $scope.publishStaggedFile = function(fileUuid, filepath){
    $scope.requesting = true;
    MetadataService.fetchSystemMetadataSchemaUuid('PublishedFile')
      .then(function(published_uuid){
        MetaController.getMetadata($scope.stagged_uuid)
        .then(function(resp){
          var current_stagged = resp.result
          FilesMetadataService.publishStaggedFile(fileUuid, filepath).then(function(result){
           //pause to let model update
           $timeout(function(){$scope.getMetadatum()}, 300);
            $scope.requesting = false;
            App.alert( "File Published");
            var href = "";
            angular.forEach(current_stagged._links.associationIds, function(association){
              if (fileUuid == association.rel){
                 href = association.href
              }
            })
            //$scope.$broadcast('broadcastUpdate');
            var user_email = current_stagged.value.emails[fileUuid]
            var post_data = {}//to:"seanbc@hawaii.edu",from:"noReply-ikewai@hawaii.edu",subject:"Staged Updated",message:"User: "+ email+" has updated stagged files."};
            var url = $localStorage.tenant.baseUrl.slice(0, -1)+':8080/email?to='+user_email+'&from=noReply-ikewai@hawaii.edu&subject=Staged File '+href.split('system')[1]+' Approved!"&message="User: '+user_email+' your staged file '+href.split('system')[1]+' was approved and is now available to other Ike Wai users!"';
            var options = {
             headers:{ 'Authorization':  'Bearer ' + $localStorage.token.access_token}
            }
            $http.post(url,post_data, options)
              .success(function (data, status, headers, config) {
                console.log({message:angular.toJson(data)})
                var url2 = $localStorage.tenant.baseUrl.slice(0, -1)+':8080/email?to=uhitsci@gmail.com&from=noReply-ikewai@hawaii.edu&subject="Staged File '+href.split('system')[1]+' Approved!"&message="User: '+user_email+' your staged file '+href.split('system')[1]+' was approved and is now available to other Ike Wai users!"';
                $http.post(url2,post_data, options)
                  .success(function (data, status, headers, config) {
                  })
                  .error(function (data, status, header, config) {
                      console.log({error_message:angular.toJson(data)});
                  });
              })
              .error(function (data, status, header, config) {
                  console.log({error_message:angular.toJson(data)});
              });
        })
      })
      },function(){
        MessageService.handle(response, $translate.instant('error_fetching_metadata_schema'));
        $scope.requesting = false;
      });
  }
  $scope.$on('broadcastUpdate', function(event, args){
    $scope.getMetadatum();
    App.alert(args);
  });

  $scope.getMetadatum();
});
