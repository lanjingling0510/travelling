require('./account.css');
const Template = require('./account_tpl.html');

module.exports = angular.module('travelling.account', [])
    .config(moduleConfig)
    .controller('AccountController', AccountController);


/* @ngInject */
function moduleConfig($stateProvider) {
    $stateProvider.state('tab.account', {
        url: '/account',
        views: {
            'tab-account': {
                template: require('./account.html'),
                controller: 'AccountController as vm',
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
function AccountController($scope, Restangular, $ionicPopover, profile, $state) {
    const vm = this;
    vm._id = profile._id;
    const User = Restangular.one('user', vm._id);
    const Share = Restangular.all('Share');

    const query = {
        userId: vm._id,
        orderBy: 'date',
        order: -1,
        page: 0,
        limit: 10,
    };

    vm.logOut = function () {
        vm.closePopover();
        $state.go('login');
    };

    vm.popover = $ionicPopover.fromTemplate(Template, {
        scope: $scope,
    });

    vm.openPopover = function ($event) {
        vm.popover.show($event);
    };

    vm.closePopover = function () {
        vm.popover.hide();
    };


    $scope.$on('$ionicView.enter', function () {
        initController();
    });

    function initController() {
        User.get().then(user => {
            vm.user = user;
            return Share.getList(query);
        }).then(shares => {
            vm.shares = shares;
        });
    }
}


