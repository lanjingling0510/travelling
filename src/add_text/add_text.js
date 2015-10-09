module.exports = angular.module('travelling.add.text', [])
    .config(ModuleConfig)
    .controller('AddTextController', AddTextController);

/* @ngInject */
function ModuleConfig($stateProvider) {
    $stateProvider.state('tab.add-text', {
        url: '/add/text',
        views: {
            'tab-add': {
                template: require('./add_text.html'),
                controller: 'AddTextController as vm',
            },
        },

    });
}

/* @ngInject */
function AddTextController($scope, store, $state, AlertService, $ionicHistory) {
    const vm = this;
    vm.nextPage = nextPage;

    $scope.$on('$ionicView.enter', function () {
        vm.text = store.get('share.text');
    });

    initController();

    function nextPage() {
        if (/^.{12,}$/.test(vm.text)) {
            store.set('share.text', vm.text);
            $state.go('tab.add-pos');
        } else {
            AlertService.warning('不少于12个字，不含特殊符号');
        }
    }

    function initController() {
        //  如果刷新页面，则没有历史记录，跳转到add-label页面
        if (!$ionicHistory.viewHistory().backView) {
            $state.go('tab.add-label');
        }
    }
}
