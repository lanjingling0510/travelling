module.exports = angular.module('travelling.reply.create.directive', [])
    .directive('replyStars', replyStars);

/* @ngInject*/
function replyStars() {
    const directive = {
        restrict: 'EA',
        replace: true,
        scope: {
            ngModel: '=',

        },
        template: '<span class="pull-right">' +
        '<i ng-click="toggleStar($index)" class="icon energized padding-right" ng-repeat="star in starList" ng-class="{\'ion-ios-star-outline\': !star.active, \'ion-ios-star\': star.active}"></i>' +
        '</span>',
        link: link,
    };

    function link($scope) {
        $scope.starList = [
            {active: false},
            {active: false},
            {active: false},
            {active: false},
            {active: false},
        ];

        $scope.toggleStar = function (index) {
            $scope.ngModel = 0;
            $scope.starList.forEach((value, i) => {
                if (index >= i) {
                    value.active = true;
                    $scope.ngModel += 20;
                } else {
                    value.active = false;
                }
            });
        };
    }

    return directive;
}
