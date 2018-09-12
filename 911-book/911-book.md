# 实现书本翻页效果（加深对transform的理解和使用）

## 问题描述

实现一个展开的图书，翻页

## 布局实现

当书本打开后，分为左右两部分，已读的归为左部，未读和正在读的归为右部。每一张书页有正反两页。

```
<ul class="pages">
  <li class="paper" data-left>
    <div class="page page-1">
      page-1
    </div>
    <div class="page page-1-back">
      page-1-back
    </div>
  </li>
  <li class="paper" data-right>
    <div class="page page-2-back">
      page-2-back
    </div>
    <div class="page page-2">
      page-2
    </div>
  </li>
  <li class="paper">
    <div class="page page-3-back">
      page-3-back
    </div>
    <div class="page page-3">
      page-3
    </div>
  </li>
</ul>
```

然后通过绝对定位，把位置拜访整齐，其中page-n和page-n-back是重叠在一起的。

然后，把第一页的正页和其他页的背页沿垂直中心轴翻转，使用`transform: scale(-1, 1);`，也可以通过前面关于matrix中算出来的常用值。

然后使显示页更高（贴近屏幕，这样就会遮住后面页），使用`transform-style: preserve-3d;`和`transform: translateZ(1px);`使更‘高’1px。

翻页动画可以简单点写，

```
@keyframes flip-to-left {
  from {
    transform: rotateY(0);
    /* transform: perspective(1000px) rotateY(0); */
  }
  to {
    transform: rotateY(-180deg);
    /* transform: perspective(1000px) rotateY(-180deg); */
  }
}
.paper[data-right] {
  transform-origin: left center;
  animation: flip-to-left 2s ease-in-out;
}
```

其中，perspective是景深，表示视角的距离，这里把视角加在‘舞台元素’上达成相当效果。

## 有关perspective

其中perspective表示透视，透视点在浏览器前方，可以理解为眼前的位置。

当perspective确定时，如果translateZ值越小，元素越小，translateZ越大，元素越大。

但是，当translateZ大于perspective时，元素就会消失，可以理解为视角在眼睛后面，看不见了。

## 代码

翻书的最最最基本[demo](https://github.com/HuangQiii/Daily/blob/master/911-book/book.html)在同级目录下，仅作练手和思路梳理。

## 另

发现使用`transform: scale(1.01);`和`transform: translateZ(0);`时会模糊且抖动（包括里面文字），查找后发现，设置`translateZ`或`will-change`是导致模糊的罪魁祸首，可以通过动画开始的触发点来增加`translateZ`，不动时使用`z-index`。

可通过同目录下的[demo](https://github.com/HuangQiii/Daily/blob/master/911-book/demo.html)测试，demo来自与[此](https://codepen.io/anon/pen/JavXbZ)

