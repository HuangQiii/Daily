# 由逆时针进度条展开的关羽matrix的学习

## 问题描述

需要实现如下一个圆环, 组件库提供的Progress组件为顺时针, 设计要求逆时针, 记录一下解决过程和学习经过。

## 用svg写圆环

```
<svg width="220" height="220" viewbox="0 0 220 220">
    <circle cx="110" cy="110" r="50" stroke-width="5" stroke="#D1D3D7" fill="none"></circle>
</svg>
```

cx, cy, r, stroke-width, stroke分别为圆心x, y坐标，半径，圆环宽度，圆环颜色。

![matrix_1](./screenshot/matrix_1.png)

那进度条圆环，可以理解为一个有色环盖在底环之上。

```
<svg width="220" height="220" viewbox="0 0 220 220">
    <circle cx="110" cy="110" r="50" stroke-width="5" stroke="rgba(255, 177, 0, 0.3)" fill="none"></circle>
    <circle cx="110" cy="110" r="50" stroke-width="5" stroke="#fab614" fill="none" stroke-dasharray="14 300"></circle>
</svg>
```

其中stroke-dasharray是两个和为C的数值, C = Math.PI * 2 * r。

表示进度的占比。

![matrix_2](./screenshot/matrix_2.png)

### 重要属性

`transform="matrix(0, -1, 1, 0, 0, 220)"`

从上面的代码可以看出，圆环的起始点是水平方向，一般进度条是从垂直方向起，顺时针，所以加上如上属性

至此，常规进度条完成。


![matrix_3](./screenshot/matrix_3.png)

那么为了完成逆时针，即有色圆环进行一次镜像转化，把注意力放到transform上。

## transform

transform: matrix(a, b, c, d, e, f)

- 偏移: transform: translate(30px, 30px); `等效于` transform: matrix(a, b, c, d, 水平偏移距离(30px), 垂直偏移距离(30px));

- 缩放: matrix(sx, 0, 0, sy, 0, 0); `等效于` scale(sx, sy)

- 旋转: transform:rotate(θdeg) `等效于` matrix(cosθ,sinθ,-sinθ,cosθ,0,0)

- 拉伸: skew(θx + "deg", θy+ "deg") `等效于` matrix(1,tan(θy),tan(θx),1,0,0)

## matrix的作用

如上，所有的matrix的单操作都有对应的（甚至更简单的）对应，那matrix有什么用？

`镜像对称`

对称轴： y = k * x

已知(x, y), 求对称点(x', y')，可得：

a = (1-k*k)/(k*k+1);

b = 2k/(k*k+1);

c = 2k/(k*k+1);

d = (k*k-1)/(k*k+1);

那么上面的问题，就是沿y = -x的轴进行镜像对称

`补充，x轴水平，正方向向右，y轴锥齿在，正方向向下！就是这个导致一开始无法理解取负。`

代入公式，matrix(0, -1, -1, 0, 220, 220)

![matrix_4](./screenshot/matrix_4.png)

## 常用的

y轴镜像  y = 无穷大 x

matrix(-1, 0, 0, 1, 0, 0)