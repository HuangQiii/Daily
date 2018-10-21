## 异步解决方案

### Callback
最早的解决方法，当事件完成后执行回调函数，相当于完成异步操作。把变量当作函数的数，传递的是函数的定义，在异步事件完成后调用它。

在回调嵌套不多的情况下，这种方式不失为一种可读性不错的解决办法。

```javascript
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

### Promise

### Generator

### Async/Await