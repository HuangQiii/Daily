## 记录一次渲染的优化

在使用`react-router`的缓存情况下，发现每次切换tab页，页面中的组件还是会重新渲染，但是从观察上来看，是记录状态了的（也就是缓存的）。

所以使用PureComponent代替Component，以期减少非必要的渲染，提高性能。

### Step1: 确定是什么造成的渲染

通过给一个展示组件加上`shouldComponentUpdate`，对nextProp和props的比较，进行输出。

### Step2: 手动判断是否渲染情况

通过在`shouldComponentUpdate`中浅判断`isEqual`（Lodash）来返回

```javascript
shouldComponentUpdate(nextProps, nextState) {
  return !isEqual(nextProps, this.props);
}
```

但是不能每个业务组件都让程序员加上这个判断，能不能在外面再包一层呢？

考虑到component其实是`Routr`中的component参数返回的，而我们推荐用asyncRouter(() => import(uri))的方式来引入，因为这是一个按需加载的组件，所以我们可以在asyncRouter这一层再包一层。

代码非常简单：

```javascript
// AsyncCmpWrap.jsx
import React, { Component } from 'react';
import isEqual from 'lodash/isEqual';

export default class AsyncModuleWrapper extends Component {
  passProp = this.props;

  shouldComponentUpdate(nextProps, nextState) {
    const shouldUpdate = !isEqual(nextProps, this.props);
    this.passProp = !shouldUpdate ? this.props : nextProps;
    return shouldUpdate;
  }

  render() {
    return this.props.children(this.passProp);
  }
}
```

```javascript
// asyncRouter.jsx

renderChild = (prop) => {
  const { Cmp } = this.state;
  return <Cmp {...prop} />;
}

render() {
  const { Cmp, injects } = this.state;
  const p = { ...Object.assign({}, extProps, this.props, ...injects) };

  return Cmp && (
    <AsyncCmpWrap {...p}>
      {this.renderChild}
    </AsyncCmpWrap>
  );

  // return Cmp && <Cmp {...Object.assign({}, extProps, this.props, ...injects)} />;
}
```

注意！

上面的形式看起来，理所当然，但是第一个版本是这样的

```javascript
render() {
  const { Cmp, injects } = this.state;
  const p = { ...Object.assign({}, extProps, this.props, ...injects) };

  return Cmp && (
    <AsyncCmpWrap {...p}>
      {(prop) => (<Cmp {...prop} />)}
    </AsyncCmpWrap>
  );

  // return Cmp && <Cmp {...Object.assign({}, extProps, this.props, ...injects)} />;
}
```

发现每次都刷新了，即wrap里的shouldComponentUpdate每次都返回true，这是为什么呢？网上有很多组件也是这样写的啊。

因为props.children是个不同的函数，所以后来加到类中编译。

## 那么问题来了，react的渲染到底受到哪些因素影响呢？