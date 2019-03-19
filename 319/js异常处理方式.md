## js异常处理方式

### js执行特点

- 异常不会直接导致js引擎崩溃，最多只是终止当前执行的任务

1. 当前代码块将作为一个任务压入任务队列中，JS 线程会不断地从任务队列中提取任务执行。
2. 当任务执行过程中出现异常，且异常没有捕获处理，则会一直沿着调用栈一层层向外抛出，最终终止当前任务的执行。
3. JS 线程会继续从任务队列中提取下一个任务继续执行。

比较常见的错误：

Uncaught ReferenceError和Uncaught SyntaxError

所以一般错误分为两种：

- 语法错误：拼写等错误，在代码开发中比较容易发现
- 运行时错误：不容易在开发时发现

### try-catch

直接上结论，try-catch是比较常见的用于处理异常的方式，只能捕获捉到`运行时非异步`错误，无法捕捉语法错误和异步错误。

```js
// 运行时报错（可以捕捉）

try {
  error    // 未定义变量 
} catch(e) {
  console.log('我知道错误了');
  console.log(e);
}
```

```js
// 语法错误（捕捉不到）

try {
  var error = 'error'；   // 大写分号
} catch(e) {
  console.log('我感知不到错误');
  console.log(e);
}
```

```js
// 异步错误（捕捉不到）

try {
  setTimeout(() => {
    error        // 异步错误
  })
} catch(e) {
  console.log('我感知不到错误');
  console.log(e);
}
```

### window.onerror

可以捕获绝大部分错误，除了请求错误资源的网络请求和promise错误。

```js
window.onerror = function (msg, url, row, col, error) {
  console.log('caught error');
  console.log({
    msg,  url,  row, col, error
  })
  return true;  // return true才不会向外抛出错误
};
```

```js
// caught
error
```

```js
// caught
var error = 'error'；
```

```js
// caught
setTimeout(() => {
    error;
  })
```

### addEventListener-error

```html
<!--can not caught-->
<img src="./404.png" />
```

网络请求异常不会事件冒泡，所以要在捕获阶段将其捕捉到才行。

```js
window.addEventListener('error', (msg, url, row, col, error) => {
  console.log('caught 404 error');
  console.log(
    msg, url, row, col, error
  );
  return true;
}, true);
```

### promise catch

```js
window.addEventListener("unhandledrejection", function(e){
  e.preventDefault()
  console.log('caught promise error');
  console.log(e.reason);
  return true;
});
```

```js
// 测试代码
Promise.reject('promise error');
new Promise((resolve, reject) => {
  reject('promise error');
});
new Promise((resolve) => {
  resolve();
}).then(() => {
  throw 'promise error'
});
```

参考：
- [前端代码异常监控实战](https://zhuanlan.zhihu.com/p/31979395)
- [脚本错误量极致优化-监控上报与Script error](https://github.com/joeyguo/blog/issues/13)
- [前端代码异常日志收集与监控](http://www.cnblogs.com/hustskyking/p/fe-monitor.html)
- [前端魔法堂——异常不仅仅是try/catch](http://www.cnblogs.com/fsjohnhuang/p/7685144.html)
- [前端魔法堂——调用栈，异常实例中的宝藏](https://www.cnblogs.com/fsjohnhuang/p/7729527.html)

疑惑：

v8不会优化try-catch，那async和await怎么写?