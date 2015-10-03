angular.module('travelling.common.services')
    .factory('AlertService', AlertService);

/* @ngInject*/
function AlertService($ionicPopup) {
    return {
        warning: warning,
        success: success,
    };

    function warning(msg) {
        $ionicPopup.alert({
            title: '<h2><i class="icon ion-alert-circled assertive"></i> 提示</h2>',
            template: msg,
            okText: '确定',
        });
    }

    function success(msg) {
        $ionicPopup.alert({
            title: '<h2><i class="icon ion-checkmark-round success"></i> 提示</h2>',
            template: msg,
            okText: '确定',
        });
    }
}
