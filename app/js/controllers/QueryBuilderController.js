angular.module('AgaveToGo').controller('QueryBuilderCtrl', ['$scope', function ($scope) {
    var data = '{"group": {"operator": "&","rules": []}}';

    function htmlEntities(str) {
        return String(str).replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    function computed(group) {
        if (!group) return "";
        for (var str = "", i = 0; i < group.rules.length; i++) {
            i > 0 && (str += "" + group.operator + "");
            str += group.rules[i].group ?
                computed(group.rules[i].group) :
                group.rules[i].field + htmlEntities(group.rules[i].condition) + group.rules[i].data;
        }

        return str;
    }

    $scope.json = null;

    $scope.filter = JSON.parse(data);

    $scope.$watch('filter', function (newValue) {
        $scope.json = JSON.stringify(newValue, null, 2);
        $scope.query = computed(newValue.group);
    }, true);

}]);
