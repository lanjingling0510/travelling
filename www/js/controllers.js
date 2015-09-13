angular.module('starter.controllers', [])
/**
 * controller
 *
 */
    .controller('HomeCtrl', function ($scope, Weathers, $cordovaGeolocation, BaiDu, $ionicLoading) {
        console.log('HomeCtrl....')
        $ionicLoading.show({
            template: '获得位置信息...'
        });
        var posOptions = {enableHighAccuracy: false};
        $cordovaGeolocation.getCurrentPosition(posOptions)
            .then(function (position) {
                return BaiDu.getAddressComponents(position);
            })
            .then(function (address) {
                $scope.address = address;
                Weathers(address.city.replace(/[市省县]/g, '')).success(function (data) {
                    $scope.weatherObj = data.retData;
                    $ionicLoading.hide();
                })
            })
    })

/**
 * controller
 *
 */
    .controller('AddPosCtrl', function ($scope, $ionicLoading, $cordovaGeolocation, $cacheFactory, BaiDu,$ionicHistory) {
        $scope.share = {};
        var cache = $cacheFactory('share');
        cache.put('share',$scope.share);
        cache.put('adding', {
            pos: true,
            text: true,
            img: true,
            label:true
        });


        $scope.searchText = "";

        $scope.$on('$stateChangeSuccess', function () {
            var adding = cache.get('adding');
            if (!adding.pos) {
                adding.pos = true;
                console.log('restart...pos');
                cache.put('share', $scope.share);
                $scope.searchText = "";
                $scope.currentPos();
                $ionicHistory.clearHistory();
            }
        });


        var map, point, marker, place, infoWindow;
        map = new BMap.Map("map1");
        //功能一：添加控件和比例尺
        var top_right_navigation = new BMap.NavigationControl({
            anchor: BMAP_ANCHOR_TOP_RIGHT,
            type: BMAP_NAVIGATION_CONTROL_SMALL
        }); //右上角，仅包含平移和缩放按钮

        map.addControl(top_right_navigation);
        marker = new BMap.Marker();  // 创建标注
        marker.enableDragging();

        /*点击获得当前位置事件*/
        $scope.currentPos = function () {
            $ionicLoading.show({
                template: 'Loading...'
            });
            $cordovaGeolocation.getCurrentPosition({enableHighAccuracy: false})
                .then(function (point) {
                    marker.setIcon(new BMap.Icon("img/nav_0.png", new BMap.Size(20, 26), {
                        anchor: new BMap.Size(10, 0)
                    }));
                    marker.setPosition(point);
                    map.clearOverlays();
                    map.addOverlay(marker);
                    map.centerAndZoom(point, 15);  // 初始化地图,设置中心点坐标和地图级别
                    BaiDu.getAddressComponents(point).then(function (addComp) {
                        $scope.share.share_place = place = addComp.city + addComp.district + addComp.street + addComp.streetNumber;
                        infoWindow = new BMap.InfoWindow(place);
                        marker.openInfoWindow(infoWindow);

                        //储存城市信息
                        $scope.share.share_pointX = point.lng;
                        $scope.share.share_pointY = point.lat;
                        $scope.share.share_city = addComp.city;
                        $ionicLoading.hide();
                    });
                })
        };

        /*点击搜索地点事件*/
        $scope.searchPos = function () {
            if ($scope.searchText) {
                BaiDu.getLocationPos($scope.searchText)
                    //获得地址坐标
                    .then(function (point) {
                        if (!point) {
                            alert("这是什么鬼地方？？？");
                            return;
                        }

                        marker.point = point;
                        map.closeInfoWindow();
                        map.clearOverlays();
                        map.addOverlay(marker);
                        return point;
                    }).then(function (point) {
                        //获得详细的地址部件
                        BaiDu.getAddressComponents(point)
                            .then(function (addComp) {
                                //储存城市信息
                                $scope.share.share_pointX = point.lng;
                                $scope.share.share_pointY = point.lat;
                                $scope.share.share_city = addComp.city;
                                $scope.share.share_place = addComp.city + addComp.district + addComp.street + addComp.streetNumber;
                                infoWindow = new BMap.InfoWindow($scope.share.share_place);
                                marker.openInfoWindow(infoWindow);
                            })
                    })
            }
        };


        $scope.currentPos();
        $scope.$watch('share.share_place', function (newValue, oldValue) {
            if (newValue == oldValue) {
                return;
            }
            map.closeInfoWindow();//infowindow还在,只是从map中隐藏了
            infoWindow.content = $scope.share.share_place;
            $scope.share.share_place && marker.openInfoWindow(infoWindow);
        });


        map.addEventListener('touchend', function () {
            if (event.target.className.indexOf('BMap_Marker') != -1) {
                var pos = marker.getPosition();
                $scope.share.share_pointX = pos.lng;
                $scope.share.share_pointY = pos.lat;
            }
        });
        marker.addEventListener('click', function () {
            $scope.share.share_place && marker.openInfoWindow(infoWindow);
        });

    })

