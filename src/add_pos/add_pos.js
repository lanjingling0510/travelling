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
function AddPosController($scope, $ionicLoading, store, $cordovaGeolocation, BMapGeocoder, $q, AlertService, $state, $ionicHistory) {
    const vm = this;
    let map;
    let marker;
    let infoWindow;
    vm.searchText = '北京天安门';
    vm.currentPos = currentPos;
    vm.searchPos = searchPos;
    vm.nextPage = nextPage;

    initController();
    initMap();

    $scope.$on('$ionicView.enter', function () {
        vm.city = store.get('share.city');
        vm.place = store.get('share.place');
        vm.coordinates = store.get('share.coordinates') || [];
    });

    marker.addEventListener('click', markerClick);
    map.addEventListener('click', mapClick);


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
            template: '<ion-spinner icon="ripple"></ion-spinner><span class="wenzi">加载地图...</span>',
            hideOnStageChange: true,
        });

        $cordovaGeolocation.getCurrentPosition({enableHighAccuracy: false})
            .then(changePosByPoint) // 根据坐标搜索位置信息
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
                    AlertService.warning(msg.data);
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
                console.log(vm.coordinates[0], vm.coordinates[1]);
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
            AlertService.warning('请输入地点名称~');
        }
    }


    function initController() {
        if (!$ionicHistory.viewHistory().backView) {
            $state.go('tab.add-label');
        }
    }
}
