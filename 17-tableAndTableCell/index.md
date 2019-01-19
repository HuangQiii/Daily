## display: table 和 table-cell

### 起因

在开发数据建模的过程中，有一个关联图表（其实就是一个树状图表），有如下要求：

1. 在图表结点不多时，即无滚动条时，水平垂直剧中

2. 图表结点很多时，出现了滚动条，如何显示不限制，但不能导致部分看不见（咦，为什么会看不见，下面来看...

### 第一版

水平垂直剧中，简单啊，flex，设置一下align-items和justify-content就可以轻松搞定，看一下效果，非常美好。

但是当结点变多时，虽然也会出现滚动条(overflow: 'auto')，但是发现总有一些顶上的部分是看不到的，因为，设置了居中以后外面的wrap和内部的结点的中心点是重合的，那多出来的部分就超出去了。

查阅了各种垂直居中的方式，因为水平居中相对是比较容易的，使用了trasform等和绝对定位尝试都失败后，把注意力放到table上。

### 第二版

上一个简单的demo

```
<html>
  <style>
    * {
      margin:0;
      padding:0;
    }

    html {
      height: 100%;
    }

    button {
      padding: 5px 10px;
      position: absolute;
      bottom: 20px;
      left:20px;
      display: block;
    }

    body {
    display: table;
    width: 100%;
    height: 100%;
  }

  .box {
    display:table-cell;
    vertical-align: middle;
    text-align: center;
  }
  </style>
  <body>
    <button>Add</button>
    <div class="box">
        <p>Origin Line</p>
        <p>Origin Line</p>
    </div>
  </body>
  <script>
    document.querySelector("button").addEventListener("click", function(){
      var element = document.createElement("p");
      element.innerText = "New Line";
    document.querySelector(".box").appendChild(element);
  });
  </script>
</html>
```

这就满足了，初始居中，当结点过多时，出现滚动条。

其中使用了text-align: center配合inline达到水平居中，使用table-cell实现垂直居中。

其中text-align有个优点也有个缺点，优点是写在哪一层都行，因为会传递下去。

缺点就是传递下去导致结点内部都是水平居中，要通过下一层的text-align: left覆盖为默认样式。