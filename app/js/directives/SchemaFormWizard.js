AgaveToGo.directive('schemaFormWizard', function($scope, $http, WizardHandler) {
    return {
        restrict: 'E',
        replace: true,
        scope: {
            schema: '=sfSchema',
            form: '=sfForm',
            model: '=sfModel',
        },
        templateUrl: '../app/tpl/directives/wizard.html',
        link: function ($scope, elem, attrs) {
            $scope.currentTabIndex = 0;

            WizardHandler.activateTab($scope, $scope.currentTabIndex);

            $scope.editorConfig = {
                lineWrapping : true,
                lineNumbers: true,
                matchBrackets: true,
                styleActiveLine: false,
                theme:"neat",
                mode: 'javascript'
            };

            $scope.submit = function () {
                $scope.$broadcast('schemaFormValidate');
                if ($scope.myForm.$valid) {
                    // console.log($scope.model);
                }
            };

            $scope.nextStep = function () {
                WizardHandler.validateTab($scope, $scope.currentTabIndex).then(function () {
                    WizardHandler.activateTab($scope, ++$scope.currentTabIndex);
                });
            };

            $scope.previousStep = function () {
                WizardHandler.activateTab($scope, --$scope.currentTabIndex);
            };

            $scope.valueChanged = function (key, modelValue) {
                if (key[0] === 'category') {
                    $scope.loadForm(modelValue);
                }
            };

            $scope.$watch('model', function(value){
                if (value) {
                    $scope.prettyModel = JSON.stringify(value, undefined, 2);
                }
            }, true);


        }
    };
});
