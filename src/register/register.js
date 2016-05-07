module.exports = angular.module('travelling.register', [
])
    .config(moduleConfig)
    .controller('registerController', registerController);


/* @ngInject */
function moduleConfig($stateProvider) {
    $stateProvider.state('register', {
        url: '/register',
        views: {
            'main': {
                template: require('./register.html'),
                controller: 'registerController as vm',
            },
        },
    });
}

/* @ngInject */
function registerController(Restangular, store, AlertService, $state, $rootScope) {
    const vm = this;
    const User = Restangular.all('user');
    const auth = Restangular.all('auth');
    vm.register = register;


    function register(user) {
        User.post(user).then(() => {
            AlertService.success('注册成功！').then(function () {
                login(user);
            });
        }).catch((err) => {
            AlertService.warning(err.data);
        });
    }

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
}
