## js的异常处理

本篇的起因是对Rxjs的学习时，Rxjs的一些操作符（如catch, retry, retryWhen）对异常的处理和使用场景的思考，引发的原声js的异常处理的对比和总结。

### 异常处理的重要性

日常代码中，比较会考虑到的就是promise发请求，往往会在最后跟一个catch用来处理一些特殊情况，比如断网，服务器坏了之类的而返回了非常规数据；又比如对undefined读取属性，常见于a.b.c的类似表达中；抑或是对不存在的变量的方法调用，如a.forEach()，而a由于某些原因变成了非数组。

1. try-catch

在大部分语言中都有，语义非常明确

```javascript
try {
  // do something may occuer error
} catch (err) {
  // catch error and do something
}
```

2. try-catch的缺点

如果try-catch可以覆盖所有场景，对js的异常处理就没有特别讨论的必要了，但是现实并非如此。try-catch有如下不足

- 代码冗余，可以很明显地看出，当可能抛错的代码段增加后，代码结构会变得更臃肿

- try-catch只支持同步运算

看下面这个例子，

```javascript
try {
  setTimeout(() => {
    throw new Error('error');
  }, 1000);
} catch (err) {
  console.log('catch err');
}
```

上面的例子，try-catch完全没有发挥作用，因为它捕获不到异步的错误。

3. 如何解决异步的异常处理

那遇到上面的情况，可以使用回调函数来处理，一说起回调函数，总会让人想起回调地狱，但这不是重点。

```javascript
function func(value, callback) {
  setTimeout(() => {
    try {
      const res = value;
      callback(null, res);
    } catch (err) {
      callback(err);
    }
  }, 1000);
}


func('res', (error, result) => {
  if (error) {
    console.log('catch error');
    returnl
  } else {
    console.log(result);
  }
});
```

当只有一个的时候，这种方式看起来甚至有点经验，但是当代码的嵌套层级变多时，这简直就是回调地狱。

4. promise类型的一步处理

又回到了promise，promise是异步的这点自不必说，这解决了上面的2，promise的catch可以处理所有的错误，这解决了上面的3的问题。

因为链式调用过程中，产生的任何错误异常都会沿着调用顺序往下游传递，直到遇到第一个catch，所以往往可以在最后使用一个catch来捕获多个then产生的异常。

看上去已经完美了，但在实际项目中，promise无法重试的缺点被放大了。

出于设计考虑，promise的状态一旦进入成功或失败就无法改变，这本是一个简单而且有效的设计，但是现实生活中，往往会有第一次失败后进行几次重试的需求。

当然我们可以写个计数器去计算，手动调用，但是对通用需求来说显得然人无法接受。

5. rxjs的处理

上面所列举的异常处理都不适合rxjs！为什么呢？因为在函数式编程中，每个函数都应该是纯函数，而一个函数可以抛出一个异常，等于增加了一个新的函数出口。

在rxjs中，异常和数据一样沿着数据流管道从上游流向下游，可以经过过滤类和转化类操作符，最后触发error方法。而且错误只存在自己所处的数据流管道，不会像try-catch一样影响全局。

rxjs中的异常处理分为两类：

- 恢复，catch

- 重试，retry，retryWhen

重试很直观了，恢复的意思可以简单的理解为当抛出错误时，用一个默认值让程序正常运行下去。

具体的不再展开，可以对比两者的思想上的区别和相同。