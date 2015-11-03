require('./reply_create.directive.js');

module.exports = angular.module('travelling.reply.create', [
    'travelling.reply.create.directive',
])
    .config(moduleConfig)
    .controller('replyCreateController', replyCreateController);


/* @ngInject */
function moduleConfig($stateProvider) {
    $stateProvider.state('reply-create', {
        url: '/share/:_id/reply/add',
        views: {
            'main': {
                template: require('./reply_create.html'),
                controller: 'replyCreateController as vm',
            },
        },
    });
}

/* @ngInject */
function replyCreateController(Restangular, $stateParams, AlertService, $rootScope) {
    const vm = this;
    const Reply = Restangular.one('share', $stateParams._id);
    vm.reply = {
        score: 0,
        userId: $rootScope.auth.profile._id,
    };
    vm.createReply = createReply;


    function createReply(reply) {
        if (/^.{6,}$/.test(reply.text)) {
            Reply.post('reply', reply)
                .then(() => {
                    AlertService.success('评价成功！');
                }).catch(e => {
                    AlertService.warning(e.data);
                });
        } else {
            AlertService.warning('不少于6个字，不含特殊符号');
        }
    }
}
