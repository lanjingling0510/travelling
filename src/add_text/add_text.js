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
function AddTextController($scope, store, $state, $ionicPopup) {
    const vm = this;

    $scope.$on('$ionicView.enter', function () {
        vm.text = store.get('share.text') || '';
    });

    store.remove('share.text');
    vm.nextPage = nextPage;

    function nextPage() {
        if (/^[\u4E00-\u9FA5A-Za-z0-9_]{12,}$/.test(vm.text)) {
            store.set('share.text', vm.text);
            $state.go('tab.add-pos');
        } else {
            $ionicPopup.alert({
                title: '<h2><i class="icon ion-alert-circled assertive"></i> 提示</h2>',
                template: '不少于12个字，不含特殊符号',
                okText: '确定',
            });
        }
    }
}
