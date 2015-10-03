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
function AddImgController($scope, $state, $ionicPopup, store, UploadFile, AddImageByApp) {
    const vm = this;
    vm.addImageByApp = addImageByApp;
    vm.addImageByWeb = addImageByWeb;
    vm.images = [];

    $scope.$on('$ionicView.enter', function () {
        vm.city = store.get('share.imgs');
    });

    function addImageByApp() {
        AddImageByApp();// eslint-disable-line new-cap
    }

    function addImageByWeb(files) {
        if (!files || files.length === 0) return false;


        //UploadFile({ // eslint-disable-line new-cap
        //    files: files,
        //}).then(fileUrls => {
        //    vm.images.push(...fileUrls);
        //}).catch((err) => {
        //    $ionicPopup.alert({
        //        title: '<h2><i class="icon ion-alert-circled assertive"></i> 提示</h2>',
        //        template: err.data,
        //        okText: '确定',
        //    });
        //});
    }
}
