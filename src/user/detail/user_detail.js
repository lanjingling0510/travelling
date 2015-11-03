module.exports = angular.module('travelling.user.detail', [])
    .config(moduleConfig)
    .controller('userController', userController);


/* @ngInject */
function moduleConfig($stateProvider) {
    $stateProvider.state('user-detail', {
        url: '/user/:_id',
        views: {
            'main': {
                template: require('./user_detail.html'),
                controller: 'userController as vm',
            },
        },
    });
}

/* @ngInject */
function userController(Restangular, $stateParams, $rootScope, $scope) {
    const vm = this;
    const _id = $stateParams._id;
    const userId = $rootScope.auth.profile._id;
    const User = Restangular.one('user', _id);
    vm._id = _id;
    vm.followUser = followUser;
    vm.unfollowUser = unfollowUser;

    $scope.$on('$ionicView.enter', function () {
        initController();
    });

    function followUser() {
        User.doPUT({userId: userId}, 'follow').then(result => vm.isFollow = result);
    }

    function unfollowUser() {
        User.doPUT({userId: userId}, 'unfollow').then(result => vm.isFollow = result);
    }

    function initController() {
        User.get().then(user => {
            vm.user = user;
            return User.doGET('judgefollow', {userId: userId});
        }).then(result => {
            vm.isFollow = result;
        });
    }
}
