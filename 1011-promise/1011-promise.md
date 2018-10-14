## Promise实现探索

Promise相关的面试题层出不穷，随便举个[栗子](https://zhuanlan.zhihu.com/p/30828196).

大部分与Event Loop一起考察，以一堆promise和setTimeout的复合体问输出顺序。

看的多了自然知道Promise的异步属于microtask优先于task执行，但是却没有深究过为什么。

今天就来看看promise的模拟实现。

Promise的实现有很多库，都基于Promise/A+标准，这也是ES6的Promise采用的，有jQuery的deferred，es6-promise，lie。

es6-promise是个非常完整的库，lie的官方文档上有写着一句`lie is a small, performant promise library implementing the Promises/A+ spec (Version 1.1).`，所以从lie来入手学习。

### 断点学习

### scheduleDrain

immediate里面会调一个scheduleDrain，查看源码找到相关部分。

```javascript
var Mutation = global.MutationObserver || global.WebKitMutationObserver;

var scheduleDrain;

{
  if (Mutation) {
    var called = 0;
    var observer = new Mutation(nextTick);
    var element = global.document.createTextNode('');
    observer.observe(element, {
      characterData: true
    });
    scheduleDrain = function () {
      element.data = (called = ++called % 2);
    };
  } else if (!global.setImmediate && typeof global.MessageChannel !== 'undefined') {
    var channel = new global.MessageChannel();
    channel.port1.onmessage = nextTick;
    scheduleDrain = function () {
      channel.port2.postMessage(0);
    };
  } else if ('document' in global && 'onreadystatechange' in global.document.createElement('script')) {
    scheduleDrain = function () {

      // Create a <script> element; its readystatechange event will be fired asynchronously once it is inserted
      // into the document. Do so, thus queuing up the task. Remember to clean up once it's been called.
      var scriptEl = global.document.createElement('script');
      scriptEl.onreadystatechange = function () {
        nextTick();

        scriptEl.onreadystatechange = null;
        scriptEl.parentNode.removeChild(scriptEl);
        scriptEl = null;
      };
      global.document.documentElement.appendChild(scriptEl);
    };
  } else {
    scheduleDrain = function () {
      setTimeout(nextTick, 0);
    };
  }
}
```
先根据环境给scheduleDrain做兼容性判断，可以发现最后啥都不支持的情况下，用的是setTimeout！这从某种程度上也可以解释为什么.then是异步调用的了。

```javascript
if (Mutation) {
  var called = 0;
  var observer = new Mutation(nextTick);
  var element = global.document.createTextNode('');
  observer.observe(element, {
    characterData: true
  });
  scheduleDrain = function () {
    element.data = (called = ++called % 2);
  };
}
```

[MDN](https://developer.mozilla.org/zh-CN/docs/Web/API/MutationObserver)上对`MutationObserver`描述如下`MutationObserver接口提供了监视对DOM树所做更改的能力。它被设计为旧的Mutation Events功能的替代品，该功能是DOM3 Events规范的一部分。`

使用nextTick回调注册一个observer观察者，然后创建一个DOM节点element，成为observer的观察对象，观察它的data属性。当需要执行nextTick函数的时候，就调一下scheduleDrain改变data属性，就会触发观察者的回调nextTick。它是异步执行的，在当前代码单元执行完之后立刻之行，但又是在setTimeout 0之前执行的。

这就解释了promise的运行时间的和顺序了。

### nextTick

```javascript
function nextTick() {
  draining = true;
  var i, oldQueue;
  var len = queue.length;
  while (len) {
    oldQueue = queue;
    queue = [];
    i = -1;
    while (++i < len) {
      oldQueue[i]();
    }
    len = queue.length;
  }
  draining = false;
}
```
这是个顺序执行队列方法的函数。

同步resolve的，是通过MutationObserver/Setimeout 0之类的方式在当前的代码单元执行完之后立刻执行成功回调；而如果是异步resolve的，是先把成功回调放到当前Promise对象的一个队列里面，等到异步结束了执行resolve的时候再用同样的方式在nextTick调用成功回调。

大体如此，具体的断点过程再做补充。