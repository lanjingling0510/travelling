module.exports = angular.module('travelling.add.label.directive', [])
    .directive('labelWrap', labelWrapDirective)
    .directive('labelAdd', labelAddDirective)
    .directive('labelRemove', labelRemoveDirective);


/* @ngInject*/
function labelWrapDirective($animate) {
    const directive = {
        restict: 'EA',
        replace: true,
        transclude: true,
        template: '<div ng-transclude></div>',
        controller: controller,
    };


    /* @ngInject*/
    function controller($scope, $element) {
        let animating = false;
        this.addLabel = addLabel;
        this.removeLabel = removeLabel;

        function addLabel(name, ele) {
            const obj = ele.clone();
            if (animating) return false;
            animating = true;
            $element.append(obj);
            $animate.addClass(obj, 'ani-label')
                .then(() => {
                    obj.removeClass('ani-label');
                    obj.remove();
                    $scope.vm.labelsArray.push(name);
                    $scope.label.on = true;
                    animating = false;
                });
        }

        function removeLabel(name) {
            const index = $scope.vm.labelsArray.findIndex((value) => value === name);
            if (index !== -1) {
                $scope.label.on = false;
                $scope.vm.labelsArray.splice(index, 1);
            }
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
            name: '@',
        },
        require: '^labelWrap',
        template: '<span ng-click="addLabel()" ng-style="{\'background-image\':\'url(\'+bg+\')\'}"></span>',
        link: link,
    };

    function link($scope, $ele, $attr, $transclude) {
        $scope.addLabel = () => $transclude.addLabel($scope.name, $ele);
    }

    return directive;
}

/* @ngInject*/
function labelRemoveDirective() {
    const directive = {
        restrict: 'EA',
        replace: true,
        scope: {
            name: '@',
        },
        require: '^labelWrap',
        template: '<span ng-click="removeLabel()">' +
        '<img src="images/add-button.png" style="margin:25%;width:50%" alt=""/>' +
        '</span>',
        link: link,
    };

    function link($scope, $ele, $attr, $transclude) {
        $scope.removeLabel = function () {
            $transclude.removeLabel($scope.name);
        };
    }

    return directive;
}
