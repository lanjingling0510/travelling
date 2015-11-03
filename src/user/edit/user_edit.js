module.exports = angular.module('travelling.user.edit', [])
    .config(moduleConfig)
    .controller('UserEditController', UserEditController);


/* @ngInject */
function moduleConfig($stateProvider) {
    $stateProvider.state('user-edit', {
        url: '/user/edit',
        views: {
            'main': {
                template: require('./user_edit.html'),
                controller: 'UserEditController as vm',
                resolve: {
                    profile: ['Authorization', function (Authorization) {
                        return Authorization();
                    }],
                },
            },
        },
    });
}

function UserEditController(Restangular, profile, AlertService, UploadAvatar, $ionicModal, $scope, $state, $ionicLoading, Upload) {
    const vm = this;
    const _id = profile._id;
    const User = Restangular.one('user', _id);
    vm.editAvatar = editAvatar;
    vm.editNickname = editNickname;
    vm.editPassword = editPassword;

    initController();


    function editAvatar(file) {
        console.log('change');


        if (!file) return false;

        $ionicLoading.show({
            template: '<ion-spinner icon="ripple"></ion-spinner><span class="wenzi">上传中...</span>',
            hideOnStageChange: true,
        });

        UploadAvatar({ // eslint-disable-line new-cap
            file: file,
            oldAvatar: vm.user.avatar,
        }).then(result => {
            vm.user.avatar = result.data;
            User.doPUT({avatar: vm.user.avatar});
        }).catch((err) => {
            AlertService.warning(err.data);
        }).finally(() => {
            $ionicLoading.hide();
        });
    }


    function editNickname(nickname) {
        User.doPUT({nickname: nickname}).then(() => {
            vm.nicknameModal.hide();
            vm.passwordModal.hide();
        }).catch(err => {
            AlertService.warning(err.data);
        });
    }

    function editPassword(password) {
        User.doPUT({password: password}).then(() => {
            $state.go('login');
        }).catch(err => {
            AlertService.warning(err.data);
        });
    }

    function initController() {
        User.get().then(user => {
            vm.user = user;
            vm.user.username = profile.username;
        });

        $ionicModal.fromTemplateUrl('user_edit_nickname_modal.html', {
            scope: $scope,
            animation: 'slide-in-up',
        }).then(function (modal) {
            vm.nicknameModal = modal;
        });

        $ionicModal.fromTemplateUrl('user_edit_password_modal.html', {
            scope: $scope,
            animation: 'slide-in-up',
        }).then(function (modal) {
            vm.passwordModal = modal;
        });
    }
}
