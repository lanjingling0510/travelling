module.exports = angular.module('travelling.add.label.directive', [])
    .directive('labelWrap', labelWrapDirective)
    .directive('labelAdd', labelAddDirective)
    .directive('labelRemove', labelRemoveDirective);


/* @ngInject*/
function labelWrapDirective() {
    const directive = {
        restict: 'EA',
        replace: true,
        transclude: true,
        template: '<div ng-transclude></div>',
        controller: controller,
    };


    /* @ngInject*/
    function controller($scope, $element, $animate) {
        let animating = false;
        this.addLabel = addLabel;
        this.removeLabel = removeLabel;

        function addLabel(ele) {
            const obj = ele.clone();
            if (animating) return false;
            animating = true;
            $element.append(obj);
            $animate.addClass(obj, 'ani-label')
                .then(() => {
                    obj.removeClass('ani-label');
                    obj.remove();
                    $scope.label.selected = true;
                    animating = false;
                });
        }

        function removeLabel() {
                $scope.label.selected = false;
        }
    }

    return directive;
}


/* @ngInject*/
function labelAddDirective() {
    const directive = {
        restrict: 'EA',
        replace: true,
        scope: {
            bg: '@',
        },
        require: '^labelWrap',
        template: '<span ng-click="addLabel()" ng-style="{\'background-image\':\'url(\'+bg+\')\'}"></span>',
        link: link,
    };

    function link($scope, $ele, $attr, $transclude) {
        $scope.addLabel = () => $transclude.addLabel($ele);
    }

    return directive;
}

/* @ngInject*/
function labelRemoveDirective() {
    const directive = {
        restrict: 'EA',
        replace: true,
        scope: {},
        require: '^labelWrap',
        template: '<span ng-click="removeLabel()">' +
        '<img src="images/add-button.png" style="margin:25%;width:50%" alt=""/>' +
        '</span>',
        link: link,
    };

    function link($scope, $ele, $attr, $transclude) {
        $scope.removeLabel = function () {
            $transclude.removeLabel();
        };
    }

    return directive;
}
