## why use React(Framework)

React确实给我们带来很多便利，但是如果一定要说React（甚至框架）的优点是什么，却似乎有点说不清楚，知其然且知其所以然，才能走得更远。

### 场景

数字选择器

这是一种非常常见的组件，且功能非常单一，从最原始的刀耕火种年代到现代前端开发，感受一下框架到底带来了什么便利，帮我们解决了什么问题。

为了便利，拆分为如下页面，功能类似。

#### version 1

```
<html>
  <body>
    <div class="wrap">
      <button class="add">+</button>
      <button class="subtract">-</button>
      <div class="number">0</div>
    </div>
  </body>
  <script>
    const wrap = document.querySelector('.wrap');
    const addBtn = document.querySelector('.add');
    const subtractBtn = document.querySelector('.subtract');
    const num = document.querySelector('.number');
    
    addBtn.addEventListener('click', function() {
      num.innerHTML = num.innerHTML * 1 + 1;
    }, false);

    subtractBtn.addEventListener('click', function() {
      if (num.innerHTML < 1) return;
      num.innerHTML = num.innerHTML * 1 - 1;
    }, false);
  </script>
</html>
```

注意，这里获取当前值的时候用了读取页面上的值，而没有设置一个跟随变量，是因为，早期的页面，有一种从页面上（或者说从视觉上）获取页面当前状态的习惯，如点击了，加上一个类使目标变色，要提交数据时，根据是否有这个变色类去找这个类。所以这里还原了当时的这种作法。

初始化版本：
```
<script>
    const wrap = document.querySelector('.wrap');
    const addBtn = document.querySelector('.add');
    const subtractBtn = document.querySelector('.subtract');
    const num = document.querySelector('.number');

    let number = 0;
    
    addBtn.addEventListener('click', function() {
      num.innerHTML = ++number;
    }, false);

    subtractBtn.addEventListener('click', function() {
      if (number < 1) return;
      num.innerHTML = --number;
    }, false);
  </script>
```

这里其实已经有点引入数据的意识了，只要数据和视图能够保证同步更新，那么从试图获取数据或当前状态就可以转化为从某个变量获取。

### 场景进化

需求总是不断改变的，任何脱离场景的技术都是假大空。

现在我们这个是一个加减组件了，那必然要考虑到复用。如果我在一个项目的两个页面中使用，该怎么处理？

最简单的方法：copy it。 复制html，复制js。

言多必失，要处理的东西一多也必然会难以维护，项目维护者经过长期迭代后，可能删除了页面上的html，但是留下了js部分，甚至到最后谁都不知道这部分js是做什么的，这必然不是我们所希望的。

#### version2
