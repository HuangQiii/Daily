# React Fiber

## what is React Fiber（React Fiber是什么）
直接上官方原话：
> Fiber is the new reconciliation engine in React 16. Its main goal is to enable incremental rendering of the virtual DOM.

React Fiber是一种新的reconciliation实现。

更具体地来说，一个fiber就是一个JavaScript对象，对象中包含了组件信息和输入输出信息。

其中有一些重要的属性：
- type
- key  
*这两个属性在从element上创建fiber时被直接复制过来*  
在调用期间，这两个属性被用来判断fiber是否能够重用。

- child
- sibling  
这两个属性指向其他的fibers，用来描述递归树的结构。

- return  
处理完当前fibers后返回的fiber。与堆栈帧的返回地址类似。也可以简单地理解为是parent fiber。

- pendingProps & memoizedProps  
相辅相成的两个属性，props函数（组件）的参数。fiber的pendingProps在执行开始时设置，memoizedProps在执行结束时设置。  
如果当输入的pendingProps与memoizedProps相等时，就表示fiber之前的输出可以重复使用，避免了不必要的工作。

- pendingWorkPriority  
fiber的优先级，较大的数字表示较低的优先级。

- alternate
这里存在点理解上的困难，单词本身是轮流的意思，但是我初步觉得可能是表示状态？因为有flush和work-in-progress两种状态，前者表示准备将输出渲染到屏幕上；后者表示暂时还没有完全准备好。

在任一时刻，一个组件实例对多对应两个fibers，分别是flushed fiber，即已经输出的和work-in-process fiber。

- output
React应用程序的叶子节点，是函数的返回值。

每个fiber最终都有输出，但是输出只由host components在叶子节点上创建。然后输出被传输到树上。

输出是最终给呈现程序的，以便它可以刷新对呈现环境的更改。renderer的职责是定义如何创建和更新输出。

至此，我们可以简单地回答下：React Fiber是一个JavaScript对象，用于实现新的reconciliation。

## why is React Fiber（React Fiber是怎么出现的？是为了解决什么问题）
先来看看我们在没有React Fiber的时候遇到了什么问题，所有新技术和新方案的提出必然是为了解决某个问题或者更好地解决某个问题，不然不了解也罢。

我们的应用随着业务的发展变得越来越大，整个更新渲染的过程开始变得吃力，大量的组件渲染会导致主进程长时间被占用，导致一些动画或高频操作出现卡顿和掉帧的情况。

这之中，罪魁祸首就是*同步更新*。

在之前的调度算法(reconciliation，这个词出现了)中，React需要实例化每个类组件，生成一颗组件树，使用*同步递归*的方式进行遍历渲染，而这个过程最大的问题就是无法*暂停和恢复*，当一个加载或者更新过程开始，React就会一值运行到底。

那为什么要这样设计呢？因为更新过程中不会有I/O操作，完全都是CPU的计算，所以好像也挺合理的。

当数据量变大后，问题就出现了。以长列表为例，更新10条20条，用户使用非常流畅，成千上万条，ok，那用户在输入框里的输入甚至都要过很久（等React更新完）才会出现，这就是因为浏览器主线程被React占住了（更新中），而input框的输入内容显示也是浏览器的主线程来做的。

很自然地就想到了操作系统中的一系列调度算法，什么多级反馈论转法啊之类的，把大任务分解成一个个小任务轮转执行。所以解决同步阻塞的办法就是：异步和任务的拆分。

所以React也采用了分片的方式来解决同步操作时间过长的问题。把一个耗时长的任务分成很多小片，每一个小片的运行时间很短，虽然总时间依然很长，但是在每个小片执行完之后，都给其他任务一个执行的机会，这样唯一的线程就不会被独占，其他任务依然有运行的机会。

维护每一个分片的数据结构，就是Fiber。

到这里我们停下来回答下Fiber是什么的问题，React Fiber是一个JavaScript对象，用于实现新的reconciliation，来解决由于同步更新造成的卡顿问题。

## what can it do（React Fiber能解决什么问题或做到什么）
为了能够达成异步分块调度，我们需要：
- 暂停工作，稍后再继续。
- 为不同类型的工作分配优先级。
- 重用以前完成的工作。
- 如果不再需要，则终止工作。

这也是Fiber被创造出来需要解决的点。

从这些功能中，我们也能一窥第一部分中我们列举的部分属性的意义了。

其中任务分割后能够就可以把小任务单元分散到浏览器的空闲期间去排队执行，而实现的关键是两个新API: `requestIdleCallback`与`requestAnimationFrame`。

低优先级的任务交给`requestIdleCallback`处理，这是个浏览器提供的事件循环空闲期的回调函数，需要 pollyfill，而且拥有deadline参数，限制执行事件，以继续切分任务。

高优先级的任务交给`requestAnimationFrame`处理。

## what should i do（为了适应React Fiber我该怎么做）
那么React Fiber的引入，我们需要做什么？

这里还要回过头来讲一讲上面提到的reconciliation。

React的核心流程大致可以分为reconciliation和commit两个部分，前者更新state和props，调用一些组件的生命周期钩子，生成Fiber Tree（以前是virtual dom），然后通过diff算法获取patch。后者根据前面获取的patch判断是否需要进行dom结点的更新。

那为什么不给commit阶段也加上异步渲染呢？因为reconciliation阶段是fiber tree的对比，可以先对比一部分然后暂停去处理某个优先级较高的动画，然后回来继续对比或者重新对比。而commit阶段是dom的更新，为了保证数据和UI的同步，所以不适合再做异步和拆分。

随着reconciliation阶段的重新实现，这个阶段可能会被多次触发（因为在这个阶段可能会被暂停然后重新执行），而这个阶段中包含的生命周期有：

- componentWillMount
- componentWillReceiveProps
- shouldComponentUpdate
- componentWillUpdate

在之前这个函数和componentDidMount可能差距不是很大，在很多情况下混用也能达到相同的效果（当然请求在componentDidMount里发才是正确的选择），所以我们也默认这个生命周期只会执行一遍（以前确实如此），但现在不同了。更好地做法是，不用他，用新的生命周期来替换他。

[新的生命周期](http://projects.wojtekmaj.pl/react-lifecycle-methods-diagram/)

componentWillReceiveProps，即使当前组件不更新，只要父组件更新也会引发这个函数被调用，所以多调用几次没什么问题，可以不做处理。

shouldComponentUpdate，这函数的作用就是返回一个true或者false，不应该有任何副作用，多调用几次也没什么问题。

render，应该是纯函数，多调用几次也可以。

只剩下componentWillMount和componentWillUpdate这两个函数往往包含副作用，其中componentWillMount在上面也着重降到了，所以当使用React Fiber的时候一定要重点看这两个函数的实现。

## 参考
- [react-lifecycle-methods-diagram](http://projects.wojtekmaj.pl/react-lifecycle-methods-diagram/)
- [React Fiber Architecture](https://github.com/acdlite/react-fiber-architecture)
- [React Fiber是什么](https://zhuanlan.zhihu.com/p/26027085)
- [(中篇)中高级前端大厂面试秘籍，寒冬中为您保驾护航，直通大厂](https://juejin.im/post/5c92f499f265da612647b754#heading-3)