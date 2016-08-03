// Handle global start menu toggle button
AgaveToGo.directive('tagsModal', function ($parse, $q, $timeout, Tags) {
    return {
        restrict: 'E',
        replace: true,
        scope: {
            'taggedResourceUuid': '=ngModel',
            'taggedResourceName': '=ngResourceName'
        },
        templateUrl: '../app/tpl/directives/tags-editor.html',
        link: function ($scope, $elem, $attrs) {
            $scope.tagModel = {activeTags:[], tagsAsync:[], removedTags: []};

            var clearTags = function() {
                $scope.tagModel.tagsAsync = [];
                $scope.tagModel.activeTags = [];
                $scope.tagModel.removedTags = [];
            };

            $scope.selectEvents = function($item, $model) {
                $scope.tagModel.activeTags.push($item);
            }

            $scope.removeEvents = function($item, $model) {
                for (var i = 0; i < $scope.tagModel.activeTags.length; i++) {
                    if ($scope.tagModel.activeTags[i].id == $item.id &&
                            $scope.tagModel.activeTags[i].name == $item.name) {
                        $scope.tagModel.activeTags.splice(i, 1);
                    }
                }
                if ($item.created) {
                    $scope.tagModel.removedTags.push($item);
                }
            }

            var refreshTags = function() {
                clearTags();

                Tags.listTags(99999, 0).then(
                    function (data) {
                        $timeout(function () {
                            var activeTags = [];
                            for (var i = 0; i < data.length; i++) {
                                if (data[i].associatedUuids.indexOf($scope.taggedResourceUuid) > -1) {
                                    activeTags.push(data[i]);
                                }
                            }
                            $scope.tagModel.activeTags = activeTags;
                            $scope.tagModel.tagsAsync = data;
                        }, 50);
                    },
                    function (data) {
                        App.alert({
                            type: 'danger',
                            message: "there was an error contacting the tags service. if this " +
                            "persists, please contact your system administrator.",
                        });
                    });
            };

            $scope.tagTransform = function (newTag) {
                var item = {
                    name: newTag,
                    id: Math.floor(Date.now()) + '-' + Math.floor(Math.random() * 1000000) + '-0001-061',
                    created: false
                };

                return item;
            };

            $scope.updateTags = function() {
                var isSuccess = true;
                var that = this;

                var promises = [];
                var totalAdded = 0;
                for (var i = 0; i <  $scope.tagModel.activeTags.length; i++) {
                    var tag = $scope.tagModel.activeTags[i];

                    if (!tag.created) {
                        tag.associatedUuids = [$scope.taggedResourceUuid];
                        promises.push(Tags.addTag(tag).then(
                            function (response) {
                                totalAdded++;
                            },
                            function (response) {
                                isSuccess = false;
                                App.alert({
                                    type: 'danger',
                                    message: "Error adding tag to resource " + tag.associatedUuids
                                });
                            }));
                    } else if (tag.associatedUuids.indexOf($scope.taggedResourceUuid) == -1) {
                        tag.associatedUuids.push($scope.taggedResourceUuid);
                        promises.push(Tags.updateTag(tag).then(
                            function (response) {
                                totalAdded++;
                            },
                            function (response) {
                                isSuccess = false;
                                App.alert({
                                    type: 'danger',
                                    message: "Error updating tag with resource " + tag.associatedUuids
                                });
                            }));
                    }
                }

                for (var i = 0; i <  $scope.tagModel.removedTags.length; i++) {
                    var tag = $scope.tagModel.removedTags[i];
                    tag.associatedUuids.splice(tag.associatedUuids.indexOf($scope.taggedResourceUuid), 1);

                    promises.push(Tags.updateTag(tag).then(
                        function (response) {
                            totalAdded++;
                        },
                        function (response) {
                            isSuccess = false;
                            App.alert({
                                type: 'danger',
                                message: "Error updating tag removing resource " + tag.associatedUuids
                            });
                        }));
                }

                var deferred = $q.all(promises).then(
                    function(result) {
                        App.alert({message: "Successfully updated tags"});
                        clearTags();
                        $('#tagging-modal').modal('hide');
                    },
                    function(message, result) {
                        App.alert({
                            type: 'danger',
                            message: message
                        });
                    });

                return deferred.promise;
            };

            //$scope.$watch('taggedResourceUuid', function (oldVal, newVal) {
            //    if (oldVal !== newVal) {
            //        $timeout(function () {
            //            refreshTags();
            //        }, 0);
            //    }
            //});

            $('#tagging-modal').on('show.bs.modal', function() {
                $timeout(function () {
                    clearTags();
                    refreshTags();
                }, 0);
            });

            $('#tagging-modal').on('hide.bs.modal', function() {
                $timeout(function () {
                    clearTags();
                }, 0);
            });

            //var initSelect2 = function() {
            //    $($attrs.$$elem).find('.tag-selector').select2({
            //        minimumInputLength: 3,
            //        //style: 'btn-white',
            //        //showSubtext: true,
            //        searchInputPlaceholder: 'Select tag',
            //        multiple: true,
            //        tags: true,
            //        //ajax: {
            //        //    quietMillis: 250,
            //        //    data: function (term, pageNumber, context) {
            //        //        return {q: term};
            //        //    },
            //        //    transport: function (params) {
            //        //        if (params.data.q) {
            //        //            return Tags.list(99999, 0, {name: params.data.q}).then(params.success);
            //        //        } else {
            //        //            return Tags.list(99999, 0).then(params.success);
            //        //        }
            //        //    },
            //        //    results: function (response, pageNumber, query) {
            //        //        console.log(response.data);
            //        //
            //        //        var matches = [];
            //        //        angular.forEach(response.data, function (item, key) {
            //        //            this.push({id: item.id, text: item.name});
            //        //        }, matches);
            //        //
            //        //        return {results: matches};
            //        //    },
            //        //    params: {
            //        //        type: "GET",
            //        //        cache: false,
            //        //        dataType: "json"
            //        //    }
            //        //},
            //        //formatSelection: function (object, container) {
            //        //    var txt;
            //        //    if (object.text) {
            //        //        txt = object.text;
            //        //    } else {
            //        //        txt = object.name;
            //        //    }
            //        //    return '<span title="' + txt + '">' + txt + '</span>';
            //        //}
            //    })
            //};

            //$scope.$on('$destroy', function () {
            //    $scope.$evalAsync(function () {
            //        $(attributes.$$element).find('tag-selector').select('remove');
            //    });
            //});
        }
    };
});
