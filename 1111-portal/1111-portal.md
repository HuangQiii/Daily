## Portal

### 问题

组件开发过程中，经常会遇到类似弹出层（浮层）的场景，比如弹出框，下拉框，日期选择框，他们都有一个特点，是脱离当前结构的（如果不这样做，当外层元素设置overflow: hidden后，就会显示出现问题），所以一般渲染到与react根节点同级的一个结点上。

### 渲染到外层

```javascript

...

export function getContainer() {
  if (!modalContainer || !modalContainer.offsetParent) {
    const doc = window.document;
    modalContainer = doc.createElement('div');
    modalContainer.className = `${prefixCls}-container`;
    doc.body.appendChild(modalContainer);
    containerInstanse = render(<ModalContainer />, modalContainer);
  }
  return containerInstanse;
}

export function open(props: ModalProps & { children }) {
  const container = getContainer();

  async function close() {
    const { destroyOnClose, onClose = noop } = props;
    if (await onClose() !== false) {
      if (destroyOnClose) {
        container.close(props);
      } else {
        container.hide(props);
      }
    }
  }

  function show() {
    if (container.exist(props)) {
      container.show(props);
    } else {
      container.open(props);
    }
  }

  props = {
    close,
    ...Modal.defaultProps,
    ...props,
  };
  container.open(props);

  return {
    close,
    open: show,
  };
}

```

从getContainer中可以看出，如果不存在组件实例，就创建一个div元素插入body标签（和react根节点同级），然后调用ReactDOM.render渲染组件。

这样，当调用open方法后，会创建一个新的“图层”用来管理Modal弹出框。

效果如图：

从图中可以看到，确实按要求渲染了，但是，从React的角度看，他们是分开的，这样他们就无法共享context，一些事件冒泡也无法触发。

所以我们要找一种，在React的树内，渲染在别的层的方法。

### Portal

> Portals provide a first-class way to render children into a DOM node that exists outside the DOM hierarchy of the parent component.

从描述上看，完全符合我们的需求。

ReactDOM.createPortal(child, container)

The first argument (child) is any renderable React child, such as an element, string, or fragment. The second argument (container) is a DOM element.

看看React官网中的一段使用场景，

> A typical use case for portals is when a parent component has an overflow: hidden or z-index style, but you need the child to visually “break out” of its container. For example, dialogs, hovercards, and tooltips.

> Even though a portal can be anywhere in the DOM tree, it behaves like a normal React child in every other way. Features like context work exactly the same regardless of whether the child is a portal, as the portal still exists in the React tree regardless of position in the DOM tree.

使用也非常方便，那么就来改变原来的代码。

```javascript

let withoutWrap;

...

render() {
  if (withoutWrap) {
    return this.getComponent();
  }
  const portalObj = ReactDOM.createPortal(
    this.getComponent(),
    getContainer(),
  );
  containerInstanse = portalObj.children._owner.stateNode;
  return portalObj;
}

export function getContainer(withoutWrap = false) {
  withoutWrap = withoutWrap;
  if (!modalContainer || !modalContainer.offsetParent) {
    const doc = window.document;
    modalContainer = doc.createElement('div');
    modalContainer.className = `${prefixCls}-container`;
    doc.body.appendChild(modalContainer);
    if (!!withoutWrap) {
      containerInstanse = ReactDOM.render(<ModalContainer />, modalContainer);
      return containerInstanse;
    }
  }
  return modalContainer;
}

```

这样就可以达成我们的要求，渲染在非React根节点上，却是在同一颗树下的，可以获得context。
