## js模块化

贯穿整个js发展历史的东西，或多或少都有使用到。可惜一直没有梳理和深入了解，从下面几个方面来梳理一下：

1. js模块化发展历程
2. 几种典型方式的基本形式和特征
3. CommonJS和ES2015 Modules的对比（node和当前环境使用最多的）
4. 应用：模仿一个amd加载器
5. 应用：用ast去进行一些export和exports的检测

### js模块化发展历程

上[至今为止看过最详细的关于这方面的文章](https://github.com/myshov/history-of-javascript/tree/master/4_evolution_of_js_modularity#the-evolution-of-javascript-modularity)

#### [主要解决的问题](https://github.com/myshov/history-of-javascript/tree/master/4_evolution_of_js_modularity#a-little-more-about-problems)

1. The Name Collision（命名冲突）
2. The Support for Large Codebases：直译没啥意思反而让人不明，主要是指当项目规模变大，js变的不可避免地要进行拆分，拆分后多个js引入的顺序，通过手动维护会变得非常枯燥和麻烦

从年份上大致可以分为如下三个阶段：

1. 第一阶段：基于语言层面（语言特性）的模块化

其中`Directly Defined Dependencies`,`he Namespace Pattern`,`The Module Pattern`更像是在发掘js语言特性，通过闭包，对象等特征来实现模块化。

2. 第二阶段：预处理介入

`Template Defined Dependencies`,`Comment Defined Dependencies`,`Externally Defined Dependencies`属于DDD家族，都需要借助外部预处理的方式来加载实现模块化。

3. 第三阶段：借鉴服务端的解决方案

从`CommonJS`开始，打破了封装的思路，引入了一整套模块化规范，包括`AMD`(`sandbox`其实和`AMD`也有点类似),`UMD`,`Labeled Modules`。

### 几种定性方式和基本形式和特征

#### The Namespace Pattern

最原始的方法，把属性和方法放在一个对象中，来减少全局冲突。但是没有根本上解决命名冲突的问题（两个第三方库可能取的名字一样），也没有解决加载顺序的问题。

#### The Module Pattern

借助立即执行函数的模式，解决了冲突的问题，还形成了一定的数据保护性。是网上可以找到比较普遍的方式。

#### CommonJS Modules

真正解决模块化问题，从 node 端逐渐发力到前端，前端需要使用构建工具模拟。

#### AMD

主要解决前端动态加载依赖，相比 commonJs，体积更小，按需加载。

#### UMD

容了 CommonJS 与 Amd，其核心思想是，如果在 commonjs 环境（存在 module.exports，不存在 define），将函数执行结果交给 module.exports 实现 Commonjs，否则用 Amd 环境的 define，实现 Amd。

#### ES2015 Modules

现在的模块化方案，还没有被浏览器实现，大部分项目已通过 babel 或 typescript 提前体验。

### CommonJS和ES2015 Modules的对比

CommonJS和ES2015 Modules（以下简称ES6）是当前使用的最多的两种模块化方案，分别被广泛应用于nodeJS和日常开发（通过babel）。

两者的形式比较相似，ES6中使用import、export代替了require和module.exports。

#### 区别

1. ES6输出的是值的引用,CommonJS输出的是值的拷贝

ES6输出的是值的引用，说明是动态关联模块中的值：

```js
// export.js
export let number = 1;
setTimeout(() => {
  number = 2;
}, 500);

// import.js
import { number } from './export';
console.log(number);
setTimeout(() => {
  console.log(number);
  import('./export').then(({ number }) => {
    console.log(number);
  });
}, 1000);
```

结果如下：

```js
1
2
2
```

一切都按照我们预想的进行。那如果是CommonJs呢？

```js
// export.js
let number = 1;
setTimeout(() => {
  number = 2;
}, 500);
module.exports = {
  number: number,
};

// import.js
var obj = require('./export');
console.log(obj.number);
setTimeout(() => {
  console.log(obj.number);
  console.log(require('./export').number);
}, 1000);
```

结果如下：

```js
1
1
1
```

这说明，当模块加载后，内部变化影响不到输出的export，这是因为number是一个基本类型，是值的拷贝。所以如果暴露的是个对象，就没有这个问题。

还说明重复引入模块不会重复执行，而是直接获得暴露的 module.exports 对象。

如果一定要更新，可以用如下的方法：

```js
module.exports.number = 1;
setTimeout(() => {
  module.exports.number = 2;
}, 500);
```

2. ES6模块编译时执行，CommonJS运行时加载

首先，import 命令会被 JavaScript 引擎静态分析，优先于模块内的其他内容执行（实际上import一般在文件的最开始）。

```js
// a.js
console.log('a.js')
import { foo } from './b';

// b.js
export let foo = 1;
console.log('b.js 先执行');

// 执行结果:
// b.js 先执行
// a.js
```

export变量声明提升

```js
// a.js
import { foo } from './b';
console.log('a.js');
export const bar = 1;
export const bar2 = () => {
  console.log('bar2');
}
export function bar3() {
  console.log('bar3');
}

// b.js
export let foo = 1;
import * as a from './a';
console.log(a);

// 执行结果:
// { bar: undefined, bar2: undefined, bar3: [Function: bar3] }
// a.js
```

### 应用：模仿一个amd加载器

先来看一下AMD模式的特征：

```js
// file lib/greeting.js
define(function() {
    var helloInLang = {
        en: 'Hello world!',
        es: '¡Hola mundo!',
        ru: 'Привет мир!'
    };

    return {
        sayHello: function (lang) {
            return helloInLang[lang];
        }
    };
});

// file hello.js
define(['./lib/greeting'], function(greeting) {
    var phrase = greeting.sayHello('en');
    document.write(phrase);
});
```

要实现一套define机制，当接收的为一个函数，表示定义模块，接收一个数组和一个函数，表示函数的依赖模块。

*待补充*

### 应用：用ast去进行一些export和exports的检测

exports和export是CommonJS里的比较让人迷惑的两个关键字，根据[CommonJS规范中](http://javascript.ruanyifeng.com/nodejs/module.html#toc2)所说

> module.exports属性表示当前模块对外输出的接口，其他文件加载该模块，实际上就是读取module.exports变量。

> 为了方便，Node为每个模块提供一个exports变量，指向module.exports。这等同在每个模块头部，有一行这样的命令。

```js
var exports = module.exports;
```

所以，module.exports可以这样写module.exports = function() {}，而exports不能这样写因为会把上面这行命令给断了，相当于切断了exports与module.exports的联系。

而两者混合用，也会导致exports不会起作用，因为module.exports被重新赋值了。

所以，这两者是不能混用的，可以实现一个lint插件来进行检测：

```js
// util.js
'use strict';

exports.isExports = function(node) {
  // exports.view = '';
  // exports['view'] = '';
  return node.object.type === 'Identifier' && node.object.name === 'exports';
};

exports.isModule = function(node) {
  // module.exports = {};
  // module.exports = () => {};
  if (node.object.type === 'Identifier') {
    return node.object.name === 'module' && node.property.type === 'Identifier' && node.property.name === 'exports';
  }

  // module.exports.test = {};
  if (node.object.type === 'MemberExpression') {
    const realNode = node.object;
    return realNode.object.name === 'module' && realNode.property.type === 'Identifier' && realNode.property.name === 'exports';
  }
};
```

```js
'use strict';

const path = require('path');
const utils = require('../utils');

module.exports = {
  meta: {
    messages: {
      overrideExports: 'Don\'t overide `exports`',
      overrideModule: 'Don\'t overide `module.exports`',
    },
  },
  create(context) {
    let hasExports = false;
    let hasModule = false;
    return {
      ExpressionStatement(node) {
        if (!node.parent || node.parent.type !== 'Program') return;
        if (node.expression.type !== 'AssignmentExpression') return;
        const testNode = node.expression.left;
        if (utils.isExports(testNode)) {
          if (hasModule) {
            context.report({ node, messageId: 'overrideExports' });
          }
          hasExports = true;
        } else if (utils.isModule(testNode)) {
          if (hasExports) {
            context.report({ node, messageId: 'overrideExports' });
          }
          if (hasModule) {
            context.report({ node, messageId: 'overrideModule' });
          }
          hasModule = true;
        }
      },
    };
  },
};
```
