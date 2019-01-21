生成一个自增的id

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