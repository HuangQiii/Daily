## web性能优化

开个大坑，性能优化有很多“军规”，但是很多都是流于表面（对我来说，知道这样可以优化，但是用到项目里具体怎么用，怎么看效果却知之甚少）。

不过这篇文章还是不打算讲怎么用！更多的是讲一些使用场景和怎么观察效果。单纯是为了记录看到的不熟悉的一些技术和术语。

> Web 性能除了通用编程最佳实践之外，你应该期望访问者查看你的代码或设计及其性能影响。它曾经足以将 CSS 置于文档的顶部，而 JS 脚本位于页面底部，但 Web 正在快速移动，你应该熟悉这个领域的复杂性。

- 关键渲染路径；
- Service Worker；
- 图像优化；
- 延迟加载和捆绑拆分；
- HTTP/2 和服务器推送的一般含义；
- 何时预取和预加载资源；
- 减少浏览器回流以及何时将元素提升到 GPU；
- 浏览器布局、组合和绘制之间的区别

*由于本篇涉及的内容很多，所以参考链接放在每个章节内部*

### 关键渲染路径

#### 参考阅读

- [以通俗的方式理解关键渲染路径](https://segmentfault.com/a/1190000008984446#articleHeader3)
- [Critical Rendering Path ](https://developers.google.com/web/fundamentals/performance/critical-rendering-path/)

由于很多基础概念和细节在一些文章中讲的甚是详细，下面就以面试的表达形式来说。

#### 什么是关键渲染路径

关键渲染路径（CRP)就是浏览器从开始请求到首次渲染内容到屏幕上所作的事。其中可以拆分理解为关键+渲染路径，关键就是强调首屏渲染的概念。

CRP包括本地加载渲染和网络请求两部分。

CRP包括几个关键的时间点：

- domLoading：CRP起点
- domInteractive：DOM树构建完毕
- domContentLoaded： DOM树构建完毕且没有任何样式阻塞脚本运行
- domCompelete：全部完成，包括图片字体等

#### *怎么观察CRP*

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="stylesheet" href="https://cdn.bootcss.com/twitter-bootstrap/4.3.1/css/bootstrap-grid.css">
  
  <title>Test</title>
</head>
<body>
  <div>
    <figure>
      <img id="emma" src="http://photocdn.sohu.com/20150227/Img409195726.jpg" alt="emma">
      <figcaption>Emma.Watson</figcaption>
    </figure>
    <button id="switch">Switch</button>
  </div>
  <script src="https://cdn.bootcss.com/jquery/3.3.1/jquery.js"></script>
</body>
</html>
```

使用的全是网络链接和CDN，不需要改动，直接复制过去在浏览器中打开，点开DevTools中的Performance，刷新页面，会得到如下的图

![pic1](./pic1.png)

其中蓝线表示DOMContentLoaded，红线表示onload。

大体过程如下：

![pic2](./pic2.png)

其中DOM树的解析会被JS给阻塞这是大家都知道的，而CSS的加载也会阻塞JS的执行，所以当CSS和JS请求和执行时，DOM的构建会被阻塞。

#### 优化CRP就是尽快使DOMContentLoaded发生

因为DOMContentLoaded了之后，就会开始触发FCP和FMP，图一中的绿色，表示有内容出来了。其实更详细地说，就是RenderTree开始构建了。

所以有如下几个比较实用的方法：

1. 减少脚本数量：因为每次脚本请求，浏览器都会等待响应，更不用说脚本的解析
2. 把JS放在HTML最后，使用async属性，这会告诉浏览器不阻塞这里继续构建DOM。`注意：`使用defer，在浏览器中是先触发defer再触发DOMContentLoaded的，所以从我的理解来看，对优化CRP没有帮助
3. 将样式放在head内尽可能早地加载，除非是没有js的页面（基本不存在）

其实这样看下来，这些建议也就是一些所谓的”金科玉律“，但是这样反着看上去，似乎一切都变的更加详细清晰了。

### 延迟加载

### 预加载

### 将元素提升至GPU
