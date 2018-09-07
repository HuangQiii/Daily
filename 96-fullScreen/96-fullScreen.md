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

## 遇到的问题

一切看上去多么正常，可以正常拖动和操作，但是当点击一些弹出层，如Modal弹出框，Popover弹出层，没有任何反应，退出全屏后发现他们却是已经打开了的，这是怎么回事？

联想到有时候滚动时弹出层会脱离滚动，可以猜测出弹出层是“绑定”到某个结点的，查看api发现默认是body结点。

而react项目又是在app标签中的，这样app标签和弹出层是平等的结点，所以全屏某个结点时，弹出层在下面正常执行而不在全屏里显示。

### 解决方法

指定getContainer和getPopupContainer即可。

采用`getPopupContainer={triggerNode => triggerNode}`来解决。

## 题外话

没有意识到是trigger层的问题时，一头雾水地看源码，发现了一些有意思的代码段。

```
getContainer = () => {
    const { props } = this;
    const popupContainer = document.createElement('div');
    // Make sure default popup container will never cause scrollbar appearing
    // https://github.com/react-component/trigger/issues/41
    popupContainer.style.position = 'absolute';
    popupContainer.style.top = '0';
    popupContainer.style.left = '0';
    popupContainer.style.width = '100%';
    const mountNode = props.getPopupContainer ?
      props.getPopupContainer(findDOMNode(this)) : props.getDocument().body;
    mountNode.appendChild(popupContainer);
    return popupContainer;
  }
```

如上的getContainer会生成一个宽100%的绝对定位的div，找到创建弹出层的结点然后创建。

```
  // Portal.js
  // 这个函数就像我们刚才上面所提到的Potal组件的一个编写，非常有用
  // 可以利用这个组件创建在一些我们所需要创建组件的地方，比如在body节点创建
  // 模态框，或者在窗口节点创建fixed的定位的弹出框之类的。
  // 这个组件在componentWillUnmount时一定要将节点移除
  import React from 'react';
  import PropTypes from 'prop-types';
  import { createPortal } from 'react-dom';

  export default class Portal extends React.Component {
    static propTypes = {
      getContainer: PropTypes.func.isRequired,
      children: PropTypes.node.isRequired,
    }

    componentDidMount() {
      this.createContainer();
    }

    componentWillUnmount() {
      this.removeContainer();
    }

    createContainer() {
      this._container = this.props.getContainer();
      this.forceUpdate();
    }

    removeContainer() {
      if (this._container) {
        this._container.parentNode.removeChild(this._container);
      }
    }

    render() {
      if (this._container) {
        return createPortal(this.props.children, this._container);
      }
      return null;
    }
  }
```

```
let portal;
  // prevent unmounting after it's rendered
  if (popupVisible || this._component) {
    portal = (
      <Portal
        key="portal"
        getContainer={this.getContainer}
      >
        {this.getComponent()}
      </Portal>
    );
  }

  return [
    trigger,
    portal,
  ];
```

使用Protal组件将需要挂载的dom元素渲染出来，使用getContainer进行dom节点的创建，使用getComponent将弹出层渲染，最终挂载在getContainer创建的dom节点，然后append在body，这就是使用了react16版本的一个创建过程，其中Protal组件中就是用了react16中的createPortal