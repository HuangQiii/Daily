function getPathById(id, tree, cb, noMatchCb = () => { }) {
  const path = [];
  let targetNode;
  try {
    function getNodePath(node) {
      path.push(node.id);

      if (node.id === id) {
        targetNode = node;
        throw ('Get Target Node!');
      }
      if (node.children && node.children.length > 0) {
        for (let i = 0; i < node.children.length; i++) {
          getNodePath(node.children[i]);
        }
        path.pop();
      } else {
        path.pop();
      }
    }

    tree.forEach(v => getNodePath(v));
    noMatchCb();
  } catch (e) {
    cb(path, targetNode);
  }
}