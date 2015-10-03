
module.exports = angular.module('travelling.tab', [
])
    .config(moduleConfig);


/* @ngInject */
function moduleConfig($stateProvider) {
    $stateProvider.state('tab', {
        url: '/tab',
        abstract: true,
        views: {
            'main': {
                template: require('./tab.html'),
            },
        },
    });
}
