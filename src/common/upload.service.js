angular.module('travelling.common.services')
    .factory('AddImageByApp', AddImageByApp)
    .factory('UploadFile', UploadFile)
    .factory('UploadAvatar', UploadAvatar);


/* @ngInject*/
function AddImageByApp($ionicActionSheet, $cordovaCamera, $cordovaImagePicker, $ionicPopup, UploadFile) {
    return function (vm) {
        $ionicActionSheet.show({
            buttons: [
                {text: '相机'},
                {text: '图库'},
            ],
            cancelText: '关闭',
            cancel: function () {
                return true;
            },
            buttonClicked: function (index) {
                switch (index) {
                    case 0:
                        updateByCamera(vm);
                        break;
                    case 1:
                        updateByPick(vm);
                        break;
                    default:
                        break;
                }
                return true;
            },
        });
    };


    function updateByCamera(vm) {
        const options = {
            quality: 80,
            destinationType: Camera.DestinationType.FILE_URL,
            sourceType: Camera.PictureSourceType.CAMERA,
            //  sourceType:Camera.PictureSourceType.SAVEDPHOTOALBUM,
            allowEdit: true,
            encodingType: Camera.EncodingType.JPEG,
            targetWidth: document.documentElement.clientWidth,
            targetHeight: document.documentElement.clientHeight,
            popoverOptions: CameraPopoverOptions,
            saveToPhotoAlbum: true,
        };

        $cordovaCamera.getPicture(options)
            .then(function (imgData) {
                return UploadFile({ // eslint-disable-line new-cap
                    files: imgData,
                });
            }).then(fileUrls => {
                vm.images.push(...fileUrls);
            }).catch((err) => {
                $ionicPopup.alert({
                    title: '<h2><i class="icon ion-alert-circled assertive"></i> 提示</h2>',
                    template: err.data,
                    okText: '确定',
                });
            });
    }

    function updateByPick(vm) {
        const options = {
            maximumImagesCount: 30,
            width: 500,
            height: 500,
            quality: 80,
        };

        $cordovaImagePicker.getPictures(options)
            .then(function (imgData) {
                return UploadFile({ // eslint-disable-line new-cap
                    files: imgData,
                });
            })
            .then(function (results) {
                vm.files.push(...results);
            }).then(fileUrls => {
                vm.images.push(...fileUrls);
            })
            .catch((err) => {
                $ionicPopup.alert({
                    title: '<h2><i class="icon ion-alert-circled assertive"></i> 提示</h2>',
                    template: err.data,
                    okText: '确定',
                });
            });
    }
}

/* @ngInject*/
function UploadFile($rootScope, Upload, Restangular, $q) {
    return function ({ file, url = '/apis/upload/temp', method = 'POST'}) {
        if (isQQBrowser()) {
            const defered = $q.defer();
            const Upload = Restangular.all('upload');
            const fileReader = new FileReader();
            fileReader.onload = function (e) {
                Upload.doPOST({dataUrl: e.target.result}, 'fromBase64/temp').then(result => {
                    defered.resolve({data: result});
                }, (err) => defered.reject(err));
            };

            fileReader.readAsDataURL(file);
            return defered.promise;
        } else {
            const upload = Upload.upload({
                url: url,
                data: {
                    file: file,
                },
                method: method,
                headers: {'Authorization': 'Bearer ' + $rootScope.auth.accessToken},
                sendFieldsAs: 'json',
            });
            return upload;
        }
    };
}

/* @ngInject*/
function UploadAvatar($rootScope, Upload, Restangular, $q) {
    return function ({ file, oldAvatar, url = '/apis/upload', method = 'POST'}) {
        if (isQQBrowser()) {
            const defered = $q.defer();
            const Upload = Restangular.all('upload');
            const fileReader = new FileReader();
            fileReader.onload = function (e) {
                Upload.doPOST({
                    dataUrl: e.target.result,
                    oldAvatar: oldAvatar,
                }, 'fromBase64')
                    .then(result => {
                        defered.resolve({data: result});
                    }, (err) => defered.reject(err));
            };

            fileReader.readAsDataURL(file);
            return defered.promise;
        } else {
            const upload = Upload.upload({
                url: url,
                data: {
                    file: file,
                    oldAvatar: oldAvatar,
                },
                method: method,
                headers: {'Authorization': 'Bearer ' + $rootScope.auth.accessToken},
                sendFieldsAs: 'json',
            });
            return upload;
        }
    };
}

function isQQBrowser() {
    const ua = navigator.userAgent.toLowerCase();
    return (/micromessenger|mqqbrowser/.test(ua)) ? true : false;
}


