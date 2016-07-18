/**
 * This is the base controller for all resource editing views. It bundles normal crud
 * processing and component initialization into the parent for extension and reuse in the
 * individual implementation controllers.
 */
function BaseResourceCtrl($rootScope, $scope, $state, $stateParams, Commons, ApiStub) {

  // this is the name of the resource variable. It will be used
  // to generically reference the bound variable without having
  // to change the templates.
  $scope._RESOURCE_NAME = $scope._RESOURCE_NAME || null;

  /**
   * Retrieves the resource id from the passed in state parameters.
   * This will represent the id of an editied resource.
   *
   * @returns integer null if creating a new resource.
   */
  $scope.getResourceId = $scope.getResourceId || function () {
      return $stateParams[$scope._RESOURCE_NAME + 'Id'];
    };

  $scope._COLLECTION_NAME = $scope._COLLECTION_NAME || null;

  /**
   * Id of the form bound to the resource.
   * @returns string of the form #RESOURCETYPE-form
   */
  $scope.getFormId = $scope.getFormId || function () {
      return '#' + $scope._RESOURCE_NAME + '-form';
    };

  /**
   * Handles success responses to resource loading events.
   * This is called after the resource loads and should be where
   * any initialization occurs.
   * @param response object from the service
   */
  $scope.handleRefreshSuccess = $scope.handleRefreshSuccess || function (response) {

      $scope[$scope._RESOURCE_NAME] = response.data;

      $.fn.Data.checkbox();

      //$scope.addressesAreSame = $scope[$scope._RESOURCE_NAME].contact.addresses.billing === $scope[$scope._RESOURCE_NAME].contact.addresses.mailing;

      setTimeout(function () {

        $scope.initModelListeners();

        $rootScope.$broadcast('event:content-loading-complete', "loading success");

      }, 100);
    };

  /**
   * Handles failure behavior for promises returned from ApiStub
   * calls by this controller.
   *
   * @param {Object} response from the service
   */
  $scope.handleFailure = $scope.handleFailure || function (response) {
      $rootScope.$broadcast('event:content-loading-complete', "loading failed");

      if (response.code == 404 && $scope[$scope._RESOURCE_NAME] === null) {
        $state.go('frontend-404');
      } else {
        App.alert({
          type: 'danger',
          message: $scope._COLLECTION_NAME + " operation failed <br>" + $scope.getErrorMessage(response)
        });
      }
    };

  /** parses error resonse from the server and returns it in a standard
   * string format.
   */
  $scope.getErrorMessage = $scope.getErrorMessage || function (response) {
      if (response) {
        if (response.message) {
          return response.message;
        } else if (response.data) {
          if (response.data.message) {
            if (angular.isArray(response.data.message)) {
              return response.data.message.toString();
            } else if (angular.isObject(response.data.message)) {
              return Commons.toArray(JSON.parse(response.data.message)).toString();
            } else {
              return response.data.message;
            }
          } else if (response.data.errors) {
            if (angular.isArray(response.data.errors)) {
              return response.data.errors.toString();
            } else if (angular.isObject(response.data.errors)) {
              return Commons.toArray(JSON.parse(response.data.errors)).toString();
            } else {
              return response.data.errors;
            }
          } else {
            return JSON.stringify(response.data);
          }
        }
      }

      return "There was an error contacting the " + $scope._COLLECTION_NAME + " service. If this " +
        "persists, please contact your system administrator.";
    };


  /***************************************************
   * Define scope functions for generic crud tasks
   ***************************************************/

    // This is the scope resource controlled by the implementing controller
  $scope[$scope._RESOURCE_NAME] = ApiStub.getEmptyObject();

  /**
   * Replaces the current resource with a fake resource. Current id is deleted.
   */
  $scope.fakerFill = function () {
    "use strict";
    setTimeout(function () {
      $scope[$scope._RESOURCE_NAME] = ApiStub.getFakerObject();
    }, 50);
  };
  /**
   * Refreshes the current view template and binds the object obtained from
   * the API to the form.
   */
  $scope.refresh = function () {
    ApiStub.get(id).then(handleRefreshSuccess, handleFailure);
  };

  /**
   * Validates and submits the form by POSTing to the API. A
   */
  $scope.submit = function () {
    if ($($scope.getFormId()).valid()) {
      $scope.filterBeforeSubmit();

      if (Commons.isNotEmpty($scope.getResourceId())) {
        ApiStub.update($scope[$scope._RESOURCE_NAME]).then(
          function (response) {
            $scope[$scope._RESOURCE_NAME] = response.data;
            App.alert({message: $scope._COLLECTION_NAME + " profile updated"});
          },
          function (response) {
            App.alert({
              type: 'danger',
              message: "Failed to update " + $scope._COLLECTION_NAME + " <br>" + $scope.getErrorMessage(response)
            });
          });
      }
      else {
        ApiStub.save($scope[$scope._RESOURCE_NAME]).then(
          function (response) {
            $scope[$scope._RESOURCE_NAME] = response.data;
            App.alert({message: $scope._COLLECTION_NAME + " updated successfully"});
            $state.go($scope._COLLECTION_NAME + '-list');
          },
          function (response) {
            App.alert({
              type: 'danger',
              message: "Failed to create " + $scope._COLLECTION_NAME + "<br>" + $scope.getErrorMessage(response)
            });
          });
      }
    }
  };

  $scope.cancel = function () {
    $state.go($scope._COLLECTION_NAME + '-list');
  };

  $scope.delete = function () {
    if (Commons.isNotEmpty($scope.getResourceId())) {
      ApiStub.delete($scope.getResourceId()).then(
        function (response) {
          $scope.cancel();
        },
        function (response) {
          App.alert({
            type: 'danger',
            message: "Failed to delete " + $scope._COLLECTION_NAME + ". " + $scope.$scope.getErrorMessage(response)
          });
        });
    }
  };

  /***************************************************
   * Init common components
   ***************************************************/

  /**
   * Callback from the promise of the refresh event. Add event bindings, etc in
   * here that need to be called after the resource is fetched and data bound.
   */
  $scope.initModelListeners = $scope.initModelListeners || function () {
    };

  /**
   * Callback to filter input prior to submission. This should operate on the
   * state and/or bound resource itself as the returned value is disregarded.
   */
  $scope.filterBeforeSubmit = $scope.filterBeforeSubmit || function () {
    };

  /*
   * Generic validation handler for forms. This can be over-ridden in the
   * child.
   */
  $scope.initValidation = $scope.initValidation || function () {
      $($scope.getFormId()).validate({
        errorPlacement: function (error, element) {
          error.insertAfter(element.parent());
          element.parent().parent().removeClass('state-success').addClass('state-error');
        },
        success: function (error, element) {
          $(element).parent().parent().removeClass('state-error');
          error.remove();
        }
      });
    };

  $scope.initValidation();

  // Force the form submission to the submit method
  $($scope.getFormId()).submit(function (e) {
    e.preventDefault();
    // if ($($scope.getFormId()).valid()) {
    //   $scope.submit();
    // }
    // return false;
  });

  // fetch the resource from the api to load into the form or
  // create a new empty resource and load that.
  if ($scope.getResourceId()) {
    ApiStub.get($scope.getResourceId())
      .then(
      $scope.handleRefreshSuccess,
      function (message) {
        $state.go('frontend-404');
      }
    );
  }
  else {
    $scope.handleRefreshSuccess({data: ApiStub.getEmptyObject()});
    // $rootScope.$broadcast('event:content-loading-complete', "Initializing new " + $scope._RESOURCE_NAME);
  }

}