/**
 * controller
 *todo AddImgCtrl
 */
    .controller('AddImgCtrl', function ($ionicLoading, $location, AddShare, $cacheFactory, $scope, $ionicModal,addImage, File, $cordovaFileTransfer, $ionicPopup, apiKey, apiSecret,host) {
        var cache = $cacheFactory.get('share');
        $scope.share = cache.get('share');
        $scope.images_list = [];
        $scope.tpl_list = [];


        $scope.$on('$stateChangeSuccess', function () {
            var adding = cache.get('adding');
            if (!adding.img) {
                adding.img = true;
                console.log('restart...img');
                $scope.tpl_list = [];
                $scope.images_list = [];
                $scope.share.share_imgs = "";
            }
        });


        // "添加图片"Event

        $scope.addImage=function(){
            addImage($scope);
        };



        // "上传分享"Event
        $scope.submitShare = function () {
            $ionicLoading.show({
                template: '上传当中...',
                noBackdrop: true
            });


            var blobIndex = 0, blobCount = $scope.tpl_list.length;
            if (blobCount == 0) {
                //如果没有上传照片...
                addShare();
                return;
            }


            //var POLICY_JSON = {
            //    "expiration": "2020-12-01T12:00:00.000Z",
            //    "conditions": [
            //        ["starts-with", "$key", ""],
            //        {"bucket": 'bucket-travelling'},
            //        ["starts-with", "$Content-Type", ""],
            //        ["content-length-range", 0, 524288000]
            //    ]
            //};
            //var policyBase64 = Base64.encode(JSON.stringify(POLICY_JSON));
           // var signature = b64_hmac_sha1(apiSecret, policyBase64);
            //var host = 'http://bucket-travelling.oss-cn-beijing.aliyuncs.com';
            var url = host+'/travelling-server/index.php/Home/Index/ajax_getFile';
            var fileName;
            var options = new FileUploadOptions();
            options.fileKey = "file";
            options.mimeType = "image/jpeg";
            //options.params = {
            //    'OSSAccessKeyId': apiKey,
            //    'policy': policyBase64,
            //    'signature': signature
            //};
            var eles = document.querySelectorAll('#addImg .pic-progress-wrap');
            for (var i = 0; i < blobCount; i++) {
                (function (index) {
                    var progress = angular.element(eles).eq(index).css('display', 'block');
                    var subProgress = progress.find('div');
                    fileName = 'img_' + (+new Date()) + "." + File.getFileExt($scope.tpl_list[index].url);
                    $scope.images_list.push(fileName);
                    options.fileName = fileName;
                    //options.params.key = "image/" + fileName;
                    $cordovaFileTransfer.upload(url, $scope.tpl_list[index].url, options)
                        .then(
                        function (result) {
                            subProgress.css('width', '100%');
                            blobIndex++;
                            if (blobIndex == blobCount) {
                                addShare();
                            }

                        }, function (error) {
                            var errorcode = error.code;
                            var errstr;
                            switch (errorcode) {
                                case 1:
                                {
                                    errstr = "错误代码1：源文件路径异常，请重新选择或者拍照上传！";
                                    break;
                                }
                                case 2:
                                {
                                    errstr = "错误代码2:目标地址无效,请重试！";
                                    break;
                                }
                                case 3:
                                {
                                    errstr = "您手机或者后台服务器网络异常,请重新上传！";
                                    break;
                                }
                                default :
                                {
                                    errstr = "程序出错";
                                    break;
                                }

                            }
                            alert(errstr);
                        }, function (progress) {
                            subProgress.css('width', (progress.loaded / progress.total) * 100 + '%');
                        })
                }(i));
            }


        };



        var addShare = function () {
            $scope.images_list.length != 0 && ($scope.share.share_imgs = $scope.images_list.join(','));
            AddShare($scope.share)
                .success(function (data) {
                    if (data.status == 1) {
                        $ionicLoading.hide();
                        $ionicPopup.alert({
                            title: '^o^',
                            template: '上传成功~',
                            okText: '确定'
                        })
                            .then(function () {
                                cache.remove('share');
                                var adding = cache.get('adding');
                                adding.pos = false;
                                adding.text = false;
                                adding.label=false;
                                adding.img = false;
                                $location.path('/menu/tab/add-pos').replace();

                            })
                    }
                })
                .error(function (error) {
                    alert("error");
                });


        };


    })

