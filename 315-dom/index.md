## DOM相关操作

看到David Shariff的文章，其中有一个章节是讲DOM的：

> 知道如何遍历和操作 DOM 非常重要，对于重度依赖 jQuery 或者开发了很多 React & Angular 类型应用程序的候选人来说，他们可能会在这个问题上栽跟斗。你可能不会每天都直接接触 DOM，因为我们大多数人都在使用各种抽象。在不使用第三方库的情况下，你需要知道如何执行以下这些操作：

- 使用 document.querySelector 选择或查找节点，在旧版浏览器中使用 document.getElementsByTagName
- 上下遍历——Node.parentNode、Node.firstChild、Node.lastChild 和 Node.childNodes
- 左右遍历——Node.previousSibling 和 Node.nextSibling
- 操作——在 DOM 树中添加、删除、复制和创建节点。你应该了解如何修改节点的文本内容以及切换、删除或添加 CSS 类名等操作
- 性能——当有很多节点时，修改 DOM 的成本会很高，你至少应该知道如何使用文档片段和节点缓存。

正巧在复习浏览器相关的内容，这一块，也算js里比较接近浏览器的了，做个小总结（其实就是React写多了忘记了这些操作。。。

### DOM节点

首先，DOM节点和普通的js对象有什么区别？

>  DOM和BOM不属于JavaScript语言的一部分。是运行平台（浏览器）提供的，在nodejs中就没有。

html中p标签映射为JS中的HTMLParagraphElement，继承关系如下

```
HTMLParagraphElement
  - HTMLElemnt
    -Element
      -Node
        -EventTarget
          -Object
```

最终的父类都是Object，所以DOM节点并没有什么特殊的。完全可以给节点附加属性，增加函数。

DOM的有些属性和方法会被引擎映射到html标签上。

### DOM节点的获取和选择

- document.getElementById()
- document.getElementsByTabName() 
- document.getElementsByClassName()
- document.querySelector()
- document.querySelectorAll()

### 创建节点

- document.createElement()
- document.createTextNode()

### 操作节点

#### 插入节点

- appentChild()
- insertBefore(newObj, targetObj)
- insertAfter(newObj, targetObj)

#### 复制节点

- cloneNode(true / false)

#### 替换节点

- replaceChild(newObj, targetObj)

#### 删除节点

- removeChild()

#### 移动节点

- append()
- insertBefore()
- insertAfter()

### DOM节点的属性

- nodeName
- nodeType
- nodeValue
- childNodes
- firstChild
- lastChild
- nextSibling
- previoutSibling
- parentNode

### 性能

上面提到了性能，节点缓存应该是指，多次获取一个节点不如查找一次并且用变量名缓存起来。

文档片段就是下面提到的documentFragment。

#### documentFragment

> DocumentFragment，文档片段接口，表示一个没有父级文件的最小文档对象。它被作为一个轻量版的 Document 使用，用于存储已排好版的或尚未打理好格式的XML片段。最大的区别是因为 DocumentFragment 不是真实DOM树的一部分，它的变化不会触发 DOM 树的（重新渲染) ，且不会导致性能等问题。

被添加(append)或被插入(inserted)的是片段的所有子节点, 而非片段本身。因为所有的节点会被一次插入到文档中，而这个操作仅发生一个重渲染的操作，而不是每个节点分别被插入到文档中，因为后者会发生多次重渲染的操作。

DocumentFragment不属于文档树，parentNode为null。

当把一个DocumentFragment插入DOM树时，其中的所有子孙节点都会被插入，所以他相当于是一个占位符！

比如如下例子：

```js
const fragment = document.createDocumentFragment();

for(let i = 0; i < 10; i++) {
  const li = document.createElement('li');
  li.innerHtml = `list ${i}`;
  fragment.appendChild(li);
}

listNode.appendChild(fragment);
```

### Range

```js
var tagString = "<div>I am a div node</div>";
var range = document.createRange();
// make the parent of the first div in the document becomes the context node
range.selectNode(document.getElementsByTagName("div").item(0));
var documentFragment = range.createContextualFragment(tagString);
document.body.appendChild(documentFragment);
```

### 参考资料

- [David Shariff的文章](https://www.zhihu.com/question/41466747/answer/584673304)
- [MDN HTMLParagraphElement](https://developer.mozilla.org/en-US/docs/Web/API/HTMLParagraphElement)
- [MDN DocumentFragment](https://developer.mozilla.org/zh-CN/docs/Web/API/DocumentFragment)
- [MDN Range.createContextualFragment()](https://developer.mozilla.org/zh-CN/docs/Web/API/Range/%E5%88%9B%E5%BB%BA%E4%B8%8A%E4%B8%8B%E6%96%87%E7%89%87%E6%AE%B5)
- [MDN Range.selectNodeContents()](https://developer.mozilla.org/zh-CN/docs/Web/API/Range/selectNodeContents)
- [MDN Range](https://developer.mozilla.org/zh-CN/docs/Web/API/Range)