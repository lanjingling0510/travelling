
module.exports = angular.module('travelling.tab', [
    'ionic',
])
    .config(moduleConfig);


/* @ngInject */
function moduleConfig($stateProvider) {
    $stateProvider.state('tab', {
        url: '/tab',
        abstract: true,
        template: require('./tab.html'),
    });
}
