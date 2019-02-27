## React Hooks(待补充)

React Hooks 要解决的问题是状态共享（其实更合理地说是状态逻辑的共享或者复用）

主要是指，相同的逻辑代码段，如鼠标事件的处理出现在两个组件中时，就可以把处理鼠标事件的逻辑提取成一个组件。又比如抽离样式获取和纯展示组件的逻辑。

在React Hooks之前，主要通过[render-props](https://reactjs.org/docs/render-props.html) 和 [higher-order components](https://reactjs.org/docs/higher-order-components.html) 两种方案。

## render-props

### 参考阅读

先把最推荐阅读的链接贴上：

[React官方文档中的render-props](https://reactjs.org/docs/render-props.html)

### 定义

里面有一句话，表达地非常贴切：

> a render prop is a function prop that a component uses to know what to render.

render prop一种告诉组件如何render的函数prop。（告诉组件如何渲染即可，没有必须的格式要求）

### 形式

- 带render属性的

```js
<DataProvider render={data => (
  <h1>Hello {data.target}</h1>
)}/>
```

- props形式

```js
<DataProvider> 
  {data => <h1>Hello {data.target}</h1>}
</DataProvider>
```

以第二种更为常见。

### 注意点

1. 如官方文档中[Caveats](https://reactjs.org/docs/render-props.html#caveats)中所列的第一点

与PureComponent的结合使用时要特别注意。

```js
<Mouse render={mouse => (
  <Cat mouse={mouse} />
)}/>
```

如果Mouse组件，是一个PureComponent，由于render每次都会传递不同的函数引用，所以Mouse组件会重新渲染。

解决方法就是把render函数提取为一个实例方法。

（具体为啥可以这样解决，可以查看编译后的两种函数的声明方式来对比了解）


*实际例子*

为了达到页面缓存的效果，发现页面每次都会刷新

```js
// asyncRouter.js
render() {
  const { Cmp, injects } = this.state;
  const p = { ...Object.assign({}, extProps, this.props, ...injects) };

  return Cmp && (
    <AsyncCmpWrap>
      {p => <Cmp {...p} />}
    </AsyncCmpWrap>
  );
}
```

```js
// AsyncCmpWrap.js
shouldComponentUpdate(nextProps, nextState) {
  const shouldUpdate = !isEqual(nextProps, this.props);
  this.passProp = !shouldUpdate ? this.props : nextProps;
  return shouldUpdate;
}

render() {
  return this.props.children(this.passProp);
}
```

不能使用的原因和上述类似，因为箭头函数每次都会传递新的函数过去

改为如下即可：

```js
// asyncRouter.js
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
}
```

当时这个问题还有专门的记录[传送门](https://github.com/HuangQiii/Daily/blob/master/1220-render/1220-render.md)

2. 与Mobx结合使用时，改变了数据却不渲染

bug来自于同事的一个实际场景，他抽离了一个Provider组件，大体如下

```js
import Store from './store';

// @observer

<Provider>
  {({ id, name }) => (
    <Card
      name={name}
      clicked={Store.getCurrentClickedCardId === id}
    />
  )}
</Provider>
```

发现点击卡片后，改变了Store的currentClickedCardId，而卡片并没有变色，而当前组件和Card组件是可观测的。

问题就在Provider组件上，因为Provider组件本身是不可观察的，而render-props的本质是在Provider组件内进行render，也就是说，此时的上下文是Provider组件！而不是引用Provider的组件。

对Provider组件来说，state和props都没有改变，不会更新。

*2月26补充*

在Mobx官网发现也提到了这种[现象](https://cn.mobx.js.org/best/react.html#mobx-%E5%8F%AA%E4%BC%9A%E4%B8%BA%E6%95%B0%E6%8D%AE%E6%98%AF%E7%9B%B4%E6%8E%A5%E9%80%9A%E8%BF%87-render-%E5%AD%98%E5%8F%96%E7%9A%84-observer-%E7%BB%84%E4%BB%B6%E8%BF%9B%E8%A1%8C%E6%95%B0%E6%8D%AE%E8%BF%BD%E8%B8%AA)，并且附有解决办法。

## React的渲染逻辑

既然上面提到了React的渲染逻辑，就来整理一下这部分。

首先来确定一下，如何判断一个组件是不是发生了渲染或者重渲染（rerender）。

1. console法

在组件的render函数中，打印输出，每当函数发生（重）渲染，就会在控制台输出一条。

2. 使用React插件的Preferences中的Highlight Updates

当组件渲染时，会有高亮，如下图：

![highlight_updates](./pics/highlight_updates.png)

什么情况下会触发re-render，大家可能都能说上来，state和props发生改变时。

而其中的注意点和一些事例代码非常多，参加[另一篇总结](https://github.com/HuangQiii/Daily/blob/master/1220-render/1220-render.md#%E9%82%A3%E4%B9%88%E9%97%AE%E9%A2%98%E6%9D%A5%E4%BA%86react%E7%9A%84%E6%B8%B2%E6%9F%93%E5%88%B0%E5%BA%95%E5%8F%97%E5%88%B0%E5%93%AA%E4%BA%9B%E5%9B%A0%E7%B4%A0%E5%BD%B1%E5%93%8D%E5%91%A2)

## Redux（待补充，可能不补充）

## Mobx（待补充）

### Mobx原理

### Proxy

### Immer模拟

## HOC

### 参考阅读

先把最推荐阅读的链接铁扇：

[React官方文中中的Higher-Order Components](https://reactjs.org/docs/higher-order-components.html)

### 定义

直接摘自上文

> A higher-order component (HOC) is an advanced technique in React for reusing component logic. 

> Concretely, a higher-order component is a function that takes a component and returns a new component.

说的非常明确了，HOC是一个函数！这个函数接收一个组件并且返回一个新的组件。

### 形式

```js
function enhanced(WrappedComponent) {
  return class extends React.Component {
    componentWillReceiveProps(nextProps) {
      console.log('Current props: ', this.props);
      console.log('Next props: ', nextProps);
    }
    render() {
      return <WrappedComponent {...this.props} />;
    }
  }
}
```

### 注意点

1. 不改变原组件，而是使用组合

比如要在生命周期里增加一些输出，不用去原组建的原型链上修改生命周期，而是在新返回的组件里加上新的生命周期。

因为会覆盖原组件的生命周期，导致功能丢失。

[链接](https://reactjs.org/docs/higher-order-components.html#dont-mutate-the-original-component-use-composition)

2. 要把HOC没有用到的属性传递下去

[链接](https://reactjs.org/docs/higher-order-components.html#convention-pass-unrelated-props-through-to-the-wrapped-component)

3. 复制静态方法

因为本来直接暴露的静态方法，被HOC包裹一层后，获取不到。

[链接](https://reactjs.org/docs/higher-order-components.html#static-methods-must-be-copied-over)

4. 不传递Refs

可以使用React.forwardRef来解决

### 总结

总的来说，HOC和render props解决的问题是类似的，关注横向功能点，就是复用逻辑代码。

### 各自的优缺点和取舍

- (参考链接)[https://www.richardkotze.com/coding/hoc-vs-render-props-react]
- (when-to-not-use-render-props)[https://kentcdodds.com/blog/when-to-not-use-render-props]

其实用适用场景来区分比较合适

HOC：

- 支持ES6
- 复用性强，支持链式调用
- 支持传参
- 便于组合
- 便于调试

- 要确保静态方法的复制
- 多个HOC一起使用时，无法直接判断子组件的props是哪个HOC负责传递的
- 多个HOC一起使用时，可能产生同名props
- 可能会产生许多无用组件

render props：

- 支持ES6
- 不会出现props重名问题
- 不会产生无用的组件加深层级
- 改变都在render中触发，更好地利用组件内的生命周期

- 嵌套层级变多后可能难以阅读

总的来说，当横向关注点很多时，HOC better to compose over render props。

但是从讨论和别人的经验来看，似乎对render props更为推崇，

react-router 的作者 Michael Jackson 也是 render props 的极力推崇者。他twitter过一句很有争议的话：

> Next time you think you need a HOC (higher-order component) in @reactjs, you probably don't.

> I can do anything you're doing with your HOC using a regular component with a render prop. Come fight me.

甚至在react-route 4中唯一一个HOC——withRouter，也是用render props来实现的。[传送门](https://github.com/ReactTraining/react-router/blob/master/packages/react-router/modules/withRouter.js)

## 装饰器(@)形式

### 参考阅读

- [Decorator](http://es6.ruanyifeng.com/?search=%E4%BF%AE%E9%A5%B0%E5%99%A8&x=0&y=0#docs/decorator)
- [ES6 系列之我们来聊聊装饰器](https://github.com/mqyqingfeng/Blog/issues/109)

装饰器其实就是普通的函数的简便写法，

```js
@decorator
class A {}

// 等同于

class A {}
A = decorator(A) || A;
```

所以只要编写好修饰器函数，并且在支持修饰器的环境下，就可以使用修饰器来表示HOC了。

```js
// demo.js
import React from 'react';

function addExtraMsg(Component) {
  const C = props => (
    <Component
      {...props}
      extraMsg="some extra msg"
    />
  );

  C.displayName = `addExtraMsg(${Component.displayName || Component.name})`;
  C.WrappedComponent = Component;

  return C;
}

export default addExtraMsg;

// use it
@addExtraMsg
@observer
export default class Index extends Component {
  ...
  ...
}
```

### compose函数

上面讲HOC的时候，突出强调了HOC比较适合组合，这也是render props的缺点，当嵌套过多时，render props容易出现类似“回调地狱”的现象。

而当使用的HOC很多时，如下

```js
withRoute(observer(inject('Store')(Index)))
```

也会变的非常晦涩难懂，而且长，这时候compose函数就发挥了他的优点，可以写成如下：

```js
const enhance = compose(withRoute, observer, inject('Store'));

enhance(Index);
```

#### compose

定义：

> compose(f, g, h) is the same as (...args) => f(g(h(...args)))

来自己实现一个compose

[传送门]()