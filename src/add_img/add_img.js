require('./add_img.css');

module.exports = angular.module('travelling.add.img', [
    'ngFileUpload',
])
    .config(ModuleConfig)
    .controller('AddImgController', AddImgController);

/* @ngInject */
function ModuleConfig($stateProvider) {
    $stateProvider.state('tab.add-img', {
        url: '/add/img',
        views: {
            'tab-add': {
                template: require('./add_img.html'),
                controller: 'AddImgController as vm',
            },
        },

    });
}

/* @ngInject*/
function AddImgController($rootScope, $state, AlertService, store, UploadFile, AddImageByApp, Restangular, $ionicHistory, $ionicLoading) {
    const vm = this;
    vm.addImageByApp = addImageByApp;
    vm.addImageByWeb = addImageByWeb;
    vm.removeImage = removeImage;
    vm.submitShare = submitShare;
    vm.clearShare = clearShare;
    vm.images = [];
    const Share = Restangular.all('share');

    initController();

    function addImageByApp() {
        AddImageByApp();// eslint-disable-line new-cap
    }


    function addImageByWeb(file) {
        if (!file) {
            AlertService.warning('上传有点问题哦~');
            return;
        }

        $ionicLoading.show({
            template: '<ion-spinner icon="ripple"></ion-spinner><span class="wenzi">上传中...</span>',
            hideOnStageChange: true,
        });

        UploadFile({ // eslint-disable-line new-cap
            file: file,
        }).then(result => {
            vm.images.push(result.data);
        }).catch((err) => {
            AlertService.warning(err.data);
        }).finally(() => {
            $ionicLoading.hide();
        });
    }


    function removeImage(index) {
        vm.images.splice(index, 1);
    }


    function submitShare() {
        if (vm.images.length === 0) {
            AlertService.warning('请上传照片');
            return;
        }

        const share = {
            city: store.get('share.city'),
            labels: store.get('share.labels'),
            text: store.get('share.text'),
            coordinates: store.get('share.coordinates'),
            place: store.get('share.place'),
        };

        Share.post(Object.assign(share, {
            images: vm.images,
            userId: $rootScope.auth.profile._id,
        })).then(() => {
            AlertService.success('分享成功！').then(() => {
                clearShare();
            });
        }).catch(err => {
            AlertService.warning(err.data);
        });
    }


    function clearShare() {
        vm.images = [];
        $state.go('tab.add-label');
    }


    function initController() {
        if (!$ionicHistory.viewHistory().backView) {
            $state.go('tab.add-label');
        }
    }
}
