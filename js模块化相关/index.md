## js模块化

贯穿整个js发展历史的东西，或多或少都有使用到。可惜一直没有梳理和深入了解，从下面几个方面来梳理一下：

1. js模块化发展历程
2. 几种典型方式的基本形式和特征
3. commonjs和es6的对比（node和当前环境使用最多的）
4. 应用：模仿一个amd加载器
5. 应用：用ast去进行一些export和exports的检测

### js模块化发展历程

上[至今为止看过最详细的关于这方面的文章](https://github.com/myshov/history-of-javascript/tree/master/4_evolution_of_js_modularity#the-evolution-of-javascript-modularity)

#### [主要解决的问题](https://github.com/myshov/history-of-javascript/tree/master/4_evolution_of_js_modularity#a-little-more-about-problems)

1. The Name Collision（命名冲突）
2. The Support for Large Codebases：直译没啥意思反而让人不明，主要是指当项目规模变大，js变的不可避免地要进行拆分，拆分后多个js引入的顺序，通过手动维护会变得非常枯燥和麻烦

