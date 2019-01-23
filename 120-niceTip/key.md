## 小细节3

### 场景

要给一个页面（组件）实现刷新功能

### 遇到的问题

都是一些比较硬核的方法，比如关掉页面再打开页面。再比如用一个变量表示，在render里控制为null

### 理想

用户感知不到页面的卸载，只是发生一些简单的loading交互。

### 解决方案

源于华真哥的一个提醒，key

一种醍醐灌顶的感觉！看过那么多次React的diff算法，也知道key是一个减少re-render的标志，那强行改变key必然会造成re-render！

伪代码如下：

```javascript
state = {
  key: Date.now(),
};

handleRefresh() {
  this.setState({ key: Date.now() });
}

render() {
  const { key } = this.state;
  return (
    <div key={key}>
      hello key
    </div>
  );
}
```