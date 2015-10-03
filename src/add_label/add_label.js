require('./add_label.css');
require('./add_label_directive.js');

module.exports = angular.module('travelling.add.label', [
    'travelling.add.label.directive',
])
    .config(ModuleConfig)
    .controller('AddLabelController', AddLabelController);

/* @ngInject */
function ModuleConfig($stateProvider) {
    $stateProvider.state('tab.add-label', {
        url: '/add/label',
        views: {
            'tab-add': {
                template: require('./add_label.html'),
                controller: 'AddLabelController as vm',
            },
        },

    });
}

/* @ngInject */
function AddLabelController($scope, store, $state) {
    const vm = this;
    // With the new view caching in Ionic, Controllers are only called
    // when they are recreated or on app start, instead of every page change.
    // To listen for when this page is active (for example, to refresh data),
    // listen for the $ionicView.enter event:
    //
    $scope.$on('$ionicView.enter', function () {
        vm.labelsArray = store.get('share.labels') || [];
    });

    vm.labelsArray = [];
    vm.labelsList = [
        {image: './images/label-view.png', name: '风景', on: false},
        {image: './images/label-play.png', name: '娱乐', on: false},
        {image: './images/label-cart.png', name: '购物', on: false},
        {image: './images/label-room.png', name: '酒店', on: false},
        {image: './images/label-food.png', name: '美食', on: false},
    ];

    store.remove('share.labels');
    vm.nextPage = nextPage;

    function nextPage() {
        store.set('share.labels', vm.labelsArray);
        $state.go('tab.add-text');
    }
}
