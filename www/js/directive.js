/**
 * Created by 陈雨天 on 2015/6/24.
 */
myApp

    .directive('nextPosBtn', function ($location) {
        return {
            restrict: "A",
            link: function ($scope, $ele, $attr) {
                $ele.bind('click', function () {
                    if ($attr.target) {
                        $scope.$apply(function () {
                            $location.path($attr.path);
                        })
                    }
                })
            }
        }
    })

    //====================================================
    //删除分享的图片
    //====================================================
    .directive('deleteItem', function () {
        return {
            restrict: "A",
            link: function ($scope, $ele) {
                $ele
                    .on('touchstart', function () {
                        if ($scope.img.close) {
                            $scope.img.close = false;
                            $scope.$digest();
                            return;
                        }
                        console.log('touchstart...');
                        $scope.deleting = true;
                        $scope.date = +new Date();
                    })
                    .on('touchmove', function (e) {
                        //阻止UC默认的长按弹窗
                        e.preventDefault();
                    })
                    .on('touchend', function () {
                        if ($scope.deleting && !$scope.img.close) {
                            console.log('touchend...')
                            $scope.deleting = false;
                            var now = +new Date();
                            if (now - $scope.date > 500) {
                                $scope.img.close = true;
                                $scope.$digest();
                            }
                        }
                    });

                $ele.find('span').on('touchstart', function (event) {
                    event.preventDefault();
                    event.stopPropagation();
                    var index = $scope.$index;
                    $scope.$apply(function () {
                        $scope.tpl_list.splice(index, 1);
                    })
                })
            }
        }
    })
//====================================================
//标签指令
//====================================================

    .directive('labelWrap', function ($animate, $timeout) {
        return {
            restrict: "EA",
            replace: true,
            transclude: true,
            template: '<div ng-transclude></div>',
            controller: function ($scope, $element) {
                var animating = false;

                this.addLabel = function (name, ele) {
                    var obj = ele.clone();
                    if (animating) {
                        return false;
                    }
                    animating = true;
                    $element.append(obj);
                    $animate.addClass(obj, "ani-label")
                        .then(function () {
                            obj.removeClass("ani-label");
                            obj.remove();
                            $scope.$apply(function () {
                                $scope.share_labels.push(name);
                                $scope.label.on = true;
                                $timeout(function () {
                                    animating = false;
                                }, 300);

                            });
                        });
                };

                this.removeLabel = function (name) {
                    if (animating) {
                        return false;
                    }
                    var index = $scope.share_labels.indexOf(name);
                    if (index != -1) {
                        $scope.label.on = false;
                        $scope.share_labels.splice(index, 1);
                    }

                };

            }
        }
    })


    .directive('labelAdd', function () {
        return {
            restrict: "EA",
            replace: true,
            scope: {
                labelBG: '@bg',
                name: '@'
            },
            require: '^labelWrap',
            template: '<span ng-click="addLabel()" ng-style="{\'background-image\':\'url(\'+labelBG+\')\'}"></span>',
            link: function ($scope, $ele, $attr, $transclude) {
                $scope.addLabel = function () {
                    $transclude.addLabel($scope.name, $ele);
                };
            }
        }
    })

    .directive('labelRemove', function () {
        return {
            restrict: "EA",
            replace: true,
            scope: {
                name: '@'
            },
            require: '^labelWrap',
            template: '<span ng-click="removeLabel()">' +
            '<img src="img/add-button.png" style="margin:25%;width:50%" alt=""/>' +
            '</span>',
            link: function ($scope, $ele, $attr, $transclude) {
                $scope.removeLabel = function () {
                    $transclude.removeLabel($scope.name);
                };
            }
        }
    })

//====================================================
//导航下拉选项指令
//====================================================
    .directive('dropDown', function () {
        return {
            restrict: "EA",
            replace: true,
            scope:{},
            transclude: true,
            template: '<div class="bar bar-subheader" style="border-bottom:1px solid rgba(204, 204, 204, 0.4)">' +
            '<div class="button-bar">' +
            '<a ng-repeat="scope in scopes" class="button button-clear" ng-click="select(scope)">' +
            ' <i ng-hide="scope.select" class="icon ion-android-arrow-dropdown"></i>' +
            ' <i ng-show="scope.select" class="icon ion-android-arrow-dropup"></i>' +
            '{{scope.title}} </a>' +

            '</div>' +
            '<div ng-transclude class="nav-dropdown-wrap""></div>',
            controller: function ($scope) {
                var scopes=$scope.scopes=[];
               this.addScope=function(scope){
                   scopes.push(scope)
               };
               this.select=$scope.select=function(scope){
                    angular.forEach(scopes,function(scope){
                       scope.select=false;
                   });
                   scope.select=true;
               };
               this.close=function(){
                   angular.forEach(scopes,function(scope){
                       scope.select=false;
                   });
               }
            }

        }
    })
    .directive('subDropDown', function () {
        return{
            restrict: "EA",
            replace: true,
            scope: {
                title:'@'
            },
            require: '^dropDown',
            transclude:true,
            template:'<div ng-transclude ng-click="close()" ng-show="select"></div>',
            link:function(scope,ele,attr,ctrl){
                scope.select=false;
                ctrl.addScope(scope);
                scope.close=function(){
                    ctrl.close();
                };
            }
        }
    })

//====================================================
//星星评分指令
//====================================================


.directive('star',function(){
        return{
            restrict:"EA",
            link:function($scope,$ele,$atr){
                $scope.toggleStar=function(){
                        $scope.reply.reply_score=0;
                        $scope.$parent.startList.forEach(function(value,index){
                            if(index<=$scope.$index){
                                $scope.reply.reply_score+=value.score;
                                value.handle=true;
                            }else{
                                value.handle=false;
                            }
                        });


                }
            }
        }
    })



