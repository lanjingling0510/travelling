var myApp=angular.module('starter', ['ionic','ngCordova', 'starter.controllers', 'starter.services'])

    .run(function ($rootScope,$ionicPlatform, $cordovaToast,$location,$ionicHistory,NewAppVersion,$cordovaAppVersion,$cordovaKeyboard) {

        $rootScope.backButtonPressedOnceToExit=false;
        $ionicPlatform.ready(function () {
            if (window.StatusBar) {
                StatusBar.styleLightContent();
            }

            /*
             *
             * 功能:升级APP
             *
             * */
            $cordovaAppVersion.getAppVersion().then(function(version){
                console.log("当前的版本："+version);
                NewAppVersion.get().success(function(data){
                    if(data.version!=version){
                        NewAppVersion.showUpdateConfirm(data.content,data.version);
                    }
                })
            })


            /*
            *
            * 功能：触发cordova键盘的操作
            *
            * */
             if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
                cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
                $rootScope.$on('$cordovaKeyboard:show',function(){
                    console.log('keyboard...show');
                    var registerFun=$ionicPlatform.registerBackButtonAction(function(e){
                        e.preventDefault();
                        $cordovaKeyboard.close();
                        //注销掉添加的返回事件
                        registerFun();
                        return false;
                    },501);


                });



            }

        });



        /*
        *
        * 功能:点击手机返回绑定的回调函数
        *
        * */

         $ionicPlatform.registerBackButtonAction(function(e){
             e.preventDefault();
             var exitView=[
                "/menu/tab/nav",
                "/menu/tab/home",
                "/menu/tab/add-pos"
            ];

             var nowView=$location.path();

             //判断处于哪个页面时双击退出
             if(exitView.indexOf(nowView)>-1){
                 if($rootScope.backButtonPressedOnceToExit){
                     ionic.Platform.exitApp();
                 }else{
                     $rootScope.backButtonPressedOnceToExit=true;
                     $cordovaToast.showShortBottom('再按一次退出程序...');
                     setTimeout(function(){
                         $rootScope.backButtonPressedOnceToExit=false;
                     },2000)
                 }
             }else{
                 $ionicHistory.goBack();
             }
            return false;
        },101);




        $rootScope.$on('$stateChangeStart',function(evt,toState,toParams,fromState,fromParams){
            //console.log(toState);
            //if(typeof $ionicTabsDelegate.selectedIndex()=='undefined'){
            //    $location.path('/menu/tab/home');
            //}


        })




    })

    .config(function ($stateProvider, $urlRouterProvider, $ionicConfigProvider) {
        $ionicConfigProvider.views.forwardCache(true);
        $ionicConfigProvider.views.transition('android');
        $ionicConfigProvider.navBar.alignTitle('center');
        $ionicConfigProvider.navBar.transition('ios');
        $ionicConfigProvider.backButton.previousTitleText(false);
        $ionicConfigProvider.tabs.style('striped');
        $ionicConfigProvider.tabs.position('bottom');
        //$ionicConfigProvider.views.maxCache(0);
        //$ionicConfigProvider.templates.maxPrefetch(0);
        $stateProvider

            .state('menu', {
                url: "/menu",
                abstract: true,
                templateUrl: "menu"
            })

            .state('menu.myShare',{
                url:"/my-share",
                views:{
                    'menuContent':{
                        templateUrl:"templates/my-share.html",
                        controller:"MyShareCtrl"
                    }
                }
            })
            .state('menu.myShare2',{
                url:"/my-share2/:id",
                views:{
                    'menuContent':{
                        templateUrl:"templates/my-share2.html",
                        controller:"MyShare2Ctrl"

                    }
                }
            })
            // setup an abstract state for the tabs directive
            .state('menu.tab', {
                url: "/tab",
                views: {
                    'menuContent': {
                        templateUrl: "tabs"
                    }
                }
            })

            // Each tab has its own nav history stack:

            .state('menu.tab.home', {
                url: '/home',
                views: {
                    'tab-home': {
                        templateUrl: 'templates/tab-home.html',
                        controller: 'HomeCtrl'
                    }
                }
            })


            .state('menu.tab.add-pos', {
                url: '/add-pos',
                views: {
                    'tab-add': {
                        templateUrl: 'templates/tab-addPos.html',
                        controller: 'AddPosCtrl'
                    }
                }
            })

            .state('menu.tab.add-label', {
                url: '/add-label',
                views: {
                    'tab-add': {
                        templateUrl: 'templates/tab-addLabel.html',
                        controller: 'AddLabelCtrl'
                    }
                }
            })

            .state('menu.tab.add-text', {
                url: '/add-text',
                views: {
                    'tab-add': {
                        templateUrl: 'templates/tab-addText.html',
                        controller: 'AddTextCtrl'
                    }
                }
            })

            .state('menu.tab.add-img', {
                url: '/add-img',
                views: {
                    'tab-add': {
                        templateUrl: 'templates/tab-addImg.html',
                        controller: 'AddImgCtrl'
                    }
                }
            })

            .state('menu.tab.nav', {
                url: '/nav',
              // cache:false,
                views: {
                    'tab-nav': {
                        templateUrl: 'templates/tab-nav.html',
                        controller: 'NavCtrl'
                    }
                }
            })

            .state('menu.tab.navShare', {
                url: '/nav-share/:id',
                // cache:false,
                views: {
                    'tab-nav': {
                        templateUrl: 'templates/tab-navShare.html',
                        controller: 'NavShareCtrl'
                    }
                }
            })


        // if none of the above states are matched, use this as the fallback
        $urlRouterProvider.otherwise('/menu/tab/home');
    })

    .filter('convertDate',function(Until){
        return function(timeStamp){
            return Until.convertDate(timeStamp);
        }
    })
    .filter('convertImgStr',function(host){
        return function(input,first){
            var arr;
            arr=(input&&input.split(','))||[];
            arr.forEach(function(item,index){
                arr[index]=host+"/travelling-server/Public/upload/"+item;
            });
            if(first){
                return arr[0];
            }else{
                return arr;
            }
        }
    })
