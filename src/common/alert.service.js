angular.module('travelling.common.services')
    .factory('AlertService', AlertService);

/* @ngInject*/
function AlertService($ionicPopup) {
    return {
        warning: warning,
        success: success,
    };

    function warning(msg) {
        return $ionicPopup.alert({
            title: '<h2><i class="icon ion-alert-circled assertive"></i> 提示</h2>',
            template: '<div class="text-center">' + msg + '</div>',
            okText: '确定',
        });
    }

    function success(msg) {
        return $ionicPopup.alert({
            title: '<h2><i class="icon ion-checkmark-round balanced"></i> 提示</h2>',
            template: '<div class="text-center">' + msg + '</div>',
            okText: '确定',
        });
    }
}