/**
 * controller
 *
 */


    .controller('AddLabelCtrl', function ($scope, $cacheFactory, $location) {
        var cache = $cacheFactory.get('share');
        $scope.share = cache.get('share');
        $scope.share_labels = [];
        $scope.labelsList = [
            {image: 'img/label-view.png', name: "风景", on: false},
            {image: 'img/label-play.png', name: "娱乐", on: false},
            {image: 'img/label-cart.png', name: "购物", on: false},
            {image: 'img/label-room.png', name: "酒店", on: false},
            {image: 'img/label-food.png', name: "美食", on: false}
        ];

        $scope.labelsMap = {
            "风景": 1,
            "娱乐": 2,
            "购物": 3,
            "酒店": 4,
            "美食": 5
        };

        $scope.nextPage = function () {
            if ($scope.share_labels.length > 0) {
                var arr = [];
                for (var i = 0, len = $scope.share_labels.length; i < len; i++) {
                    arr.push($scope.labelsMap[$scope.share_labels[i]]);
                }
                $scope.share.labels = arr.join(',');
                $location.path('/menu/tab/add-text');
            }
        }

        $scope.$on('$stateChangeSuccess',function(){
           var adding=cache.get('adding');
            if(!adding.label){
                adding.label=true;
                console.log('restart...label');
                $scope.share_labels=[];
                $scope.labelsList.forEach(function(ele){
                    ele.on=false;
                })
            }
        });


    })

/**
 * controller
 *
 */

    .controller('AddTextCtrl', function ($scope, $cacheFactory) {
        var cache = $cacheFactory.get('share');
        $scope.share = cache.get('share');
        $scope.$on('$stateChangeSuccess', function () {
            var adding = cache.get('adding');
            if (!adding.text) {
                adding.text = true;
                console.log('restart...text');
                $scope.share.share_text = "";
            }
        });
    })

