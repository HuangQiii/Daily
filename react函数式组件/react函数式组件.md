# React函数式组件

今天被面试官问起关于函数式组件相关的内容，尤其是问到函数式组件的缺点时，着实让我懵了小一会，平时对比函数式组件和类组件，看到的都是前者的好，这也说明我对这两者的理解不是那么透彻，特此记录这篇随记，并且随着日后的理解加深来完善。

*以下内容只做当前认知的记录，可能存在部分错误或者偏差，待参考学习和日后开发体会后进行修正。*

## 什么是函数式组件

在[官网](https://reactjs.org/docs/hooks-state.html#hooks-and-function-components)的这个章节可以看到，函数式组件有普通函数和ES6箭头函数两种写法，其中参数都是props。

下面有一段说明非常精髓：

> You might have previously known these as “stateless components”. We’re now introducing the ability to use React state from these, so we prefer the name “function components”.

翻译过来大概来说就是：您以前可能知道这些组件是“无状态组件”。我们现在引入了使用React状态的功能，所以我们更喜欢“函数组件”这个名称。

其中，引入了React状态的功能，指的就是React Hooks。反过来推导，以前的无状态组件和函数组件是同一个东西，这也就引出了他的特性+无状态。

## 函数式组件的特性

1. 无状态

2. 无生命周期方法

3. 无this

所以，在之前，函数式组件更多地被用来当作展示性组件（presentational component）：只是单纯地接受props并且展示内容。

（当然一切在和React Hooks结合后就变得有点不同了）

## 函数式组件的优点

从上面可以看到，

1. 函数式组件没有this，没有生命周期的方式，所以单从组件内部来看，组件本身更加简单和明确
2. 编译后的代码来看，体积更小
3. 更强调视图和业务逻辑的分离，易于维护
4. React Hooks只能在函数式组件中使用，可以预见，未来函数式组件的使用会更加广泛，可以说是一种“时髦的尝试”

## 函数式组件的缺点

其实换过来想，函数式组件因为没有生命周期，也就没有了shouldComponentUpdate，那么如果编写不当，可能反而会导致过多无用地重绘，因为它没法判断是否需要重新绘制组件，组件本身是个函数就都会执行。

## 怎么在函数组件上做‘shouldComponentUpdate’

1. 使用高阶函数或容器函数做逻辑与展示的分离
在外包组件（类组件）上，使用shouldComponentUpdate进行一系列的判断

2. 使用Hooks中的useMemo等
Hooks中的useMemo，useCallback，useEffect的第二个参数，都是明确依赖的，可以减少重绘时某些“昂贵操作”的消耗

3. 合理地规范传入的props，从根本上减少不必要地渲染