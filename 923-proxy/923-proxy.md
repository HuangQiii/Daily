# 了解proxy和使用proxy实现简单的immer和数据监听

## proxy

Proxy原意为代理，可以修改某些操作的默认行为，属于`meta programming`，可以拦截对象的访问。

> Proxy代理一个**对象**，返回一个Proxy实例。

最常见的形式如下：

```
var obj = new Proxy({}, {
  get: function (target, key, receiver) {
    console.log(`getting ${key}!`);
    return Reflect.get(target, key, receiver);
  },
  set: function (target, key, value, receiver) {
    console.log(`setting ${key}!`);
    return Reflect.set(target, key, value, receiver);
  }
});
```

其中get是代理.或者[]操作符，如obj.name和obj[name]

类似的还有很多，如函数的执行，私有属性的判断等。

详见[此](http://es6.ruanyifeng.com/#docs/proxy)

## 用处

从Label编译可以看出，Proxy和`defineProperty`有部分相似。

那么，Proxy到底可以做什么，带来什么便利呢？

### [immer](https://github.com/mweststrate/immer)

`immer`是一个解决`数据不可变`的库，和`immutable-js`类似，但是使用的是原生的方法，这相对immutable的复杂写法来说，简直是太神奇方便了，他是更接近底层的一种编写，下面尝试用Proxy写个简化版本immer。

先来看看如何使用：

```
produce(obj, draft => {
  draft.count++
})
```

对象还是那个普通的对象，那一定是immer对draft对象进行了监听。

所以，draft 是 obj 的代理，对 draft mutable 的修改都会流入到自定义 setter 函数，它并不修改原始对象的值，而是递归父级不断浅拷贝，最终返回新的顶层对象，作为 produce 函数的返回值。
