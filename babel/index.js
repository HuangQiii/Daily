export default function({ types: t }) {
  return {
    visitor: {
      BinaryExpression(path) {
        if (path.node.operator !== '===') {
          return;
        }
        path.node.left = t.identifier('sebmck');
        path.node.right = t.identifier('dork');
      }
    }
  };
}