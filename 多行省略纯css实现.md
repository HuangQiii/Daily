```html
<html>
  <head>
    <style>
      .wrap {
        height: 40px;
        line-height: 20px;
        overflow: hidden;
      }
      .wrap .text {
        float: right;
        margin-left: -5px;
        width: 100%;
        word-break: break-all;
      }
      .wrap::before {
        float: left;
        width: 5px;
        content: '';
        height: 40px;
      }
      .wrap::after {
        float: right;
        content: "...";
        text-align: right;
        height: 20px;
        line-height: 20px;
        width: 3em;
        margin-left: -3em;
        position: relative;
        left: 100%;
        top: -20px;
        padding-right: 5px;
        background: linear-gradient(to right, rgba(255, 255, 255, 0), white 50%, white);
      }
    </style>
  </head>
<body>
  <div class="wrap">
    <div class="text">上面的 root.error 和 root.warn 就分别是 ERROR 和WARNING 级别的日志。一般来说，我们使用 ERROR（错误）、WARNING（警告）、INFO（信息）、DEBUG（调试信息）等名词来定义日志级别，优先级由高到低，然后我们在配置文件里配置一个最低打印优先级，低于这个优先级的日志都会被忽略不会打印，比如：</div>
  </div>

  <div class="wrap">
    <div class="text">The roles are ordered according to overlapping skills. A front-end developer will typically have a good handle on UI/Interaction design as well as back-end development. It is not uncommon for team members to fill more than one role by taking on the responsibilities of an over-lapping role.</div>
  </div>
</body>
</html>
```