## React element和type

从来没有在意过以下两者的区别

```js
import Button from 'ui/button';
```

如果在代码里`Button`和`<Button />`的区别。

导致在一次使用时，要根据字符串类型的组件返回组件时，直接`return map[str]`导致出错。

其实说简单也很简单，Button是type，而<Button />是一个React element。

最后的解决方法是用createElement来返回一下，从官方的描述可以看出

```js
React.createElement(
  type,
  [props],
  [...children]
)
```

> Create and return a new React element of the given type. The type argument can be either a tag name string (such as 'div' or 'span'), a React component type (a class or a function), or a React fragment type.

> Code written with JSX will be converted to use React.createElement(). You will not typically invoke React.createElement() directly if you are using JSX. 

上面有几个关键字，a React component type (a class or a function)，a new React element，其实就很明确地说明了问题。

而且当我们写JSX时，其实自动调用了这个方法生成了React elements，也就是说，渲染的是React element。

题外话：

```js
React.cloneElement(
  element,
  [props],
  [...children]
)
```

可以发现cloneElement接受的是element而不是type