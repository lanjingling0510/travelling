angular.module('travelling.common.services')
    .factory('BMapOverlay', BMapOverlayService);

/* @ngInject*/
function BMapOverlayService() {
    // 定义自定义覆盖物的构造函数
    function ToolTopOverlay({point, width, height, data}) {
        this._center = point;
        this._width = width;
        this._height = height;
        this._data = data;
    }


// 继承API的BMap.Overlay
    ToolTopOverlay.prototype = new BMap.Overlay();


    // 实现初始化方法
    ToolTopOverlay.prototype.initialize = function (map) {
        this._map = map;
        const share = this._data;
        const divTemplate = `
            <div class="tooltip">
                <div class="tooltip-col-lf">
                    <img width="100%" src="${share.images[0]}" />
                </div>
                <div class="tooltip-col-rt">
                    <h1 class="tooltip-title">
                        ${share.place}
                    </h1>
                </div>
                <div class="arrow"></div>
            </div>
        `;

        let div = document.createElement('div');
        div.innerHTML = divTemplate;
        div = div.children[0];

        map.getPanes().markerPane.appendChild(div);
        this._div = div;
        // 需要将div元素作为方法的返回值，当调用该覆盖物的show、
        // hide方法，或者对覆盖物进行移除时，API都将操作此元素。
        return div;
    };


    // 实现绘制方法
    ToolTopOverlay.prototype.draw = function () {
// 根据地理坐标转换为像素坐标，并设置给容器
        console.log(this._height);
        const position = this._map.pointToOverlayPixel(this._center);
        this._div.style.left = position.x - this._width / 2 + 'px';
        this._div.style.top = position.y - this._height - 70 + 'px';
        this._div.style.width = this._width + 'px';
        this._div.style.height = this._height + 'px';
    };


    // 实现显示方法
    ToolTopOverlay.prototype.show = function () {
        if (this._div) {
            this._div.style.display = '';
        }
    };


    // 实现隐藏方法
    ToolTopOverlay.prototype.hide = function () {
        if (this._div) {
            this._div.style.display = 'none';
        }
    };


    // 实现切换方法
    ToolTopOverlay.prototype.toggle = function () {
        if (this._div) {
            this._div.style.display = (this._div.style.display === '' ? 'none' : '');
        }
    };

    return ToolTopOverlay;
}
