# A webApp from ionic —— Travelling



-----
##  some note:

### - 判断是web还是app
ionic.Platform.device().available

### - 判断有没有视图历史记录
$ionicHistory.viewHistory().backView

### - ng-upload-file issue
ngf-resize="{width: 500, height: 300, quality: .8}" can't run on mobile browser

because of Blob unsupporsted to qq web Browser, and blobBuilder.append() can't fill arraybuffer in .
