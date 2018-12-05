## webpack常见题和自己的理解汇总

1. 有哪些常见的Loader？他们是解决什么问题的？
2. 有哪些常见的Plugin？他们是解决什么问题的？
3. Loader和Plugin的不同？
4. webpack的构建流程是什么?从读取配置到输出文件这个过程尽量说全
5. 是否写过Loader和Plugin？描述一下编写loader或plugin的思路？
6. webpack的热更新是如何做到的？说明其原理？
7. 如何利用webpack来优化前端性能？（提高性能和体验）
8. 如何提高webpack的构建速度？
9. 怎么配置单页应用？怎么配置多页应用？
10. npm打包时需要注意哪些？如何利用webpack来更好的构建？
11. tree-shaking
12. 输出文件结构分析

### 其余问题

#### gulp与webpack

可以说是发展的必然，gulp是相较于wenpack的早期产物，是一个基于流的自动化构建工具（自动化就是自动地执行一些列复杂的流程），有管理和执行任务，支持监听和读写文件。

Gulp的设计非常简单却不失灵活性，基本使用五个方法：

- gulp.task(注册任务)
- gulp.run(执行任务)
- gulp.watch(监听文件)
- gulp.src(读文件)
- gulp.dest(写文件)

就可以完成任务。

优点是好用，简单却灵活，可以单独构建（如使用gulp做发布前的编译）也可以和其他工具搭配使用（如跨文档运行webpack可以监听文件的变化进行复制）。缺点是集成度不够高，无法坐到开箱即用（不过代码本身算不上复杂，所以在单一功能或者小型项目里还是很青睐使用）。

Webpack就是本文的主角，也讲了很多很多，可以从这些中看出，Webpack把所有的文件理解成模块（不理解的通过loader去转化），通过plugin在各个阶段做出不同事件，然后输出多个模块组合的文件。

优点就很明显了：

- 专注于处理模块化的项目（以切皆模块）
- plugin扩展性强
- 可以打包成多种规范的模块
- 社区庞大，各种解决方法都很容易找到

缺点：

- 只能用于采用模块化的项目

中立点：

有人说webpack配置麻烦，但是其实去复制和拼凑出一份，针对自己的场景去找一些优化（都是有现成方案的），基本可以答到一年写一次，一次用一年的效果。

从构建思路来说

gulp需要开发者将整个前端构建过程拆分成多个`Task`，并合理控制所有`Task`的调用关系

webpack需要开发者找到入口，并需要清楚对于不同的资源应该使用什么Loader做何种解析和加工

#### 其他打包工具，parcel，rollup

rollup:

和 Webpack 很类似但专注于 ES6 的模块打包工具。 Rollup 的亮点在于能针对 ES6 源码进行 Tree Shaking 以去除那些已被定义但没被使用的代码，以及 Scope Hoisting 以减小输出文件大小提升运行性能。 然而 Rollup 的这些亮点随后就被 Webpack 模仿和实现。

优点：

- Tree Shaking: 自动移除未使用的代码, 输出更小的文件
- Scope Hoisting: 所有模块构建在一个函数内, 执行效率更高
- Config 文件支持通过 ESM 模块格式书写
- 可以一次输出多种格式:
  不用的模块规范: IIFE, AMD, CJS, UMD, ESM
  Development 与 production 版本: .js, .min.js
- 文档精简

差别：

- Rollup 是在 Webpack 流行后出现的替代品；
- Rollup 生态链还不完善，体验不如 Webpack；
- Rollup 功能不如 Webpack 完善，但其配置和使用更加简单；
- Rollup 不支持 Code Spliting，但好处是打包出来的代码中没有 Webpack 那段模块的加载、执行和缓存的代码。
- Rollup不支持运行时态加载。
Rollup 在用于打包 JavaScript 库时比 Webpack 更加有优势，因为其打包出来的代码更小更快。 但功能不够完善，很多场景都找不到现成的解决方案。

parcel：

不用再去操心细节和配置，大多数时候Parcel刚刚够用而且用的很舒服。

