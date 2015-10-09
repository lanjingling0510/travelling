angular.module('travelling.common.services')
    .factory('DomService', DomService);

/* @ngInject*/
function DomService() {
    return {
        getStyle: getStyle,
    };


    function getStyle(e, n) {
        if (e.style[n]) {
            return e.style[n];
        } else if (e.currentStyle) {
            return e.currentStyle[n];
        } else if (document.defaultView && document.defaultView.getComputedStyle) {
            const property = n.replace(/([A-Z])/g, '-$1').toLowerCase();
            const s = document.defaultView.getComputedStyle(e, null);
            return s.getPropertyValue(property);
        }
    }
}