/**
 * controller
 *
 */
    .controller('NavCtrl', function ($ionicSlideBoxDelegate,$timeout, $scope, $ionicLoading, $cordovaGeolocation, $cordovaDeviceOrientation, DOM,SearchShare,$ionicModal,$animate,$state) {
        var map,
            top_right_navigation,
            arrIcon,
            icon_0,icon_1,icon_2,icon_3,icon_4,icon_5,
            mapStyle,
            vectorFCArrow,
            mapObj,
            height,
            markerList=[],
            width,
            watchGeo,
            watchOri;
        $ionicLoading.show({
            template: 'Loading...',
            duration: 2000
        });

        $ionicModal.fromTemplateUrl('modal2.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function(modal) {
            $scope.modal2 = modal;
        });


        $scope.openSetting2 = function() {
            $scope.modal2.show();
        };
        $scope.closeSetting2 = function() {
            $scope.modal2.hide();
        };

        $scope.slideChange=function(index){
            if(!markerList.length) return;
            var obj=angular.element(markerList[index].Mc);
            angular.element(document.querySelector('.ani-scale-big')).removeClass('ani-scale-big');
            obj.addClass('ani-scale-big');
        };

        $scope.panToCenter=function(){
            $cordovaGeolocation.getCurrentPosition()
                .then(function (point) {
                    map.panTo(point);
                    getShare();
                });
        };

        $scope.loadMore=function(){
            $scope.config.nowPage+=1;
            loadMoreShare();

        };

        $scope.moreDataCanBeLoaded=function(){
            return $scope.config.hasMore;
        };


        $scope.clickShare=function(id){
            $state.go('menu.tab.navShare',{id:id});
            $scope.closeSetting2();
        };

        icon_0=new BMap.Icon("img/nav_0.png", new BMap.Size(20, 26), {
            anchor: new BMap.Size(10, 26)
        });
        icon_1= new BMap.Icon("img/nav_1.png", new BMap.Size(20, 26), {
            anchor: new BMap.Size(10, 26)
        });
        icon_2= new BMap.Icon("img/nav_2.png", new BMap.Size(20, 26), {
            anchor: new BMap.Size(10, 26)
        });
        icon_3= new BMap.Icon("img/nav_3.png", new BMap.Size(20, 26), {
            anchor: new BMap.Size(10, 26)
        });
        icon_4= new BMap.Icon("img/nav_4.png", new BMap.Size(20, 26), {
            anchor: new BMap.Size(10, 26)
        });
        icon_5= new BMap.Icon("img/nav_5.png", new BMap.Size(20, 26), {
            anchor: new BMap.Size(10, 26)
        });
        arrIcon = new BMap.Icon("img/arraw.png", new BMap.Size(25, 27), {
            anchor: new BMap.Size(12, 27)
        });

        $scope.labelsList = [
            {name: "全部", value: 0,icon:icon_0},
            {name: "风景", value: 1,icon:icon_1},
            {name: "娱乐", value: 2,icon:icon_2},
            {name: "购物", value: 3,icon:icon_3},
            {name: "酒店", value: 4,icon:icon_4},
            {name: "美食", value: 5,icon:icon_5}
        ];

        $scope.orderList=[
            {name:'综合排序',value:0},
            {name:'距离最近',value:1},
            {name:'最新发布',value:2}
        ];

        $scope.shareList=null;
        $scope.labelCount=0;
        $scope.config={
            nowLabel:0,
            nowOrder:0,
            toggleNav:false,
            hasMore:true,
            nowIcon:icon_0,
            nowPage:1,
            lcX:0,
            lcY:0
        };
        $scope.$watch('config.nowLabel',function($new,$old){
            if($new!=$old){
                $scope.config.nowIcon=$scope.labelsList[$new].icon;
                getShare();
            }

        });
        $scope.$watch('config.nowOrder',function($new,$old){
            if($new!=$old) {
                getShare();
            }
        });

        $scope.$watch('config.toggleNav',function($new){
            if($new){
                openWatch();
            }else{
                closeWatch();
            }
        });


        $scope.$on("$stateChangeSuccess", function (evt,toState,toParams,fromState,fromParams) {
                if(toState.name=="menu.tab.nav"&&$scope.config.toggleNav){
                    openWatch();
                }

                if(fromState.name=="menu.tab.nav"&&$scope.config.toggleNav){
                    closeWatch();
                }

        });


        // 创建Map实例
        map = new BMap.Map("map2");
        //功能一：添加控件和比例尺
        top_right_navigation = new BMap.NavigationControl({
            anchor: BMAP_ANCHOR_TOP_RIGHT,
            type: BMAP_NAVIGATION_CONTROL_SMALL
        });

        //功能三：地图样式
        mapStyle=[
            {
                "featureType": "land",
                "elementType": "geometry",
                "stylers": {
                    "color": "#e7f7fc"
                }
            },
            {
                "featureType": "water",
                "elementType": "all",
                "stylers": {
                    "color": "#96b5d6"
                }
            },
            {
                "featureType": "green",
                "elementType": "all",
                "stylers": {
                    "color": "#b0d3dd"
                }
            },
            {
                "featureType": "highway",
                "elementType": "geometry.fill",
                "stylers": {
                    "color": "#a6cfcf"
                }
            },
            {
                "featureType": "highway",
                "elementType": "geometry.stroke",
                "stylers": {
                    "color": "#7dabb3"
                }
            },
            {
                "featureType": "arterial",
                "elementType": "geometry.fill",
                "stylers": {
                    "color": "#e7f7fc"
                }
            },
            {
                "featureType": "arterial",
                "elementType": "geometry.stroke",
                "stylers": {
                    "color": "#b0d5d4"
                }
            },
            {
                "featureType": "local",
                "elementType": "labels.text.fill",
                "stylers": {
                    "color": "#7a959a"
                }
            },
            {
                "featureType": "local",
                "elementType": "labels.text.stroke",
                "stylers": {
                    "color": "#d6e4e5"
                }
            },
            {
                "featureType": "arterial",
                "elementType": "labels.text.fill",
                "stylers": {
                    "color": "#374a46"
                }
            },
            {
                "featureType": "highway",
                "elementType": "labels.text.fill",
                "stylers": {
                    "color": "#374a46"
                }
            },
            {
                "featureType": "highway",
                "elementType": "labels.text.stroke",
                "stylers": {
                    "color": "#e9eeed"
                }
            }
        ];
        map.setMapStyle({
           styleJson:mapStyle
        });

        var openWatch=function(){

            if (!ionic.Platform.device().available) {
                alert("请下载自由行APP,自由开启导航模式...");
                return;
            }

           map.disableDragging();
            var watchOptions = {
                frequency : 1000,
                timeout : 3000,
                enableHighAccuracy: false // may cause errors if true
            };
            watchGeo = $cordovaGeolocation.watchPosition(watchOptions);
            watchGeo.then(
                null,
                function (err) {
                    // error
                },
                function (point) {
                    console.log('watch...');
                    map.panTo(point);  // 初始化地图,设置中心点坐标和地图级别
                    getShare();
                    console.log(vectorFCArrow.setPosition);
                    vectorFCArrow.setPosition(point);

                });

            watchOri = $cordovaDeviceOrientation.watchHeading({frequency: 200});
            watchOri.then(
                null,
                function (error) {
                    //error
                }, function (result) {
                    var magneticHeading = result.magneticHeading;
                    console.log(magneticHeading);
                    vectorFCArrow.setRotation(magneticHeading);
                });
        };

        var closeWatch=function(){
            map.enableDragging();
            vectorFCArrow && vectorFCArrow.setRotation(0.000001);
            watchGeo && $cordovaGeolocation.clearWatch(watchGeo.watchID);
            watchOri && $cordovaDeviceOrientation.clearWatch(watchOri.watchID);
        };

        var addMarker=function(point,icon){
            // 创建标注对象并添加到地图
            var marker= new BMap.Marker(point, {icon: icon});
            var index=markerList.length;
            markerList[index] =marker;
            map.addOverlay(marker);
            marker.addEventListener('click',function(event){
                var marker=event.target;
                for(var i=0;i<5;i++){
                    if(marker==markerList[i]){
                        $scope.slideChange(i);
                        $ionicSlideBoxDelegate.slide(i);
                    }
                }
            },false);

        };


        var getShare=function(){
            for(var i= 0,len=markerList.length;i<len;i++){
                map.removeOverlay(markerList[i]);
            }
            $scope.config.nowPage=1;
            $scope.config.hasMore=true;
            markerList=[];
            $timeout(function(){
                var bounds = map.getBounds();
                var sw = bounds.getSouthWest();
                var ne = bounds.getNorthEast();
                var lngSpan = Math.abs(sw.lng - ne.lng);
                var latSpan = Math.abs(ne.lat - sw.lat);
                SearchShare.set(sw,latSpan,lngSpan);
                SearchShare.get($scope.config)
                    .success(function(info){
                        var list=info.data;
                        $scope.shareList=list;
                        $ionicSlideBoxDelegate.update();
                        $ionicSlideBoxDelegate.slide(0);
                        $scope.labelCount=info.length;
                        var point,data;
                        for(i= 0,len=$scope.labelCount>5? 5:$scope.labelCount;i<len;i++){
                            data=list[i];
                            point=new BMap.Point(data.share_pointx,data.share_pointy);
                            addMarker(point,$scope.config.nowIcon);
                        }
                        $scope.$broadcast('scroll.infiniteScrollComplete');
                    });

            },200);
        };

        var loadMoreShare=function(){
            var bounds = map.getBounds();
            var sw = bounds.getSouthWest();
            var ne = bounds.getNorthEast();
            var lngSpan = Math.abs(sw.lng - ne.lng);
            var latSpan = Math.abs(ne.lat - sw.lat);
            SearchShare.set(sw,latSpan,lngSpan);
            SearchShare.get($scope.config)
                .success(function(list){
                    if(list){
                        $scope.shareList= $scope.shareList.concat(list);
                        $scope.config.hasMore=true;
                    }else{
                        $scope.config.hasMore=false;
                    }
                    $scope.$broadcast('scroll.infiniteScrollComplete');
                });
        };




        $cordovaGeolocation.getCurrentPosition()
            .then(function (point) {
                map.addEventListener('load',function(){
                    mapObj=document.getElementById("map2");
                    height = parseInt(DOM.getStyle(mapObj,"height"), 10);
                    width = parseInt(DOM.getStyle(mapObj,"width"), 10);
                    map.addControl(top_right_navigation);
                    map.addOverlay(vectorFCArrow=new BMap.Marker(point, {icon: arrIcon}));
                    map.addEventListener('zoomend',function(){
                        getShare();
                    },false);

                },false);
                $scope.config.lcX=point.lng;
                $scope.config.lcY=point.lat;
                map.centerAndZoom(point, 15);  // 初始化地图,设置中心点坐标和地图级别
            });


        map.addEventListener('moveend',function(){
            if(!$scope.config.toggleNav){
                getShare();
            }


        });

        map.addEventListener('addoverlay',function(event){
            if(event.target.Mc){
                var obj=angular.element(event.target.Mc);
                $animate.addClass(obj,'ani-discover')
                    .then(function(){
                        obj.parent().css('zIndex',0);
                        if(event.target==markerList[0]){
                            obj.addClass('ani-scale-big');
                        }
                    });
            }
        },false);



    })

