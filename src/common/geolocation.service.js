angular.module('travelling.common.services')
.factory('$cordovaGeolocation', ['$q', function ($q) {
    return {
        getCurrentPosition: function (options) {
            var defered = $q.defer();

            // if (process.env.NODE_ENV === 'development') {
            //     return $q.resolve();
            // }
            navigator.geolocation.getCurrentPosition(function (result) {
                var GPSpoint = new BMap.Point(result.coords.longitude, result.coords.latitude);
                BMap.Convertor.translate(GPSpoint, 0, function(point) {
                    console.log(point);
                    defered.resolve(point);
                });

            }, function(err) {
                defered.reject(err);
            }, options);

            return defered.promise;
        },

        watchPosition: function(options) {
            var q = $q.defer();

            var watchID = navigator.geolocation.watchPosition(function(result) {
                var GPSpoint = new BMap.Point(result.coords.longitude, result.coords.latitude);
                BMap.Convertor.translate(GPSpoint, 0, function(data) {
                    q.notify(data);
                });
            }, function(err) {
                q.reject(err);
            }, options);

            q.promise.cancel = function() {
                navigator.geolocation.clearWatch(watchID);
            };

            q.promise.clearWatch = function(id) {
                navigator.geolocation.clearWatch(id || watchID);
            };

            q.promise.watchID = watchID;

            return q.promise;
        },

        clearWatch: function(watchID) {
            return navigator.geolocation.clearWatch(watchID);
        }
    };
}]);
