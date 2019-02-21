1. mobx如果把一个对象（数组）变为可观察对象，observable，会递归遍历所有的子，就是说{obj: {}, name: 'qihuang'}，里面的obj也是可观察的
2. react怎么更新，state变化或者props改变
3. mobx为什么能使react变化，mobx的对象在react中使用，相当于在组件的上下文中有个get，然后get和mobx中去对比，如果不同，则更新

综上，要使变化被监听，你这个变量（细粒度的变量）比如对象数组中的某个对象的某个属性，要在render里有所体现，比如store.items[0].name。

所以你用slice()（slice的原理其实和toJS差不多，对每一层使用get转化为普通js对象）整个items都变了（引用变化）所以全更新

那为什么改里面的一个属性不会变化呢？ant design的锅，如果ant design的table组件的row甚至field是observable的，因为是这里用到了store.items[0].name，那他可以变化。很遗憾不是，甚至table都不是，所以对整个table来说，props没变（引用没变），state没变（显而易见），所以table不更新，就不会触发里面的组件（row或者field）rerender

怎么做会更新，且比较好
改变name，改变items[0]，items的引用，总而言之，改了那个值，沿着这个值找上去，把引用都改了，别的都用...引回来，那对table来说，items变了，他要去更新，然后把每个item分发给row组件（假设有这个组件，我没看源码），对没有变的行来说，props里的item没变（引用没变）不更新，对变的来说，变了更新，把每个字段分发给field，所以，这个table的这行的这个单元格重新刷新了