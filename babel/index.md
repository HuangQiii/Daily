## 编译原理相关学习

起因于看到知乎上的一个[提问](https://www.zhihu.com/question/268622554/answer/384881779)，一想起大学时学的不怎么样的编译原理，又好奇前端怎么用的越来越多AST了，就顺着高赞回答进行一波学习。

正如回答里提到，先从Babel插件开始，看了官方的两个文档

- [Babel手册](https://github.com/jamiebuilds/babel-handbook/blob/master/translations/zh-Hans/user-handbook.md)
- [插件手册](https://github.com/jamiebuilds/babel-handbook/blob/master/translations/zh-Hans/plugin-handbook.md)

前者主要讲用Babel，这个在webpack打包中有所涉及，可以说是现代前端开发必不可少的。

后者主要讲了AST的一些基础，节点操作，API和插件基础。

### 最简单的插件（来自于插件手册的例子）

首先知道Babel插件就是一个function，导出一个对象，这个对象返回一个visitor，然后再里面进行一些操作。

```js
import * as t from "babel-types";

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
```

### 类似antd中的按需加载插件（来自于高赞回答中的举例）

Antd中的按需加载插件很有意思，从实现上来看也只是简单的替换。

不过这次通过这个更加深了`代码就是字符串`的理解。

可以通过[该网站](https://astexplorer.net/)查看AST结点情况。

![pic1](./pic1.png)

不难看出，ImportDeclaration结点是一样的，都有specifiers（是一个数组）和source，其中source就是from后面的字符串，重点要操作的是specifiers中的ImportSpecifier到ImportDefaultSpecifier。

```js
const types = require('babel-types');

module.exports = {
  visitor: {
    ImportDeclaration(path, ref = {}) {
      const { opts } = ref
      const { node } = path;
      const { specifiers } = node;
      if (opts.library == node.source.value) {
        const newImport = specifiers.map((specifier) => (
          types.importDeclaration(
            [types.ImportDefaultSpecifier(specifier.local)], types.stringLiteral(`${node.source.value}/${specifier.local.name}`),
          )
        ));
        path.replaceWithMultiple(newImport)
      }
    }
  }
}
```