/**
 * controller
 *
 */
    .controller('NavShareCtrl',function($scope,$stateParams,findShare,$ionicModal,addImage,$ionicLoading,$ionicPopup,AddReply,$http,host,File,$cordovaFileTransfer){

        $ionicModal.fromTemplateUrl('modal1.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function(modal) {
            $scope.modal = modal;
        });

        $scope.openSetting = function() {
            $scope.modal.show();
        };
        $scope.closeSetting = function() {
            $scope.modal.hide();
        };

        $scope.cancelSetting=function(){
            resetData();
            $scope.closeSetting();
        };


        $scope.addImage=function(){
            addImage($scope);
        };

        $scope.doRefresh=function(){
            console.log('reFresh....');
            findShare($stateParams.id).success(function(data){
                $scope.share=data;
                console.log(data);
            })
            $http.get(host+'/travelling-server/index.php/Home/Index/selectReply?id='+$stateParams.id)
                .success(function(data){
                    $scope.replyList=data;
                    $scope.$broadcast('scroll.refreshComplete');
                })
        };


        // "上传分享"Event
        $scope.submitShare = function () {

            if(!$scope.reply.reply_text){
                return;
            }

            $ionicLoading.show({
                template: '上传当中...',
                noBackdrop: true
            });

            var blobIndex = 0, blobCount = $scope.tpl_list.length;
            if (blobCount == 0) {
                //如果没有上传照片...
                addReply();
                return;
            }

            var url = host+'/travelling-server/index.php/Home/Index/ajax_getFile';
            var fileName;
            var options = new FileUploadOptions();
            options.fileKey = "file";
            options.mimeType = "image/jpeg";
            var eles = document.querySelectorAll('#navReply .pic-progress-wrap');
            for (var i = 0; i < blobCount; i++) {
                (function (index) {
                    var progress = angular.element(eles).eq(index).css('display', 'block');
                    var subProgress = progress.find('div');
                    fileName = 'img_' + (+new Date()) + "." + File.getFileExt($scope.tpl_list[index].url);
                    $scope.images_list.push(fileName);
                    options.fileName = fileName;
                    $cordovaFileTransfer.upload(url, $scope.tpl_list[index].url, options)
                        .then(
                        function (result) {
                            subProgress.css('width', '100%');
                            blobIndex++;
                            if (blobIndex == blobCount) {
                                addReply();
                            }

                        }, function (error) {
                            var errorcode = error.code;
                            var errstr;
                            switch (errorcode) {
                                case 1:
                                {
                                    errstr = "错误代码1：源文件路径异常，请重新选择或者拍照上传！";
                                    break;
                                }
                                case 2:
                                {
                                    errstr = "错误代码2:目标地址无效,请重试！";
                                    break;
                                }
                                case 3:
                                {
                                    errstr = "您手机或者后台服务器网络异常,请重新上传！";
                                    break;
                                }
                                default :
                                {
                                    errstr = "程序出错";
                                    break;
                                }

                            }
                            alert(errstr);
                        }, function (progress) {
                            subProgress.css('width', (progress.loaded / progress.total) * 100 + '%');
                        })
                }(i));
            }


        };


        //初始化数据
        var resetData=function(){
            $scope.images_list = [];
            $scope.tpl_list = [];
            $scope.startList=[
                {handle:false,score:20},
                {handle:false,score:20},
                {handle:false,score:20},
                {handle:false,score:20},
                {handle:false,score:20}
            ];
            $scope.reply={
                reply_score:0,
                reply_text:'',
                share_id:$stateParams.id,
                reply_support:0
            };
        };



        //上传点评数据到数据库
        var addReply = function () {
            $scope.images_list.length != 0 && ($scope.reply.reply_imgs = $scope.images_list.join(','));
            AddReply($scope.reply)
                .success(function (data) {
                    if (data.status == 1) {
                        $ionicLoading.hide();
                        $ionicPopup.alert({
                            title: '^o^',
                            template: '评价成功~',
                            okText: '确定'
                        })
                            .then(function () {
                                resetData();
                                $scope.closeSetting();
                                $scope.doRefresh();
                            })
                    }
                })
                .error(function (error) {
                    alert("error");
                });


        };

        resetData();
        $scope.doRefresh();



    })
