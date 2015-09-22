require('./app.less');
require('../tab/tab.js');
require('../home/home.js');
require('../chats/chats.js');
require('../account/account.js');


module.export = angular.module('travelling', [
    'ionic',
    'travelling.tab',
    'travelling.home',
    'travelling.chats',
    'travelling.account',
]).config(moduleConfig)
    .run(ModuleRun);


/* ngInject*/
function moduleConfig($locationProvider, $urlRouterProvider) {
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
