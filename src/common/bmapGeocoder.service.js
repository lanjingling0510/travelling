
angular.module('travelling.common.services')
    .factory('BMapGeocoder', BMapGeocoderService);

/* @ngInject*/
function BMapGeocoderService($q) {
    const geocoder = new BMap.Geocoder();
    const service = {
        getLocationName: getLocationName,
        getLocationPos: getLocationPos,
        getAddressComponents: getAddressComponents,
    };

    return service;

    function getLocationName(point) {
        const deferred = $q.defer();
        // 根据坐标得到地址描述
        geocoder.getLocation(new BMap.Point(point.x, point.y), function (result) {
            if (result) {
                deferred.resolve(result.address);
            } else {
                deferred.reject('亲，位置加载失败~');
            }
        });
        return deferred.promise;
    }

    function getLocationPos(name) {
        const deferred = $q.defer();
        geocoder.getPoint(name, function (point) {
            deferred.resolve(point);
        });
        return deferred.promise;
    }

    function getAddressComponents(point) {
        const deferred = $q.defer();
        // 根据坐标得到地址描述
        geocoder.getLocation(point, function (result) {
            if (result) {
                deferred.resolve(result.addressComponents);
            } else {
                deferred.reject("亲，位置加载失败~");
            }
        });
        return deferred.promise;
    }
}
