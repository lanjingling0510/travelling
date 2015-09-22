require('./chats.service.js');

module.exports = angular.module('travelling.chats', [
    'ionic',
    'travelling.chats.service',
])
    .config(ModuleConfig)
    .controller('ChatsController', ChatsController);

/* @ngInject */
function ModuleConfig($stateProvider) {
    $stateProvider.state('tab.chats', {
        url: '/chats',
        views: {
            'tab-chats': {
                template: require('./chats.html'),
                controller: 'ChatsController as vm',
            },
        },

    });
}

/* @ngInject */
function ChatsController($scope, chatsService) {
    const vm = this;
    // With the new view caching in Ionic, Controllers are only called
    // when they are recreated or on app start, instead of every page change.
    // To listen for when this page is active (for example, to refresh data),
    // listen for the $ionicView.enter event:
    //
    //$scope.$on('$ionicView.enter', function(e) {
    //});

    $scope.chats = chatsService.all();
    $scope.remove = function (chat) {
        chatsService.remove(chat);
    };
}
