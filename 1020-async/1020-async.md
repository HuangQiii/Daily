## 异步解决方案

众所周知，JavaScript是单线程语言，意味着在某个特定的时刻只有特定的代码能够被执行，并阻塞其它的代码，但是有些操作非常耗时，比如相应请求，我们不能一直在那等着，那在网络不好的情况下，用户等不及看到你的首页就把页面关闭了。

所以我们要先做别的事，当异步事件执行完毕，再去触发相应操作。

所以列举常用的异步解决方案，一来了解一下异步解决方案的“进化”过程，二来了解他们的各自优缺点和局限性。

### Callback
最早的解决方法，当事件完成后执行回调函数，相当于完成异步操作。把变量当作函数的数，传递的是函数的定义，在异步事件完成后调用它。

在回调嵌套不多的情况下，这种方式不失为一种可读性不错的解决办法。

```javascript
// callback

function funWhenAsyncIsSuccess() {
  window.console.log('success!');
}

function asyncFun(callback) {
  setTimeout(funciton() {
    callback();
  }, 1000)
}

asynCFun(funWhenAsyncIsSuccess);
```

但是可以想象的是，当多个异步事务依赖时，回调函数会形成多级的嵌套，形成也就是所谓的回调地狱，使阅读和修改变的困难。

所以一直在追求一种，用同步的思维写异步的方式，这样才能使代码易读易改而且符合思维方式。

### Promise

```javascript
// promise
axios.get('url')
  .then(res => {
    // do something
  })
  .then(res => {
    // do other thing
  })
  .catch(error => {
    // show error if something wrong
  })
```

很多请求库（如axios，fetch）都支持promise，从上面可以看出，promise是一种非常优雅且强大的解决方案，

- 代码看起来更加符合逻辑,因为我们习惯从上到下读代码，而不是跳着读

- 可读性更强，相关操作都在同一个地方

- 链式调用，错误冒泡

但是promise并没有改变js异步执行的本质，从写法上也还能看到callback的影子。

```javascript
// promise

new Promise(resolve => {
    console.log(1);
    resolve(3);
}).then(num => {
    console.log(num)
});
console.log(2);
```

如上，在new Promise()中调用resolve()去触发then中的逻辑，和在异步操作完成后触发callback是不是有点类似呢？

我们还是在追求以同步方式写异步代码，可以使逻辑更加清晰，代码量减少更多。所以出现了generator解决方案。

### Generator

```javascript
// generator

function* gen() {
  var result = yield axios('url');
  console.log(result);
}

const gen = gen();
const result = gen.next();
result
  .then(res => {
    return res.json();
  })
  .then(data => {
    gen.next(data);
  })
```

通过不断的释放和获得控制权，执行异步操作。

```javascript
// generator

try {
  gen1 = yield axios('url1');
  gen2 = yield axios('url2');
  success(gen2);
} catch (error) {
  // handle err
}
```

Generator需要一个自动执行器配合使用，实现正常思维下的异步处理，有了自动执行器，异步请求可以用同步的方式写异步代码，直接将请求全部写在一起。

缺点很明显了，理解难度变大了，而且需要一个自动执行器来配合使用。

### Async/Await

本质上来讲，async/await可以说是generator的语法糖，内置了自动执行器。

改造一下上面的例子：

```javascript
// async/await

async function getRes() {
  try {
    res = await axios('url1');
    res = await axios('url2');
    return res;
  } catch (error) {
    // handle error
  }
}
```

- await只能在async函数中使用
- await后面必须是一个Promise对象，如果不是会被转化为一个已完成状态的Promise