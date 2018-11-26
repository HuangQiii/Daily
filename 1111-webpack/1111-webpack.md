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

gulp与webpack

其他打包工具，parcel，rollup

底层实现

如何通过webpack测试react

依赖解析时具体过程

见下自己写一个打包器的思路

压缩合并js后如何去排查错误

Webpack 怎么实现不同模块规范的互转

怎么去掉log

```javascript
new webpack.optimize.UglifyJsPlugin({
  compress: {
    warnings: false,
    drop_debugger: true,
    drop_console: true
  }
})
```

webpack打包出来的文件结构分析

如果让你写一个打包器,你的思路是什么?

[参考此](https://github.com/HuangQiii/Daily/tree/master/925-minipack)

思路非常清晰，除开可视化和提示，核心如下：

1. 根据配置中的入口文件为开始，找到该文件并转化成AST数，使用的是babylon.parse方法
2. 根据入口的AST获取依赖关系数组，采用babel-traverse的traverse方法
3. 编译入口文件，使用的是babel-core里的transformFromAst方法

入口文件处理完毕

4. 根据入口文件开始递归获取依赖，编译文件，编译时会去解析依赖和编译代码
5. 根据所有的依赖队列生成最终文件
