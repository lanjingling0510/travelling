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
                resolve: {
                    profile: ['Authorization', function (Authorization) {
                        return Authorization();
                    }],
                },
            },
        },

    });
}

/* @ngInject */
function AddLabelController($scope, store, $state, Restangular) {
    const vm = this;
    const Labels = Restangular.all('label');

    vm.nextPage = nextPage;

    $scope.$on('$ionicView.enter', function () {
        initController();
    });


    function nextPage() {
        store.set('share.labels', vm.labelsList.filter(value => value.selected === true).map(value => value._id));
        $state.go('tab.add-text');
    }


    function initController() {
        Labels.getList().then(data => {
            vm.labelsList = data;
            vm.labelsList.map((label) => {
                return {
                    ...label,
                    selected: false,
                };
            });
        });

        store.remove('share.city');
        store.remove('share.labels');
        store.remove('share.text');
        store.remove('share.coordinates');
        store.remove('share.place');
    }
}
