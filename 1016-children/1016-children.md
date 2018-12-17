## prop.children和react-router的改造

### 场景需求

因为改造原项目，迁移至React，其中菜单部分原来为tab页，类似浏览器的多标签，每个标签内的状态是缓存的，而react-router是不提供这种功能的，（Switch和Route组件，在不匹配路由时会卸载页面，即return null），而官方也觉得这才是正常需求（每次打开都是新状态），所以只能自己做扩展。

### children

在改造过程中，遇到了很多关于children的细节，这是以前不曾注意过的，所以在此记录并做回顾。

```javascript
<Wrapper>
  <Cmp1 />
  <Cmp2 />
</Wrapper>
```

```javascript
// Wrapper.jsx

class Wrapper extends React.Component {
  render() {
    return <div>{this.props.children}</div>
  }
}
```

这样，Wrapper组件只是提供一个容器（正如他的名字所表达的）。

我们可以拿到props.children，自然可以修改它。

比如

```javascript
// WrapperEmpty.jsx

class WrapperEmpty extends React.Component {
  render() {
    return <div>Empty</div>
  }
}
```

那么WrapperEmpty组件提供的功能可能是一个清除内部所有内容的容器（好像并没有实际意义）。

值得一提的是，字符串也是可以直接写的，会被删除行尾空格。

#### 传递函数作为children

能够传递任何的JavaScript表达式作为children，包括函数，这将提供给我们很大的操作权限。

```javascript
class Wrap extends React.Component {
  render() {
    return this.props.children()
  }
}

<Wrap>
  {() => <h1>I am a function</h1>}
</Wrap>
```

自然，复杂的逻辑判断，异步获取数据也是可以实现的。

#### children的一些方法

React的文档描述`children是一个不透明的数据结构`，从上面也看到了，它可能是node，可能是数组，可能是方法，甚至字符串。

那么使用一些数组方法，如map，在有些情况下就不是那么保险，好在React提供了一些列方法：

- 循环：`React.Children.map`，`React.Children.forEach`

以后文会使用的思路做个例子

```javascript
return React.Children.map(children, element => {
  if (!React.isValidElement(element)) return null

  const child = React.cloneElement(element);

  return child
})
```

这个组件只是判断一个children是合法，合法则克隆并返回。

其中还用到了isValidElement和cloneElement方法。

- 计数： `React.Children.count`

```javascript
const isEmptyChildren = children => React.Children.count(children) === 0
```

- 克隆： `React.cloneElement`

```javascript
const cloned = React.cloneElement(element, {
  soneNewProp: 'someNewVal'
})
```

这样就加上了新属性。

当我们可以遍历children，并且克隆后，我们就可以任意地改变它们了， 加上想要的属性。

```javascript
renderChildren() {
  return React.Children.map(this.props.children, child => {
    return React.cloneElement(child, {
      name: 'someName',
    })
  })
}
```

### 改造Route

暂时不考虑Switch，因为Route本身也带有不匹配清除功能，所以从这里入手。

阅读源码会发现这样一部分：

```javascript
<RouterContext.Provider value={props}>
  {children && !isEmptyChildren(children)
    ? children
    : props.match
      ? component
        ? React.createElement(component, props)
        : render
          ? render(props)
          : null
      : null}
</RouterContext.Provider>
```

不看复杂的三元，最后两个null已经很好地说明了会被清除，最好的扩展肯定是改动尽可能少，因为理论上我们的组件只是提供了缓存功能，其他和react-router的表现完全一样。

从代码里看到了children，似乎可以从这入手。因为children && ！isEmptyChildren(children)为true后，是不会走到null里的。

核心代码如下：
```javascript
// CacheRoute.jsx 

return (
  <Route
    {...rest_props}
    children={props => (
      <CacheComponent
        {...props}
        {...{ cacheKey }}
      >
        {cacheLifecycles => 
          {
            Object.assign(props, { cacheLifecycles })

            return React.createElement(component, props)
          }
        }
      </CacheComponent>
    )}
  />
)
```

*12月15日补充：*

遇到缓存失效的问题，查找后定位到`React.createElement`，因为componnet是通过asyncRouter包装的组件，所以每次都会diff判断为新组建，卸载后重新加载！方法就是根据key把component缓存下来。

CacheComponent提供缓存功能，cacheLifecycles是cache的生命周期，剩下的就是把component渲染出来了。

这样改造后，缓存的路由不会卸载，但是我们要让他表现地像消失，所以使用display:none来控制显隐。

在CacheComponent中，先判断是否缓存，如果未缓存，直接return null，否则根据是否匹配，匹配则display，否则display：none

```javascript
// CacheComponent.jsx

render() {
  const { className: behavior__className = '', ...behaviorProps } = value(
    this.props.behavior(!this.state.matched),
    {}
  )
  const { className: props__className = '' } = this.props
  const className = run(`${props__className} ${behavior__className}`, 'trim')

  return this.state.cached ? (
    <div className={hasClassName ? className : undefined} {...behaviorProps}>
      {run(this.props, 'children', this.cacheLifecycles)}
    </div>
  ) : null
}
```

最后只剩下Switch组件的改造，因为只提供缓存类型的（即不可混合使用Route和CacheRoute）所以，继承Switch改造即可，核心代码如下：

```javascript
// CacheSwitch.jsx

return React.Children.map(children, element => {
    if (!React.isValidElement(element)) return null

    const { path: pathProp, exact, strict, sensitive, from } = element.props
    const path = pathProp || from
    const match = MATHED
      ? null
      : matchPath(
          location.pathname,
          { path, exact, strict, sensitive },
          route.match
        )

    const child = React.cloneElement(element, {
      location,
      computedMatch: isNull(match)
        ? { __CacheRoute__computedMatch__null: true }
        : match
    })

    if (!MATHED) {
      MATHED = !!match
    }

    return child
  })
```

代码逻辑比较简单，把每个CacheRoute取出来判断，并且有一个全局的MATHED，默认为false，如果有匹配上则为true，当为true后，后面的不再进行匹配。

值得一提的是，克隆元素时，永远不会进到match为空的情况，不然会return null，所以用一个对象处理。
