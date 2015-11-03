module.exports = angular.module('travelling.user.list', [])
    .config(moduleConfig)
    .controller('UserListController', UserListController);


/* @ngInject */
function moduleConfig($stateProvider) {
    $stateProvider.state('user-list', {
        url: '/user/:_id/:type',
        views: {
            'main': {
                template: require('./user_list.html'),
                controller: 'UserListController as vm',
            },
        },
    });
}

/* @ngInject */
function UserListController(Restangular, $stateParams, $scope) {
    const vm = this;
    const User = Restangular.all('user');
    const query = {
        page: 0,
        limit: 10,
        search: $stateParams.type,
        keyword: $stateParams._id,
    };
    vm.cancelFollow = cancelFollow;
    vm.doRefresh = function () {
        initController();
    };

    $scope.$on('$ionicView.enter', function () {
        initController();
    });


    function cancelFollow($index) {
        User.one(vm.users[$index]._id).doPUT({userId: $stateParams._id}, 'unfollow').then(() => {
            vm.users.splice($index, 1);
        });
    }

    function initController() {
        if ($stateParams.type === 'fans') {
            vm.title = '我的关注';
            vm.shouldShowDelete = true;
        } else {
            vm.title = '我的粉丝';
            vm.shouldShowDelete = false;
        }

        User.getList(query).then(users => {
            vm.users = users;
        }).finally(function () {
            // Stop the ion-refresher from spinning
            $scope.$broadcast('scroll.refreshComplete');
        });
    }
}