优点：

- Parcel能做到无配置完成以上项目构建要求；
- Parcel内置了常见场景的构建方案及其依赖，无需再安装各种依赖；
- Parcel能以HTML为入口，自动检测和打包依赖资源；
- Parcel默认支持模块热替换，真正的开箱即用；
- 构建速度快

缺点：

- 不支持SourceMap：在开发模式下，Parcel也不会输出SourceMap，目前只能去调试可读性极低的代码；
- 不支持剔除无效代码(TreeShaking)：很多时候我们只用到了库中的一个函数，结果Parcel把整个库都打包了进来；
- 构建出来的文件大

零配置其实是把各种常见的场景做为默认值来实现的，这虽然能节省很多工作量，快速上手，但这同时会带来一些问题：

- 有些依赖的库在发布到Npm上时可能不小心把.babelrcpostcss.config.jstsconfig.json这些配置文件也一起发布上去
- 零配置的Parcel关闭了很多配置项，在一些需要的配置的场景下无法改变：

1. 无法控制对部分文件的特殊处理，以实现诸如按需加载这样的需求；
2. 无法控制输出文件名的Hash值和名称；
3. 无法控制构建输出目录结构；
4. 无法映射路径以缩短导入语句；
5. HTTP开发服务器不支持HistoryApi；

中立点：

只能用来构建用于运行在浏览器中的网页，这也是他们出发点和专注点，算优点也算缺点。

总的来说：

webpack适用于大型复杂的前端站点构建。rollup适用于库的打包。parcel适用于简单的实验性项目，可以快速看到效果且不需要复杂的配置时间。

#### 底层实现

[看几遍懵逼几遍](https://juejin.im/post/5aa3d2056fb9a028c36868aa?utm_medium=fe&utm_source=weixinqun#heading-5)

#### 如何通过webpack测试react

#### 压缩合并js后如何去排查错误

source map,甚至可以引入source-map-loader

#### Webpack 怎么实现不同模块规范的互转

#### 怎么去掉log

```javascript
new webpack.optimize.UglifyJsPlugin({
  compress: {
    warnings: false,
    drop_debugger: true,
    drop_console: true
  }
})
```

#### Scope Hoisting

实现原理：分析出模块之间的依赖关系，尽可能的把打散的模块合并到一个函数中去，但是不能造成代码冗余。

从上面的原理可以得到两个关键信息：

1. 只有被引用了一次的模块才能被合并，因为如果被引用多次，不可能出现多分一样的代码
2. 需要分析出模块之间的依赖关系，所以必须采用ES6模块化语句（同tree-shaking）

优点：

1. 代码体积更小，因为函数申明语句会产生大量代码
2. 代码在运行时因为创建的函数作用域更少了，内存开销也随之变小

开启：

```javascript
const ModuleConcatenationPlugin = require('webpack/lib/optimize/ModuleConcatenationPlugin');

module.exports = {
  resolve: {
    // 针对 Npm 中的第三方模块优先采用 jsnext:main 中指向的 ES6 模块化语法的文件
    mainFields: ['jsnext:main', 'browser', 'main']
  },
  plugins: [
    // 开启 Scope Hoisting
    new ModuleConcatenationPlugin(),
  ],
};
```

#### 深入系列问题

- 依赖解析时具体过程

- 如果让你写一个打包器,你的思路是什么?

- webpack打包出来的文件结构分析

[参考此](https://github.com/HuangQiii/Daily/tree/master/925-minipack)

思路非常清晰，除开可视化和提示，核心如下：

1. 根据配置中的入口文件为开始，找到该文件并转化成AST数，使用的是babylon.parse方法
2. 根据入口的AST获取依赖关系数组，采用babel-traverse的traverse方法
3. 编译入口文件，使用的是babel-core里的transformFromAst方法

入口文件处理完毕

4. 根据入口文件开始递归获取依赖，编译文件，编译时会去解析依赖和编译代码
5. 根据所有的依赖队列生成最终文件
