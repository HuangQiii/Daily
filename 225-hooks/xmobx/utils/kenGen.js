const prefixCls = 'ob-';

const KeyGen = function* (id) {
  while (true) {
    yield `${prefixCls}-${id++}`;
  }
}(1);

export default function getKey() {
  return KeyGen.next().value;
}
