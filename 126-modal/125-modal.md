## modal

这篇是对封装完modal后的一个记录，其中，通过方法唤起，动画处理，portals都是第一次接触的知识点。

其中对获取自增的id有个让人眼前一亮的方法：

```javascript
const KeyGen = function* (id) {
  while (true) {
    yield `${prefixCls}-${id++}`;
  }
}(1);

export function getKey(): string {
  return KeyGen.next().value;
}
```