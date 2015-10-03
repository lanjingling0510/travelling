module.exports = angular.module('travelling.account', [
])
    .config(moduleConfig)
    .controller('AccountController', AccountController);

/* @ngInject */
function moduleConfig($stateProvider) {
    $stateProvider.state('tab.account', {
        url: '/account',
        views: {
            'tab-account': {
                template: require('./account.html'),
                controller: 'AccountController as vm',
            },
        },

    });
}

/* @ngInject */
function AccountController($scope) {
    const vm = this;
    $scope.settings = {
        enableFriends: true,
    };
}


