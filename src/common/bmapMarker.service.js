angular.module('travelling.common.services')
    .factory('BMapMarker', BMapMarkerService);

/* @ngInject*/
function BMapMarkerService($animate) {
    // 定义自定义覆盖物的类
    class MarkerOverlay extends BMap.Overlay {
        constructor({point, iconUrl}) {
            super();
            this._center = point;
            this._width = 20;
            this._height = 26;
            this._src = iconUrl;
        }

        // 实现初始化方法
        initialize(map) {
            this._map = map;
            const div = document.createElement('div');
            const img = document.createElement('img');

            div.classList.add('marker-overlay');
            this._div = div;
            img.src = this._src;
            img.width = this._width;
            img.height = this._height;
            div.appendChild(img);
            this.enterFinish = new Promise(resolve => {
                $animate.enter(angular.element(div), angular.element(map.getPanes().markerPane))
                    .then(() => {
                        resolve();
                    });
            });

            return div;
        }

        // 实现绘制方法
        draw() {
            // 根据地理坐标转换为像素坐标，并设置给容器
            const position = this._map.pointToOverlayPixel(this._center);
            this._div.style.left = position.x - this._width / 2 + 'px';
            this._div.style.top = position.y - this._height + 'px';
        }

        // 实现显示方法
        show() {
            if (this._div) {
                this._div.style.display = '';
            }
        }

        // 实现隐藏方法
        hide() {
            if (this._div) {
                this._div.style.display = 'none';
            }
        }

        getPosition() {
            return this._center;
        }
    }

    return MarkerOverlay;
}
