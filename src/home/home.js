require('./home.css');
require('./home.directive.js');

module.exports = angular.module('travelling.home', [
    'travelling.home.directive',
])
    .config(moduleConfig)
    .controller('HomeController', HomeController);

/* @ngInject */
function moduleConfig($stateProvider) {
    $stateProvider.state('tab.home', {
        url: '/home',
        views: {
            'tab-home': {
                template: require('./home.html'),
                controller: 'HomeController as vm',
            },
        },
    });
}

/* @ngInject */
function HomeController($cordovaGeolocation, AlertService, Restangular, $timeout, $ionicSlideBoxDelegate, $animate, BMapOverlay) {
    const vm = this;
    let map;
    let timer;
    let arrowMarker;
    let arrIcon;
    let markerList = [];
    const Shares = Restangular.all('share');
    const Labels = Restangular.all('label');

    vm.getShareList = getShareList;
    vm.slideChange = clickMarker;
    vm.getLocation = getLocation;

    vm.query = {
        page: 0,
        limit: 10,
        label: null,
        orderBy: 'score',
        order: -1,
    };

    vm.config = {
        watchPosition: false,
        nowIcon: null,
        sw: null,
        ne: null,
        activeMarker: null,
    };

    initLabels();
    initMap();


    // 初始化标签
    function initLabels() {
        Labels.getList().then(list => {
            vm.labelsList = [{name: '全部', _id: null}, ...list];
            vm.labelsList.forEach((value, index) => {
                value.icon = new BMap.Icon(`./images/nav_${index}.png`, new BMap.Size(20, 26), {
                    anchor: new BMap.Size(10, 26),
                    imageSize: new BMap.Size(20, 26),
                });
            });

            vm.config.nowIcon = vm.labelsList[0].icon;
        });
    }


    //  初始化地图
    function initMap() {
        // 创建Map实例
        map = new BMap.Map('home-map');

        // 添加控件和比例尺
        const top_right_navigation = new BMap.NavigationControl({
            anchor: BMAP_ANCHOR_TOP_RIGHT,
            type: BMAP_NAVIGATION_CONTROL_SMALL,
        });

        map.addControl(top_right_navigation);

        arrIcon = new BMap.Icon('./images/arraw.png', new BMap.Size(25, 27), {
            anchor: new BMap.Size(12, 0),
            imageSize: new BMap.Size(25, 27),
        });


        //  绑定事件
        map.addEventListener('dragend', dragend, false);
        map.addEventListener('zoomend', zoomend, false);


        //  获得位置坐标，添加导航图标
        $cordovaGeolocation.getCurrentPosition({enableHighAccuracy: false})
            .then(point => {
                map.addOverlay(arrowMarker = new BMap.Marker(point, {icon: arrIcon}));
                vm.query.center = [point.lng, point.lat].join(',');
                map.centerAndZoom(point, 18);
                getShareListAndShowToolTop();
            });
    }


    //  ================================
    //  事件
    //  ================================

    //  地图缩放触发事件
    function zoomend() {
        getShareListAndShowToolTop();
    }


    //  地图拖动触发事件
    function dragend() {
        if (!vm.config.watchPosition) {
            getShareListAndShowToolTop();
        }
    }


    //  定位
    function getLocation() {
        $cordovaGeolocation.getCurrentPosition({enableHighAccuracy: false})
            .then(point => {
                map.panTo(point);
                vm.query.center = [point.lng, point.lat].join(',');
                arrowMarker.setPosition(point);
                getShareList().then(list => {
                    list.forEach(value => {
                        const point = new BMap.Point(value.coordinates[0], value.coordinates[1]);
                        addMarker(point, value).then((marker) => {
                            marker.div.addClass('ani-marker-big');
                            vm.config.activeMarker = marker;
                        });
                    });
                });
            });
    }


    //  获得分享列表然后继续添加marker，toolTop
    function getShareListAndShowToolTop() {
        getShareList().then(list => {
            list.forEach(value => {
                const point = new BMap.Point(value.coordinates[0], value.coordinates[1]);
                addMarker(point, value).then((marker) => {
                    map.panTo(marker.activePoint);
                    marker.toolTop.show();
                    marker.div.addClass('ani-marker-big');
                    vm.config.activeMarker = marker;
                });
            });
        });
    }


    //  获得分享列表
    function getShareList({orderBy = vm.query.orderBy, icon = vm.config.nowIcon} = {}) {
        vm.config.nowIcon = icon;

        //  清除marker浮标 & 清除提示框
        markerList.forEach(value => {
            map.removeOverlay(value.toolTop);
            map.removeOverlay(value);
        });

        markerList = [];

        const bounds = map.getBounds();
        const sw = vm.config.sw = bounds.getSouthWest();
        const ne = vm.config.ne = bounds.getNorthEast();
        vm.query.sw = sw.lng + ',' + sw.lat;
        vm.query.ne = ne.lng + ',' + ne.lat;

        return new Promise(resolve => {
            $timeout.cancel(timer);
            timer = $timeout(() => {
                if (orderBy === 'near') {
                    Shares.one('near').get(vm.query).then(result => {
                        vm.shareList = result;
                        console.log('shares count: %s', result.length);
                        $ionicSlideBoxDelegate.update();
                        $ionicSlideBoxDelegate.slide(0);
                        resolve(result);
                    });
                } else {
                    Shares.getList(vm.query).then(result => {
                        vm.shareList = result;
                        console.log('shares count: %s', result.length);
                        $ionicSlideBoxDelegate.update();
                        $ionicSlideBoxDelegate.slide(0);
                        resolve(result);
                    });
                }
            }, 200);
        });
    }


    //  添加marker浮标
    function addMarker(point, share) {
        const icon = vm.config.nowIcon;
        const marker = new BMap.Marker(point, {icon: icon});
        let activePoint;
        let markerDiv;

        //  为marker绑定share信息和toolTop
        addToolTop(marker, share);

        map.addOverlay(marker);
        marker.div = markerDiv = angular.element(marker.oc);
        activePoint = new BMap.Point(point.lng, (vm.config.ne.lat - vm.config.sw.lat) / 3 + point.lat);
        marker.activePoint = activePoint;

        //  点击marker浮标添加动画类
        marker.addEventListener('click', function () {
            const index = markerList.findIndex(value => value === marker);
            clickMarker(index);
        }, false);

        //  return promise
        return new Promise((resolve) => {
            //  为marker添加动画类
            $animate.addClass(markerDiv, 'ani-marker')
                .then(() => {
                    markerDiv.removeClass('ani-marker');
                    markerList.push(marker);
                    if (markerList.length === 1) {
                        resolve(marker);
                    }
                });
        });
    }


    //  添加提示框
    function addToolTop(marker, share) {
        const toolTop = new BMapOverlay({
            point: marker.getPosition(),
            width: 300,
            height: 94,
            data: share,
        });
        marker.toolTop = toolTop;
        map.addOverlay(toolTop);
        toolTop.hide();
    }


    //  滑动栏改变事件
    function clickMarker(index) {
        if (!markerList.length) return;
        const marker = markerList[index];
        const activeMarker = vm.config.activeMarker;

        //  移动map，显示当前的提示框
        map.panTo(marker.activePoint);

        if (marker !== activeMarker) {
            //  如如果点击的不是当前激活的marker， 隐藏之前的share提示框
            activeMarker.toolTop.hide();
        }

        marker.toolTop.toggle();

        //  marker放大动画
        const obj = marker.oc;
        activeMarker.oc.classList.remove('ani-marker-big');
        obj.classList.add('ani-marker-big');

        vm.config.activeMarker = marker;
    }
}

