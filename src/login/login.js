module.exports = angular.module('travelling.login', [
])
    .config(moduleConfig)
    .controller('loginController', loginController);


/* @ngInject */
function moduleConfig($stateProvider) {
    $stateProvider.state('login', {
        url: '/login',
        views: {
            'main': {
                template: require('./login.html'),
                controller: 'loginController as vm',
            },
        },
    });
}

/* @ngInject */
function loginController($rootScope, store, AlertService, $state, Restangular) {
    const vm = this;
    vm.login = login;
    const auth = Restangular.all('auth');
    initController();

    function login(user) {
        auth.one('token').doPOST(user).then(function (res) {
            const token = res.access_token;
            store.set('auth.accessToken', token);
            if (!$rootScope.auth) {
                $rootScope.auth = {};
            }
            $rootScope.auth.accessToken = token;
            return auth.one('profile').doGET();
        }).then(function (profile) {
            store.set('auth.profile', profile);
            $rootScope.auth.profile = profile;
            $state.go('tab.home');
        }).catch(function (err) {
            AlertService.warning(err.data);
        });
    }

    function initController() {
        vm.user = {
            username: '',
            password: '',
        };
    }
}
