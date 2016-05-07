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
function HomeController($scope, $ionicHistory, $cordovaGeolocation, $state, Restangular, $timeout, $ionicSlideBoxDelegate, BMapToolTop, BMapMarker, GoeLoadService) {
    const vm = this;
    let map;
    let timer;
    let arrowMarker;
    let arrIcon;
    let markerList = [];
    const Shares = Restangular.all('share');
    const Labels = Restangular.all('label');

    vm.getShareListAndShowToolTop = getShareListAndShowToolTop;
    vm.slideChange = clickMarker;
    vm.getLocation = getLocation;
    vm.shareList = [];
    vm.orderByList = [
        { _id: 'score', name: '推荐' },
        { _id: 'near', name: '距离' },
        { _id: 'date', name: '最新' },
    ];

    vm.query = {
        page: 0,
        limit: 10,
        label: null,
        orderBy: vm.orderByList[0],
        order: -1,
    };

    vm.config = {
        watchPosition: false,
        sw: null,
        ne: null,
        activeMarker: null,
    };

    initLabels();
    initMap();


    $scope.$on('$ionicView.enter', function () {
        if ($ionicHistory.viewHistory().backView) {
            getShareListAndShowToolTop();
        }
    });


    // 初始化标签
    function initLabels() {
        Labels.getList().then(list => {
            vm.labelsList = [{name: '全部', _id: null}, ...list];
            vm.query.label = vm.labelsList[0];
            vm.labelsList.forEach((value, index) => {
                value.iconUrl = require(`../app/images/nav_${index}.png`);
            });
        });
    }


    //  初始化地图
    function initMap() {
        // 创建Map实例
        map = new BMap.Map('home-map', {enableMapClick: false});

        // 添加控件和比例尺
        const top_right_navigation = new BMap.NavigationControl({
            anchor: BMAP_ANCHOR_TOP_RIGHT,
            type: BMAP_NAVIGATION_CONTROL_SMALL,
        });

        map.addControl(top_right_navigation);

        arrIcon = new BMap.Icon(require('../app/images/arraw.png'), new BMap.Size(25, 27), {
            anchor: new BMap.Size(12, 0),
            imageSize: new BMap.Size(25, 27),
        });


        //  绑定事件
        map.addEventListener('dragend', dragend, false);
        map.addEventListener('zoomend', zoomend, false);

        //  获得位置坐标，添加导航图标
        GoeLoadService.retain();
        $cordovaGeolocation.getCurrentPosition({enableHighAccuracy: false})
            .then(point => {
                GoeLoadService.release();
                map.addOverlay(arrowMarker = new BMap.Marker(point, {icon: arrIcon}));
                vm.query.center = [point.lng, point.lat].join(',');
                map.centerAndZoom(point, 18);
                getShareListAndShowToolTop(vm.query);
            });
    }


    //  ================================
    //  事件
    //  ================================

    //  地图缩放触发事件
    function zoomend() {
        getShareListAndShowToolTop(vm.query);
    }


    //  地图拖动触发事件
    function dragend() {
        if (!vm.config.watchPosition) {
            getShareListAndShowToolTop(vm.query);
        }
    }


    //  定位
    function getLocation() {
        GoeLoadService.retain();
        $cordovaGeolocation.getCurrentPosition({enableHighAccuracy: false})
            .then(point => {
                GoeLoadService.release();
                map.panTo(point);
                vm.query.center = [point.lng, point.lat].join(',');
                arrowMarker.setPosition(point);
                getShareList(vm.query).then(list => {
                    list.forEach((value, index) => {
                        const pt = new BMap.Point(value.coordinates[0], value.coordinates[1]);
                        addMarker(pt, value, index, vm.query.label.iconUrl).then((marker) => { // marker为第一个标签
                            marker._div.classList.add('ani-marker-big');
                            vm.config.activeMarker = marker;
                        }).catch(() => {});
                    });
                });
            });
    }


    //  获得分享列表然后继续添加marker，toolTop
    function getShareListAndShowToolTop(query) {
        getShareList(query).then(list => {
            list.forEach((value, index) => {
                const point = new BMap.Point(value.coordinates[0], value.coordinates[1]);
                addMarker(point, value, index, query.label.iconUrl).then((marker) => { // marker为第一个标签
                    map.panTo(marker.activePoint);
                    marker.toolTop.show();
                    marker._div.classList.add('ani-marker-big');
                    vm.config.activeMarker = marker;
                }).catch(() => {});
            });
        });
    }


    //  获得分享列表
    function getShareList({orderBy, label}) {
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
                const query = {
                    ...vm.query,
                    label: label._id,
                    orderBy: orderBy._id,
                };
                if (orderBy._id === 'near') {
                    Shares.one('near').get(query).then(result => {
                        vm.shareList = result;
                        console.log('shares count: %s', result.length);
                        $ionicSlideBoxDelegate.update();
                        $ionicSlideBoxDelegate.slide(0);
                        resolve(result);
                    });
                } else {
                    Shares.getList(query).then(result => {
                        vm.shareList = result;
                        console.log('shares count: %c' + result.length, 'color: red');
                        $ionicSlideBoxDelegate.update();
                        $ionicSlideBoxDelegate.slide(0);
                        resolve(result);
                    });
                }
            }, 200);
        });
    }


    //  添加marker浮标
    function addMarker(point, share, index, iconUrl) {
        let activePoint;

        const marker = new BMapMarker({
            point: point,
            iconUrl: iconUrl,
        });


        //  为marker绑定share信息和toolTop
        map.addOverlay(marker);
        addToolTop(marker, share);

        //  点击marker浮标添加动画类
        marker.addEventListener('touchstart', function () {
            clickMarker(index);
        }, false);

        activePoint = new BMap.Point(point.lng, (vm.config.ne.lat - vm.config.sw.lat) / 5 + point.lat);
        marker.activePoint = activePoint;
        markerList.push(marker);


        //  return promise
        return marker.enterFinish.then(() => {
            if (index === 0) {
                return marker;
            }
            return Promise.reject('not first marker');
        });
    }


    //  添加提示框
    function addToolTop(marker, share) {
        const toolTop = new BMapToolTop({
            point: marker.getPosition(),
            data: share,
        });
        marker.toolTop = toolTop;
        map.addOverlay(toolTop);
        toolTop.hide();

        toolTop.click(function () {
            $state.go('share-detail', {_id: toolTop._data._id});
        });
    }


    // 滑动栏改变事件
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
        activeMarker._div.classList.remove('ani-marker-big');
        marker._div.classList.add('ani-marker-big');

        vm.config.activeMarker = marker;
    }
}
