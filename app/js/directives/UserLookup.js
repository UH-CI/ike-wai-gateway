/**
 * Directive for generating dynamic lists of user profiles
 */
AgaveToGo.directive('userLookup', function ($timeout, $filter, ProfilesController) {
    return {
        restrict: 'A',
        scope: true,
        replace: false,
        templateUrl: '../app/tpl/directives/user-lookup.html',
        link: function ($scope, elem, attrs) {
            var content = '';
            var placeholder = attributes.placeholder || 'Select user';

            setTimeout(function () {
                $(attributes.$$element).select2({
                    minimumInputLength: 0,
                    placeholder: placeholder,
                    query: function (query) {
                        var results = [];
                        var entities = [];
                        if (query.term) {
                            entities = ProfilesController.listProfiles(null, null, query.term);
                        } else {
                            entities = ProfilesController.listProfiles();
                        }

                        angular.forEach(entities, function (obj) {
                            var fullName = $filter('fullName')(obj.result);
                            results.push({
                                id: obj.result.username,
                                text: fullName,
                                description: fullName + ' <' + obj.result.email + '>'
                            });
                        });

                        var data = {results: results};
                        query.callback(data);
                    },
                    formatSelection: function (object, container) {
                        return '<span title="' + object.description + '">' + object.text + '</span>';
                    },
                    initSelection: function (element, callback) {
                        var result = ProfilesController.listProfiles(null, null, element.val());
                        var data;
                        if (result !== null) {
                            var fullName = $filter('fullName')(obj.result);
                            data = {id: result.id, text: fullName, description: fullName + ' <' + obj.result.email + '>' };
                        }

                        callback(data);
                    }
                });

            }, 500);

        }
    };
});