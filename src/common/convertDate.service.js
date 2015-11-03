angular.module('travelling.common.services')
    .factory('ConvertDateService', ConvertDateService);

/* @ngInject*/
function ConvertDateService() {
    return function (timeStamp) {
        const startTime = new Date(timeStamp);
        const startTimeMills = startTime.getTime();
        const endTimeMills = new Date().getTime();
        let diff = parseInt((endTimeMills - startTimeMills) / 1000, 10);//  秒
        const day_diff = Math.ceil(diff / 86400);//  天
        const buffer = Array();
        if (day_diff < 0) {
            return '[error],时间越界...';
        } else {
            if (day_diff === 0 && diff < 60) {
                if (diff <= 0) {
                    diff = 1;
                }
                buffer.push(diff + '秒前');
            } else if (day_diff === 0 && diff < 120) {
                buffer.push('1 分钟前');
            } else if (day_diff === 0 && diff < 3600) {
                buffer.push(Math.round(Math.floor(diff / 60)) + '分钟前');
            } else if (day_diff === 0 && diff < 7200) {
                buffer.push('1小时前');
            } else if (day_diff === 0 && diff < 86400) {
                buffer.push(Math.round(Math.floor(diff / 3600)) + '小时前');
            } else if (day_diff === 1) {
                buffer.push('1天前');
            } else if (day_diff < 7) {
                buffer.push(day_diff + '天前');
            } else if (day_diff < 30) {
                buffer.push(Math.round(Math.ceil(day_diff / 7)) + ' 星期前');
            } else if (day_diff >= 30 && day_diff <= 179) {
                buffer.push(Math.round(Math.ceil(day_diff / 30)) + '月前');
            } else if (day_diff >= 180 && day_diff < 365) {
                buffer.push('半年前');
            } else if (day_diff >= 365) {
                buffer.push(Math.round(Math.ceil(day_diff / 30 / 12)) + '年前');
            }
        }
        return buffer.toString();
    };
}
