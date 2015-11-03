module.exports = angular.module('travelling.share.detail', [])
    .config(moduleConfig)
    .controller('shareDetailController', shareDetailController);


/* @ngInject */
function moduleConfig($stateProvider) {
    $stateProvider.state('share-detail', {
        url: '/share/:_id',
        views: {
            'main': {
                template: require('./share_detail.html'),
                controller: 'shareDetailController as vm',
            },
        },
    });
}

/* @ngInject*/
function shareDetailController($scope, Restangular, $stateParams, $rootScope, AlertService) {
    const vm = this;
    const Share = Restangular.one('share', $stateParams._id);
    vm._id = $rootScope.auth.profile._id;
    vm.collectShare = collectShare;
    vm.uncollectShare = uncollectShare;
    vm.removeShare = removeShare;

    vm.query = {
        page: 0,
        limit: 10,
    };

    $scope.$on('$ionicView.enter', () => {
        Share.get()
            .then(share => {
                vm.share = share;
                return Share.all('reply').getList(vm.query);
            })
            .then(replys => {
                vm.replys = replys;
                judgeCollectShare();
            });
    });

    //  判断是否收藏分享
    function judgeCollectShare() {
        Share.doGET('judgecollect', {userId: vm._id}).then(result => vm.isCollect = result);
    }

    //  收藏一个分享
    function collectShare() {
        Share.doPUT({userId: vm._id}, 'collect').then(result => vm.isCollect = result);
    }

    //  取消收藏一个分享
    function uncollectShare() {
        Share.doPUT({userId: vm._id}, 'uncollect').then(result => vm.isCollect = result);
    }

    //  删除一个分享
    function removeShare() {
        vm.share.remove().then(() => {
            AlertService.warning('删除成功！').then(() => vm.goBack());
        }).catch(err => {
            AlertService.warning(err.data);
        });
    }
}
