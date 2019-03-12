## css加载阻塞渲染

大家可能或多或少都从一些经验之谈上得到过如下结论：

1. js的执行会阻塞DOM树的解析和渲染
2. css的加载会阻塞DOM树的渲染

脑子里凭空一想，应该是这么回事，甚至还能分析一波，但是如果反问自己一句，有什么证据吗？好像就不知如何表达。

今天就用事实来验证一下。

*注意调慢网络速度，但是不能断网！*

```html
<html>
  <head>
    <style>
      body {
        background: tan !important;
        display: flex;
        justify-content: center;
        align-items: center;
      }
      body div {
        color: lightyellow;
        font-size: 24px;
      }
    </style>
    <script>
      function fun() {
        const h = document.querySelectorAll('div');
        console.log(h);
      }
      setTimeout(fun, 0)
    </script>
    <link href="https://cdn.bootcss.com/bootstrap/4.0.0-alpha.6/css/bootstrap.css" rel="stylesheet">
  </head>
  <body>
    <div>test space</div>
  </body>
</html>
```

如果css的加载会阻塞DOM树的解析和渲染，那么一开始页面应该是白屏，等到css加载成功后，页面才显示出来。并且此时控制台输出的应该是一个空数组。

但是经过测试发现，控制台输出永远不是空数组，至少在加载css时，DOM树已经解析完成了。

所以这里得出第一个结论： `css的加载不会阻塞DOM树的解析`。

而且当第一次打开页面时，（注意一定是第一次，第二三四次是观察不到的），页面是白屏，等css加载完毕后！页面才会有样式！

所以得出第二个结论： `css的加载会阻塞DOM树的渲染！`。