const debug = require('../app/util/debug.js');

module.exports = angular.module('travelling.common.services')
    .config(['$httpProvider', moduleConfig])
    .factory('BearerInterceptor', BearerInterceptor)
    .factory('Authorization', Authorization);


/* @ngInject */
function moduleConfig($httpProvider) {
    $httpProvider.interceptors.push('BearerInterceptor');
}

/* @ngInject */
function BearerInterceptor($rootScope, $q, $injector) {
    return {
        request: function (conf) {
            debug.ajax(conf.url);
            conf.headers = conf.headers || {};
            if (!!$rootScope.auth && !!$rootScope.auth.accessToken) {
                conf.headers.Authorization = 'Bearer ' + $rootScope.auth.accessToken;
            }
            return conf;
        },
        responseError: function (rejection) {
            const $state = $injector.get('$state');

            if (rejection.status === 401) {
                if ($state.is('login')) {
                    return $q.reject({
                        data: '账号或密码错误。',
                    });
                }
                return $state.go('login');
            }
            if (rejection.status === 404) {
                return $q.reject({
                    data: '未找到此项目',
                });
            }
            if (rejection.status === 502) {
                return $q.reject({
                    data: '服务器离线',
                });
            }
            return $q.reject(rejection);
        },
    };
}

/* @ngInject */
function Authorization($q, $rootScope) {
    return function () {
        const dfd = $q.defer();
        if ($rootScope.auth) {
            dfd.resolve($rootScope.auth.profile);
        } else {
            dfd.reject('未登录');
        }

        return dfd.promise;
    };
}
