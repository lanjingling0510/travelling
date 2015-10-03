module.exports = angular.module('travelling.add.pos', [])
    .config(ModuleConfig)
    .controller('AddPosController', AddPosController);

/* @ngInject */
function ModuleConfig($stateProvider) {
    $stateProvider.state('tab.add-pos', {
        url: '/add/pos',
        views: {
            'tab-add': {
                template: require('./add_pos.html'),
                controller: 'AddPosController as vm',
            },
        },

    });
}

/* @ngInject */
function AddPosController($scope, $ionicLoading, store, $cordovaGeolocation, BMapGeocoder, $q, $ionicPopup, $state) {
    const vm = this;
    let map, marker, infoWindow;// eslint-disable-line one-var
    vm.searchText = '北京天安门';
    vm.currentPos = currentPos;
    vm.searchPos = searchPos;
    vm.nextPage = nextPage;

    initMap();

    $scope.$on('$ionicView.enter', function () {
        vm.city = store.get('share.city');
        vm.place = store.get('share.place');
        vm.coordinates = store.get('share.coordinates') || [];
    });

    marker.addEventListener('click', markerClick);
    map.addEventListener('touchend', mapClick);

    //  ===========================
    //  地图部分
    //  ===========================

    function initMap() {
        map = new BMap.Map('add-pos-map');

        //  功能一：添加控件和比例尺
        const top_right_navigation = new BMap.NavigationControl({// eslint-disable-line camelcase
            anchor: BMAP_ANCHOR_TOP_RIGHT,
            type: BMAP_NAVIGATION_CONTROL_SMALL,
        }); //  右上角，仅包含平移和缩放按钮

        map.addControl(top_right_navigation);
        marker = new BMap.Marker();  // 创建标注
        marker.setIcon(new BMap.Icon('./images/nav_0.png', new BMap.Size(20, 26), {
            anchor: new BMap.Size(10, 13),
            imageSize: new BMap.Size(20, 26),
        }));
        //  marker.enableDragging();
        vm.currentPos();
    }

    //  获得当前位置信息
    function currentPos() {
        $ionicLoading.show({
            template: '加载地图...',
        });

        $cordovaGeolocation.getCurrentPosition({enableHighAccuracy: false})
            .then(changePosByPoint)
            .then((point) => {
                map.centerAndZoom(point, 18);  // 初始化地图,设置中心点坐标和地图级别
                $ionicLoading.hide();
            });
    }

    //  搜索位置信息
    function searchPos(text) {
        if (text.trim()) {
            BMapGeocoder.getLocationPos(text)
                .then(changePosByPoint)
                .catch(msg => {
                    $ionicPopup.alert({
                        title: '<h2><i class="icon ion-alert-circled assertive"></i> 提示</h2>',
                        template: msg.data,
                        okText: '确定',
                    });
                });
        }
    }


    //  根据坐标搜索位置信息
    function changePosByPoint(point) {
        const defered = $q.defer();

        if (!point) {
            defered.reject({
                data: '搜索不到位置',
            });
        } else {
            marker.setPosition(point);
            map.clearOverlays();
            map.addOverlay(marker);
            BMapGeocoder.getAddressComponents(point).then(addComp => {
                vm.place = addComp.city + addComp.district + addComp.street + addComp.streetNumber;
                infoWindow = new BMap.InfoWindow(vm.place);
                marker.openInfoWindow(infoWindow);
                vm.coordinates = [point.lng, point.lat];
                console.log(vm.coordinates);
                vm.city = addComp.city;
                defered.resolve(point);
            });
        }

        return defered.promise;
    }


    //  点击marker打开窗口
    function markerClick() {
        vm.place && marker.openInfoWindow(infoWindow);
    }


    //  点击地图移动marker
    function mapClick(e) {
        const point = e.point;
        changePosByPoint(point);
    }

    function nextPage() {
        if (vm.place) {
            store.set('share.city', vm.city);
            store.set('share.place', vm.place);
            store.set('share.coordinates', vm.coordinates);
            $state.go('tab.add-img');
        } else {
            $ionicPopup.alert({
                title: '<h2><i class="icon ion-alert-circled assertive"></i> 提示</h2>',
                template: '请输入地点名称~',
                okText: '确定',
            });
        }
    }
}
