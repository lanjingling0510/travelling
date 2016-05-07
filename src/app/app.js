require('./app.css');
require('./lib/ionic/js/ionic.min.js');
require('./lib/ionic/js/ionic-angular.min.js');
// require('./lib/ngCordova/dist/ng-cordova.js');
require('core-js/es6/promise');
require('core-js/es6/array');
require('../common/service.js');
require('../register/register.js');
require('../login/login.js');

require('../tab/tab.js');
require('../home/home.js');
require('../share/list/share_list.js');
require('../share/detail/share_detail.js');
require('../reply/create/reply_create.js');
require('../user/list/user_list.js');
require('../user/detail/user_detail.js');
require('../user/search/user_search.js');
require('../user/edit/user_edit.js');

require('../add_label/add_label.js');
require('../add_text/add_text.js');
require('../add_pos/add_pos.js');
require('../add_img/add_img.js');


require('../account/account.js');


module.export = angular.module('travelling', [
    'ionic',
    'angular-storage',
    'restangular',
    'travelling.common.services',
    'travelling.register',
    'travelling.login',
    'travelling.tab',
    'travelling.user.list',
    'travelling.user.edit',
    'travelling.user.search',
    'travelling.user.detail',
    'travelling.share.list',
    'travelling.share.detail',
    'travelling.reply.create',
    'travelling.home',
    'travelling.add.label',
    'travelling.add.text',
    'travelling.add.pos',
    'travelling.add.img',
    'travelling.account',
]).config(moduleConfig)
    .run(ModuleRun)
    .filter('convertDate', function (ConvertDateService) {
        return timeStamp => ConvertDateService(timeStamp);
    })
    .filter('convertSCore', function () {
        return value => {
            let score = value;
            let scoreTemplate = '';

            for (let i = 5; i--;) {
                if (score - 20 >= 0) {
                    scoreTemplate += '<i class="icon energized ion-ios-star padding-right"></i>';
                } else {
                    scoreTemplate += '<i class="icon energized ion-ios-star-outline padding-right"></i>';
                }

                score -= 20;
            }

            return scoreTemplate;
        };
    });


/* ngInject*/
function moduleConfig($locationProvider, $urlRouterProvider, $ionicConfigProvider, RestangularProvider) {
    $ionicConfigProvider.views.forwardCache(true);
    $ionicConfigProvider.views.transition('android');
    $ionicConfigProvider.navBar.alignTitle('center');
    $ionicConfigProvider.navBar.transition('ios');
    $ionicConfigProvider.backButton.previousTitleText(false);
    $ionicConfigProvider.backButton.text('返回');
    $ionicConfigProvider.tabs.style('striped');
    $ionicConfigProvider.tabs.position('bottom');
    $urlRouterProvider.otherwise('/tab/home');
    // $locationProvider.html5Mode(true);
    RestangularProvider.setBaseUrl('http://www.cyt-rain.cn:3001');
    RestangularProvider.setRestangularFields({id: '_id'});
}


/* ngInject*/
function ModuleRun($ionicPlatform, $rootScope, store, $state, $ionicHistory) {
    console.log('App-run...');
    // 在app准备好后运行,无论在web还是在app
    $ionicPlatform.ready(function () {
        console.log('App-ready...');
        // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
        // for form inputs)
        if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
            cordova.plugins.Keyboard.disableScroll(true);
        }

        if (window.StatusBar) {
            StatusBar.styleLightContent();
        }
    });


    if (!$rootScope.auth || !$rootScope.auth.profile || !$rootScope.auth.accessToken) {
        if (store.get('auth.profile') && store.get('auth.accessToken')) {
            $rootScope.auth = {
                profile: store.get('auth.profile'),
                accessToken: store.get('auth.accessToken'),
            };
        } else {
            $state.go('login');
        }
    }

    $rootScope.$on('$stateChangeError', function (event, toState, toParams, fromState, fromParams, error) { // eslint-disable-line
        $state.go('login');
    });


    $rootScope.logout = logout;
    $rootScope.goBack = goBack;

    function logout() {
        delete $rootScope.auth;
        store.remove('auth.profile');
        store.remove('auth.accessToken');
        $state.go('login');
    }

    //  返回上一个历史视图
    function goBack() {
        $ionicHistory.goBack();
    }
}
