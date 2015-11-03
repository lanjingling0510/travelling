angular.module('starter.services', [])
    .constant('host', 'http://www.cyt-rain.cn')
    //.constant('host', 'http://192.168.253.1')
    .constant('apiKey', 'qaTktU1i8sba2rj3')
    .constant('apiSecret', 'RcY5oCWqALG8UCeiyt3B7HdanXhRl1')

    .factory('Weathers', function ($http, host) {
        var path = "/travelling-server/index.php/Home/Index/ajax_getWeather";
        return function (city) {
            return $http({
                method: "GET",
                url: host + path,
                params: {
                    city: city
                },
                responseType: "json"
            });
        }
    })


    .factory('BaiDu', function ($q) {
        var myGeo = new BMap.Geocoder();
        return {
            getLocationName: function (point) {
                var deferred = $q.defer();

                // 根据坐标得到地址描述
                myGeo.getLocation(new BMap.Point(point.x, point.y), function (result) {
                    if (result) {
                        deferred.resolve(result.address);
                    } else {
                        deferred.reject("亲，位置加载失败~")
                    }
                });
                return deferred.promise;
            },
            getLocationPos: function (name) {
                var deferred = $q.defer();
                var myGeo = new BMap.Geocoder();
                myGeo.getPoint(name, function (point) {
                    deferred.resolve(point);
                });
                return deferred.promise;
            },
            getAddressComponents: function (point) {
                var deferred = $q.defer();

                // 根据坐标得到地址描述
                myGeo.getLocation(point, function (result) {
                    if (result) {
                        deferred.resolve(result.addressComponents);
                    } else {
                        deferred.reject("亲，位置加载失败~")
                    }
                });
                return deferred.promise;
            }
        }
    })

    .factory('File', function ($q) {
        return {
            //..................................................................................
            //baseUrl转成blob
            // ..................................................................................
            urlToBlob: function (url) {
                var binary = atob(url.replace('data:image/jpeg;base64,', ''));
                var mimeStr = dataUrl.split(',')[0].split(':')[1].split(';')[0];
                var ab = new ArrayBuffer(binary.length);
                var ia = new Uint8Array(ab);
                for (var i = 0; i < binary.length; i++) {
                    ia[i] = binary.charCodeAt(i);
                }
                return new Blob([ia], {type: mimeStr});
            },
            getFileExt: function (value) {
                var pos, pos2;
                if ((pos = value.lastIndexOf(".")) == -1) {
                    return false;
                } else {
                    pos2 = (value.lastIndexOf("?") == -1) ? value.length : value.lastIndexOf("?");
                    return value.substring(pos + 1, pos2).toLowerCase();
                }
            }
        }
    })

    /*公共工具*/
    .factory('Until',function(){
        return {
            convertDate:function(timeStamp){
                var startTime=new Date(timeStamp);
                var startTimeMills = startTime.getTime();
                var endTimeMills = new Date().getTime();
                var diff = parseInt((endTimeMills - startTimeMills) / 1000);//秒
                var day_diff = parseInt(Math.floor(diff / 86400));//天
                var buffer = Array();
                if (day_diff < 0) {
                    return "[error],时间越界...";
                } else {
                    if (day_diff == 0 && diff < 60) {
                        if (diff <= 0)
                            diff = 1;
                        buffer.push(diff + "秒前");
                    } else if (day_diff == 0 && diff < 120) {
                        buffer.push("1 分钟前");
                    } else if (day_diff == 0 && diff < 3600) {
                        buffer.push(Math.round(Math.floor(diff / 60)) + "分钟前");
                    } else if (day_diff == 0 && diff < 7200) {
                        buffer.push("1小时前");
                    } else if (day_diff == 0 && diff < 86400) {
                        buffer.push(Math.round(Math.floor(diff / 3600)) + "小时前");
                    } else if (day_diff == 1) {
                        buffer.push("1天前");
                    } else if (day_diff < 7) {
                        buffer.push(day_diff + "天前");
                    } else if (day_diff < 30) {
                        buffer.push(Math.round(Math.ceil(day_diff / 7)) + " 星期前");
                    } else if (day_diff >= 30 && day_diff <= 179) {
                        buffer.push(Math.round(Math.ceil(day_diff / 30)) + "月前");
                    } else if (day_diff >= 180 && day_diff < 365) {
                        buffer.push("半年前");
                    } else if (day_diff >= 365) {
                        buffer.push(Math.round(Math.ceil(day_diff / 30 / 12)) + "年前");
                    }
                }
                return buffer.toString();
            }
        }
    })

    .factory('DOM', function () {
        return {
            getStyle: function (e, n) {
                if (e.style[n]) {
                    return e.style[n];
                } else if (e.currentStyle) {
                    return e.currentStyle[n];
                } else if (document.defaultView && document.defaultView.getComputedStyle) {
                    n = n.replace(/([A-Z])/g, "-$1");
                    n = n.toLowerCase();
                    var s = document.defaultView.getComputedStyle(e, null);
                    return s.getPropertyValue(n);
                }
            }
        }
    })

    /*阿里云存储api*/
    .factory('OSS', function (apiSecret, apiKey, $q) {
        var POLICY_JSON = {
            "expiration": "2020-12-01T12:00:00.000Z",
            "conditions": [
                ["starts-with", "$key", ""],
                {"bucket": 'bucket-travelling'},
                ["starts-with", "$Content-Type", ""],
                ["content-length-range", 0, 524288000]
            ]
        };
        var policyBase64 = Base64.encode(JSON.stringify(POLICY_JSON));
        var signature = b64_hmac_sha1(apiSecret, policyBase64);
        var host = 'http://bucket-travelling.oss-cn-beijing.aliyuncs.com';

        function createXmlHttpRequest() {
            if (window.ActiveXObject) { //如果是IE浏览器
                return new ActiveXObject("Microsoft.XMLHTTP");
            } else if (window.XMLHttpRequest) { //非IE浏览器
                return new XMLHttpRequest();
            }
        }

        return {
            putToOSS: function (i, blob, fileName, type) {
                var defer = $q.defer();
                var fd = new FormData();
                var key = type + "/" + fileName;
                fd.append('key', key);
                fd.append('Content-Type', blob.type);
                fd.append('OSSAccessKeyId', apiKey);
                fd.append('policy', policyBase64);
                fd.append('signature', signature);
                fd.append("file", blob);
                var xhr = createXmlHttpRequest();
                xhr.upload.addEventListener("progress", uploadProgress, false);
                xhr.addEventListener("load", uploadComplete, false);
                xhr.addEventListener("error", uploadFailed, false);
                xhr.open('POST', host, true); //MUST BE LAST LINE BEFORE YOU SEND
                xhr.send(fd);
                function uploadProgress(evt) {
                    if (evt.lengthComputable) {
                        defer.notify({value: Math.round(evt.loaded * 100 / evt.total), index: i});
                    } else {
                        alert('unable to compute');
                    }
                }

                function uploadComplete(evt) {
                    defer.resolve(evt);
                }

                function uploadFailed(evt) {
                    alert("There was an error attempting to upload the file." + evt);
                }

                return defer.promise;
            }
        }
    })


    /*插入分享API*/
    .factory('AddShare', function ($http, host) {
        return function (data) {
            var paramArr = [];
            for (var key in data) {
                paramArr.push(key + "=" + data[key]);
            }
            return $http({
                method: 'POST',
                url: host + '/travelling-server/index.php/Home/Index/ajax_addShare',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                data: paramArr.join('&')
            });
        }

    })


    //.factory('SettingOverlay',function(){
    //    var SettingOverlay=function(center,length){
    //        this._center = center;
    //        this._length = length;
    //    };
    //
    //    SettingOverlay.prototype = new BMap.Overlay();
    //    // 实现初始化方法
    //    SettingOverlay.prototype.initialize = function(map){
    //        this._map = map;
    //        var div = document.createElement("div");
    //        div.className="settingLayer";
    //        div.style.width = this._length + "px";
    //        div.style.height = this._length + "px";
    //        map.getPanes().floatPane.appendChild(div);
    //        this._div = div;
    //        return div;
    //    };
    //
    //    SettingOverlay.prototype.draw = function(){
    //        var position = this._map.pointToOverlayPixel(this._center);
    //        this._div.style.left = position.x - this._length / 2 + "px";
    //        this._div.style.top = position.y - this._length / 2 + "px";
    //    };
    //    return function(center,length){
    //        return new SettingOverlay(center,length);
    //    }
    //})


    /*搜索分享API*/
    .factory('SearchShare', function (host, $timeout, $http, $q) {
        var url = host + '/travelling-server/index.php/Home/Index/selectShareByMap';
        var height, width, point;
        var defer_now;
        return {
            set: function (p, h, w) {
                point = p;
                height = h;
                width = w;
            },
            get: function (config) {

                defer_now && defer_now.resolve();
                defer_now = $q.defer();
                return $http({
                    method: "GET",
                    url: url,
                    timeout: defer_now.promise,
                    params: {
                        width: width,
                        height: height,
                        x: point.lng,
                        y: point.lat,
                        lcX: config.lcX,
                        lcY: config.lcY,
                        label: config.nowLabel,
                        page: config.nowPage,
                        order: config.nowOrder
                    }
                })
            }
        }
    })

    /*查找一条分享API*/
    .factory('findShare', function (host, $http) {
        var url = host + '/travelling-server/index.php/Home/Index/findShare';
        return function (id) {
            return $http({
                method: "GET",
                url: url,
                params: {
                    id: id
                }
            });
        }
    })

    /*查询我的分享API*/
    .factory('findMyShare',function(host,$http){
        var url=host+'/travelling-server/index.php/Home/Index/findMyShare';
        return function(page){
            return $http({
               method:"GET",
                url:url,
                params:{
                    page:page
                }
            });
        }
    })

    /*添加图片*/
    .factory('addImage', function ($ionicActionSheet, $cordovaCamera, $cordovaImagePicker) {

        var appendByCamera = function ($scope) {
            var options = {
                quality: 80,
                destinationType: Camera.DestinationType.FILE_URL,
                sourceType: Camera.PictureSourceType.CAMERA,
                //sourceType:Camera.PictureSourceType.SAVEDPHOTOALBUM,
                allowEdit: true,
                encodingType: Camera.EncodingType.JPEG,
                targetWidth: document.documentElement.clientWidth,
                targetHeight: document.documentElement.clientHeight,
                popoverOptions: CameraPopoverOptions,
                saveToPhotoAlbum: true
            };
            $cordovaCamera.getPicture(options).then(function (imgData) {
                $scope.tpl_list.push({url: imgData, close: false});
            }, function (err) {
                // error
            });

        };

        var pickImage = function ($scope) {
            var options = {
                maximumImagesCount: 30,
                width: 500,
                height: 500,
                quality: 80
            };

            $cordovaImagePicker.getPictures(options)
                .then(function (results) {
                    results.forEach(function (item) {
                        $scope.tpl_list.push({url: item, close: false});
                    });
                }, function (error) {
                    // error getting photos
                    alert('error getting photos...');
                });

        };

        return function ($scope) {
            $ionicActionSheet.show({
                buttons: [
                    {text: '相机'},
                    {text: '图库'}
                ],
                cancelText: '关闭',
                cancel: function () {
                    return true;
                },
                buttonClicked: function (index) {
                    if (!ionic.Platform.device().available) {
                        alert("请下载自由行APP,自由的上传照片...");
                        return;
                    }
                    switch (index) {
                        case 0:
                            appendByCamera($scope);
                            break;
                        case 1:
                            pickImage($scope);
                            break;
                        default:
                            break;
                    }
                    return true;
                }
            });
        }

    })

    /*上传点评*/
    .factory('AddReply', function (host, $http) {
        return function (data) {
            var paramArr = [];
            for (var key in data) {
                if (key == 'reply_support') {
                    data[key] = data[key] ? 1 : 0;
                }
                paramArr.push(key + "=" + data[key]);
            }
            return $http({
                method: 'POST',
                url: host + '/travelling-server/index.php/Home/Index/ajax_addReply',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                data: paramArr.join('&')
            });
        }
    })
    /*最新的app版本*/
    .factory('NewAppVersion', function ($http, host,$ionicPopup,$ionicLoading,$cordovaFileTransfer,$cordovaFileOpener2) {
        var url = host + "/travelling-server/index.php/Home/Index/appVersion";
        return {
            get: function () {
                return $http.get(url);
            },
            showUpdateConfirm:function(content,version){
                var confirm=$ionicPopup.confirm({
                    title:'版本升级',
                    template:content,
                    cancelText:'取消',
                    okText:'升级'
                });
                confirm.then(function(res){
                    if(res){
                        $ionicLoading.show({
                            template: "已经下载：0%"
                        });
                        var apkUrl="http://bucket-travelling.oss-cn-beijing.aliyuncs.com/travelling-"+version+".apk";
                        var targetPath="/sdcard/Download/travelling.apk";
                        $cordovaFileTransfer.download(apkUrl,targetPath,{},true)
                            .then(function(result){
                                //打开下载下来的app
                                $cordovaFileOpener2.open(targetPath,'application/vnd.android.package-archive')
                                    .then(function(){
                                        //打开成功！
                                    });
                                $ionicLoading.hide();

                            },function(){
                                alert('下载失败');
                            },function(progress){
                                var downloadProgress = (progress.loaded / progress.total) * 100;
                                console.log(downloadProgress);
                                $ionicLoading.show({
                                    template:"已经下载"+Math.floor(downloadProgress)+'%'
                                });
                                if (downloadProgress > 99) {
                                    $ionicLoading.hide();
                                }
                            })
                    }
                });
            }
        }
    })

    /*我的分享路径*/

    .factory('Line', function ($animate, $q,$timeout,DOM) {
        function Line(x, y, width, height, type) {
            this.type = type;
            this.x = x;
            this.y = y;
            this.width = width;
            this.height = height;
            this.element = angular.element(document.createElementNS("http://www.w3.org/2000/svg", "line"));
        }

        Line.prototype.init = function () {
            var that = this;
            that.element.attr({
                x1:that.x,
                y1:that.y,
                x2:that.x+that.width|0,
                y2:that.y+that.height|0,
                'stroke-width':7,
                'stroke':'#3FA9F5',
                'fill':'none',
                'stroke-miterlimit':10
            })
        };

        Line.prototype.draw = function (defer) {
            var that = this;
            var parent=angular.element(document.getElementById('svg-share'));
            $timeout(function(){
                parent.css('height',parseInt(DOM.getStyle(parent[0],'height'),10)+33.333);
                $animate.enter(that.element, parent)
                    .then(function(){
                        defer.resolve();
                    })
            }, 60);

        };

        return function (x, y, width, height, type) {
            var defer = $q.defer();
            var line = new Line(x, y, width, height, type);
            line.init();
            line.draw(defer);
            return defer.promise;
        };

    })
    .factory('Text',function(){
        function Text(x,y,date,color){
            this.x=x;
            this.y=y;
            this.date=date;
            this.color=color;
            this.element=angular.element(document.createElementNS("http://www.w3.org/2000/svg", "text"));
        }
        Text.prototype.init=function(){
            var that=this;
            that.element.attr({
                x:that.x,
                y:that.color?that.y-20:that.y-35,
                'text-anchor':"middle",
                'fill':that.color||'#000'
            });
            that.element.html(that.date);
        };
        Text.prototype.draw=function(){
              var that=this;
              var parent=angular.element(document.getElementById('svg-share'));
              parent.append(that.element);
        };
        return function(x,y,date,color){
            var text=color?new Text(x,y,date,color) : new Text(x,y,date);
            text.init();
            text.draw();
        }


    })

    .factory('Circle',function($animate,$q,$timeout,$location){

        function Circle(cx,cy,r,type,id){
            this.type=type;
            this.cx=cx;
            this.cy=cy;
            this.r=r;
            this.id=id;
            this.element = angular.element(document.createElementNS("http://www.w3.org/2000/svg", "circle"));
        }

        Circle.prototype.init=function(){
            var that=this;
            that.element.attr({
                cx:that.cx,
                cy:that.cy,
                r:that.r,
                fill:'#fff',
                stroke:'#3FA9F5',
                'stroke-width':7,
                'stroke-miterlimit': 10
            });
        };
        Circle.prototype.draw=function(defer,$scope){
            var that=this;
            var parent=angular.element(document.getElementById('svg-share'));
            $timeout(function(){
                $animate.enter(that.element,parent)
                    .then(function(){
                        that.element.on('click',function(){
                            $scope.$apply(function(){
                                $location.path("/menu/my-share2/"+that.id);
                            })
                        });
                        defer.resolve();
                    })
            },60);

        };

        return function(cx,cy,r,type,id,$scope){
            var defer=$q.defer();
            var circle=new Circle(cx,cy,r,type,id);
            circle.init();
            circle.draw(defer,$scope);
            return defer.promise;
        }


    })
