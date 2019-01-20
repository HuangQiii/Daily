## 小细节1

### 场景

点开一个a标签，在新窗口打开一个新页面

### 遇到的问题

打开的窗口越来越多，很乱

### 理想

只打开一个窗口，如果这个窗口存在，替换，如果不存在，则打开。

### 解决方案

a标签没有什么特殊属性，不优先考虑js控制。

查阅资料发现，target的属性

- _blank

- _self

- _parent

- _top

- framename

除了最后一个都是_开头的，framename的解释是在指定的框架中打开被链接文档。

解释的很晦涩。。

写一写测试

```html
<ul>
  <li><a href="https://www.baidu.com/" target="tagetWindow">0</a></li>
  <li><a href="https://www.baidu.com/" target="tagetWindow">1</a></li>
  <li><a href="https://www.baidu.com/" target="tagetWindow">2</a></li>
  <li><a href="https://www.baidu.com/" target="tagetWindow"></a></li>
</ul>
```

完美！要的就是这个效果，解决。