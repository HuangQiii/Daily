## input的优化

### 问题起因

在敏捷看板中，缺少不了把任务分配到具体的人，所以有一个人物选择框。而由于人数众多，为了更方便地搜索，所以在下拉框中增加了搜索框，根据搜索框的内容去请求api获得新的数据。

一切都很理想，但是投入使用后发现，如果搜索一个人的名字，当开始键入拼音，每输入一个字符就会触发一次onInputChange，然后去请求一次api，即查询明，会发送五次请求，参数分别为m,mi,min,ming,明，而我们需要的只是最后一个，其他的多于请求甚至会对我们的系统产生副作用。

### 解决办法

#### solution1 节流

使用节流的思想，即你尽管触发onInputChange，然后触发请求api的参数，而这个函数有个监听器，在多少时间内不会重复触发，思路非常简单，类似代码如下：

```javascript

onFilterChange(input) {
  if (!filterSign) {
    this.setState({ selectLoading: true });
    // axios.post()
    filterSign = true;
  } else {
    this.debounceFilterChange(input);
  }
}

debounceFilterChange = _.debounce((input) => {
  this.setState({ selectLoading: true });
  // axios.post()
}, 500);

```

优点: 简单直接，lodash的debounce控制函数是否执行。
缺点：时间间隔不好控制，理想的间隔是用户输入完毕，而我们用500ms来做间隔，只能说减少了部分无意义的请求，没有从根本上解决问题。

#### solution2 compositionstart

如何精确地知道用户开始输入，结束输入？

查阅w3c的规范，发现还真有这样的钩子。

> 开始输入法组词的时候浏览器会触发一个compositionstart事件，在输入法组词结束的时候，浏览器会触发compositionend事件。

那么就简单了，（差点就去自己监听键盘事件了。。）只要维护一个变量，在compositionstart时改变，然后在onChange中判断即可。

```javascript

handleInputChange = (event) => {
  const userInputValue = event.target.value
  if (!this.isOnComposition) {
    this.setState({ tempInput: userInputValue })
    event.target.value = userInputValue
    this.props.onInputChange(event)
    this.emittedInput = true
  } else {
    this.setState({ tempInput: userInputValue })
    this.emittedInput = false
  }
}

handleComposition = (event) => {
  if (event.type === 'compositionstart') {
    this.isOnComposition = true
    this.emittedInput = false
  } else if (event.type === 'compositionend') {
    this.isOnComposition = false
    if (!this.emittedInput) {
      this.handleInputChange(event)
    }
  }
}

...

<input
  value={this.state.tempInput}
  onChange={this.handleInputChange}
  onCompositionStart={this.handleComposition}
  onCompositionEnd={this.handleComposition}
/>

```

收工