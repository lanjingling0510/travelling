module.exports = angular.module('travelling.home', [
    'ionic',
])
    .config(moduleConfig)
    .controller('HomeController', HomeController);

/* @ngInject */
function moduleConfig($stateProvider) {
    $stateProvider.state('tab.home', {
        url: '/home',
        views: {
            'tab-home': {
                template: require('./home.html'),
                controller: 'HomeController as vm',
            },
        },
    });
}

/* @ngInject */
function HomeController() {
    console.log('home');
    const vm = this;
    vm.click = click;

    function click() {
        console.log('123456');
    }
}
