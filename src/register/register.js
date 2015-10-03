module.exports = angular.module('travelling.register', [])
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
function registerController(Restangular, AlertService) {
    const vm = this;
    const User = Restangular.all('user');
    vm.register = register;

    function register(user) {
        User.post(user).then(() => {
            AlertService.success('注册成功！');
        }).catch((err) => {
            AlertService.warning(err.data);
        });
    }
}
