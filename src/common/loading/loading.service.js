const Template = require('./loading.service.html');
require('./loading.service.css');

angular.module('travelling.common.services')
    .factory('GoeLoadService', GoeLoadService);

/* @ngInject */
function GoeLoadService($compile, $document, $rootScope) {
    const tpl = Template;
    let status = -1; //   -1:没显示  1:正在加载
    let element = null;
    let scope;

    $rootScope.$on('$stateChangeSuccess', function () {
        release();
    });


    return {retain, release};

    function retain() {
        if (status === 1) return;
        element = $compile(tpl)(scope = $rootScope.$new(true));
        $document.find('body').eq(0).append(element);
        status = 1;
    }

    function release() {
        if (status === -1) return;
        scope.$destroy();
        element.remove();
        status = -1;
    }
}