/**
 *
 * controller
 *
 */

    .controller('MyShareCtrl',function($scope,Line,Circle,Text,findMyShare,Until){
        $scope.shareList=[];
        $scope.config={
            nowPage:1,
            hasMore:true
        };
        $scope.loadMore=function(){
            console.log('loadMore....');
            findMyShare($scope.config.nowPage).success(function(data){
                if(data){
                    makeSVG(data);
                    onframe();
                    $scope.config.nowPage+=1;
                }else{
                    $scope.config.hasMore=false;
                }
            });

        };

        $scope.moreDataCanBeLoaded=function(){
            return $scope.config.hasMore;
        };



        var pathList = [
        ];

        var typeList=["circle","line"];
        var index = 0,
            len,
            type= 0,
            x=(document.documentElement.clientWidth/2-60)/2,
            y=60,
            height=80,
            width=document.documentElement.clientWidth/4,
            radius=10;




        function makeSVG(data){
            var row,line,circle;
            $scope.shareList=$scope.shareList.concat(data);
            for(var i= 0,length=data.length;i<length;i++){
                row=i%6;
                if(row==0||row==1){
                    circle=[x+radius,y,radius];
                    line=[x+2*radius,y,width,0];
                    x+=(width+2*radius);
                }
                else if(row==2){
                    circle=[x+radius,y,radius];
                    line=[x+radius,y+radius,0,height];
                    y+=(height+2*radius);
                }
                else if(row==3||row==4){
                    circle=[x+radius,y,radius];
                    line=[x,y,-width,0];
                    x-=(width+2*radius);
                }
                else if(row==5){
                    circle=[x+radius,y,radius];
                    line=[x+radius,y+radius,0,height];
                    y+=(height+2*radius);
                }
                pathList[i]={
                    circle:circle,
                    line:line,
                    date:data[i].share_date,
                    city:data[i].share_city,
                    id:data[i].share_id
                }


            }
            len=pathList.length*2;
        }

        function onframe(){
            productPath(Math.floor(index/2),typeList[type])
                .then(function(){
                    if(index<len-1){
                        index++;
                        type=index%2;
                        onframe();
                    }else{
                        console.log('end');
                        index=0;
                        type= 0;
                        pathList=[];
                        $scope.$broadcast('scroll.infiniteScrollComplete');
                        return false;
                    }
                });
        }

        function productPath(index, type) {
            var path=pathList[index][type];
            if(type=='line'){
                return Line(path[0],path[1],path[2],path[3],'line');
            }else{
                Text(path[0],path[1],Until.convertDate(pathList[index].date));
                Text(path[0],path[1],pathList[index].city,"#f00");
                return Circle(path[0],path[1],path[2],'circle',pathList[index].id,$scope);
            }
        }


    })


/*
* controller
*
* */
    .controller('MyShare2Ctrl',function($scope){

    })