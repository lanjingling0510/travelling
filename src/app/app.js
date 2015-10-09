
import 'babel-core/polyfill';
require('./lib/ionic/js/ionic-angular.min.js');
require('./lib/ngCordova/dist/ng-cordova.js');
require('./app.css');
require('../common/service.js');

require('../register/register.js');
require('../login/login.js');
require('../tab/tab.js');
require('../home/home.js');

require('../add_label/add_label.js');
require('../add_text/add_text.js');
require('../add_pos/add_pos.js');
require('../add_img/add_img.js');

require('../account/account.js');


module.export = angular.module('travelling', [
    'ionic',
    'ngCordova',
    'angular-storage',
    'restangular',
    'travelling.common.services',
    'travelling.register',
    'travelling.login',
    'travelling.tab',
    'travelling.home',
    'travelling.add.label',
    'travelling.add.text',
    'travelling.add.pos',
    'travelling.add.img',
    'travelling.account',
]).config(moduleConfig)
    .run(ModuleRun);


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
    $locationProvider.html5Mode(true);
    RestangularProvider.setBaseUrl('/apis');
    RestangularProvider.setRestangularFields({id: '_id'});
}


/* ngInject*/
function ModuleRun($ionicPlatform, $rootScope, store, $state) {
    //在app准备好后运行
    $ionicPlatform.ready(function () {
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
            return null;
        }
    }

    $rootScope.logout = logout;

    function logout() {
        delete $rootScope.auth;
        store.remove('auth.profile');
        store.remove('auth.accessToken');
        $state.go('login');
    }
}
