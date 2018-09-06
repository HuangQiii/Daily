# 由全屏展开的全屏和组件getPopupContainer学习

## 问题描述

故事地图界面点击全屏可以展开。

## 使用html5 api

```
dom.requestFullScreen();
```

众所周知的原因，有兼容性问题，写兼容性函数处理。

```
function toFullScreen(dom) {
  if (dom.requestFullscreen) {
    return dom.requestFullScreen();
  } else if (dom.webkitRequestFullScreen) {
    return dom.webkitRequestFullScreen();
  } else if (dom.mozRequestFullScreen) {
    return dom.mozRequestFullScreen();
  } else {
    return dom.msRequestFullscreen();
  }
}
```

可通过

```
fullScreen = () => {
    const target = document.querySelector('.content');
    toFullScreen(target);
  };
```

调用。

## 退出全屏

```
function exitFullScreen() {
  if (document.exitFullscreen) {
    document.exitFullscreen();
  } else if (document.msExitFullscreen) {
    document.msExitFullscreen();
  } else if (document.mozCancelFullScreen) {
    document.mozCancelFullScreen();
  } else if (document.webkitExitFullscreen) {
    document.webkitExitFullscreen();
  }
}
```

不管是对document全屏还是某个dom结点全屏，都使用document.exitFullScreen()退出。

## 判断当前是否处于全屏状态

由于设计到同个按钮，则点击时要判断是否处于全屏，并且切换状态。

```
const isFullScreen = document.webkitFullscreenElement
      || document.mozFullScreenElement
      || document.msFullscreenElement;
```