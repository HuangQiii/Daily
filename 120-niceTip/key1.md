## key和diff和优化

### 起因

由于项目中有些数据为前置数据，如要加载用户信息，才能进入首页。那么在请求回来前就需要一个loading，当然loading可以做到首页的逻辑里（确实后来也是这么实现的）。

但是一开始出于不破坏首页（Master）组件的单纯性，把loading单独抽成了组件。

这样当loading时请求数据，这时可能由于各种原因导致请求失败，我们需要给他一个弹窗，而新的弹窗需要一个弹窗容器。

那就会出现这样一个情况，loading和Master有各自的弹窗容器。

我们假设结构就是这样的，如何做优化呢？

### diff算法

React官网上有一章为`Reconciliation`，里面讲到了diff算法和渲染的一些内容，简单来说有如下几点：

> React could rerender the whole app on every action; the end result would be the same. Just to be clear, rerender in this context means calling render for all components, it doesn’t mean React will unmount and remount them. It will only apply the differences following the rules stated in the previous sections.

这段原话翻译过来反而失去了味道，意思是触发了render不代表组件会被卸载，而是其中不同的部分会被更新。

diff算法有如下几点：

- Two elements of different types will produce different trees.
- The developer can hint at which child elements may be stable across different renders with a key prop.

那么可以理解为，当两个elements有相同的types时，

> When comparing two React DOM elements of the same type, React looks at the attributes of both, keeps the same underlying DOM node, and only updates the changed attributes

可以看出，当只有属性变化时，结点还是那个结点(keep the same underlying DOM node)

所以把代码优化为：

```javascript
// Loading

return (
  <div>
    <ModalContainer />
    <LoadingElse />
  </div>
)
```

```javascript
// Master

return (
  <div>
    <ModalContainer />
    <MasterElse />
  </div>
)
```