
require('./app.css');
require('../common/service.js');

require('../register/register.js');
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
function moduleConfig($locationProvider, $urlRouterProvider, $ionicConfigProvider) {
    $ionicConfigProvider.views.forwardCache(true);
    $ionicConfigProvider.views.transition('android');
    $ionicConfigProvider.navBar.alignTitle('center');
    $ionicConfigProvider.navBar.transition('ios');
    $ionicConfigProvider.backButton.previousTitleText(false);
    $ionicConfigProvider.backButton.text('返回');
    $ionicConfigProvider.tabs.style('striped');
    $ionicConfigProvider.tabs.position('bottom');
    $urlRouterProvider.otherwise('/tab/home');
      //    $locationProvider.html5Mode(true);
}


/* ngInject*/
function ModuleRun($ionicPlatform) {
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
}
