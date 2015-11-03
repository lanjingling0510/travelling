module.exports = angular.module('travelling.user.search', [])
    .config(moduleConfig)
    .controller('UserSearchController', UserSearchController);


/* @ngInject */
function moduleConfig($stateProvider) {
    $stateProvider.state('user-search', {
        url: '/user/search',
        views: {
            'main': {
                template: require('./user_search.html'),
                controller: 'UserSearchController as vm',
            },
        },
    });
}

/* @ngInject */
function UserSearchController(Restangular, $timeout) {
    const vm = this;
    const User = Restangular.all('user');
    let timer;
    vm.query = {
        search: 'nickname',
        keyword: '',
    };

    vm.inputChange = inputChange;

    function inputChange() {
        $timeout.cancel(timer);
        timer = $timeout(() => {
            User.getList(vm.query).then(users => {
                vm.users = users;
            });
        }, 200);
    }
}
