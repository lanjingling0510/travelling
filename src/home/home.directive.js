module.exports = angular.module('travelling.home.directive', [])
    .directive('dropDown', dropDown)
    .directive('subDropDown', subDropDown);


/* @ngInject */
function dropDown() {
    return {
        restrict: 'EA',
        replace: true,
        scope: {
            title: '@',
        },
        transclude: true,
        template: '<div class="bar bar-subheader">' +
        '<div class="button-bar">' +
        '<a ng-repeat="scope in scopes" class="button button-clear button-dark" ng-click="toggle(scope)">' +
        ' <i ng-hide="scope.select" class="icon ion-android-arrow-dropdown"></i>' +
        ' <i ng-show="scope.select" class="icon ion-android-arrow-dropup"></i>' +
        '{{scope.title}} </a>' +
        '</div>' +
        '<div ng-transclude class="nav-dropdown-wrap""></div>',
        controller: function ($scope) {
            const scopes = $scope.scopes = [];
            this.addScope = function (scope) {
                scopes.push(scope);
            };
            this.toggle = $scope.toggle = function (scope) {
                angular.forEach(scopes, value => {
                    if (value === scope) {
                        value.select = !value.select;
                    } else {
                        value.select = false;
                    }
                });
            };
            this.close = function () {
                angular.forEach(scopes, value => value.select = false);
            };
        },
    };
}


/* @ngInject */
function subDropDown() {
    return {
        restrict: 'EA',
        replace: true,
        scope: {
            title: '@',
        },
        require: '^dropDown',
        transclude: true,
        template: '<div ng-click="closeSubDropDown()" ng-transclude ng-show="select" class="list"></div>',
        link: function (scope, ele, attr, ctrl) {
            scope.select = false;
            ctrl.addScope(scope);
            scope.closeSubDropDown = function () {
                scope.select = false;
            };
        },
    };
}
