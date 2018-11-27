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

#### 底层实现

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
