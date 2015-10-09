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
function AddLabelController($scope, store, $state, $rootScope, Restangular) {
    const vm = this;
    const Labels = Restangular.all('label');
    // With the new view caching in Ionic, Controllers are only called
    // when they are recreated or on app start, instead of every page change.
    // To listen for when this page is active (for example, to refresh data),
    // listen for the $ionicView.enter event:
    //
    $scope.$on('$ionicView.enter', function () {
        vm.labelsList = Labels.getList().$object;
    });

    vm.nextPage = nextPage;

    initController();

    function nextPage() {
        store.set('share.labels', vm.labelsList.filter(value => value.selected === true).map(value => value._id));
        $state.go('tab.add-text');
    }


    function initController() {
        store.remove('share.city');
        store.remove('share.labels');
        store.remove('share.text');
        store.remove('share.coordinates');
        store.remove('share.place');
        if (!$rootScope.auth) {
            $state.go('login');
        }
    }
}
