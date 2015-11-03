module.exports = angular.module('travelling.share.list', [])
    .config(moduleConfig)
    .controller('shareListController', shareListController);


/* @ngInject */
function moduleConfig($stateProvider) {
    $stateProvider.state('share-list', {
        url: '/user/:_id/share/:type',
        views: {
            'main': {
                template: require('./share_list.html'),
                controller: 'shareListController as vm',
            },
        },
    });
}

/* @ngInject */
function shareListController($scope, Restangular, $stateParams) {
    const vm = this;
    const {type, _id} = $stateParams;
    const User = Restangular.one('User', _id);
    const query = {
        page: 0,
        limit: 10,
    };

    $scope.$on('$ionicView.enter', () => {
        initController();
    });

    vm.doRefresh = function () {
        initController();
    };

    function initController() {
        if (type === 'list') {
            vm.title = '游记';
            User.all('share').getList(query).then(shares => {
                vm.shares = shares;
            }).finally(function () {
                // Stop the ion-refresher from spinning
                $scope.$broadcast('scroll.refreshComplete');
            });
        } else {
            vm.title = '收藏';
            User.all('share/collect').getList(query).then(shares => {
                vm.shares = shares;
            }).finally(function () {
                // Stop the ion-refresher from spinning
                $scope.$broadcast('scroll.refreshComplete');
            });
        }
    }
}
