## 由一个Ant Design的Table组件不更新带来的思考

### 问题描述

使用了Ant Design的Table组件和Mobx来展示数据和处理数据流，预期效果是，更改行中的内容，当输入框失焦后，更改内容，同行的另一个展示字段（展示字段和输入框的值相同）更新。

代码如下：

```javascript
import React, { Component } from 'react';
import { get } from 'mobx';
import { observer } from 'mobx-react';
import { Collapse, Button, Table, Select, message, Popconfirm, InputNumber, Input } from 'antd';
import Store from './store';

const ROW_KEY = '_rowKey';
const getUUID = () => (Math.random() + '').slice(2);

@observer
class Cmp extends Component {
    constructor(props) {
        super(props);

        const columns = [{
            title: '序号',
            dataIndex: 'index',
            key: 'index',
            render: (text, record, index) => index + 1
        }, {
            title: '评审项目',
            dataIndex: 'evaluateItem',
            key: 'evaluateItem',
            render: (text, record, index) => (
                <Input
                    autoComplete={'off'}
                    defaultValue={text}
                    onBlur={(e) => this.rowChange(index, 'evaluateItem', e.target.value)}
                />
            )
        }, {
            title: '评审项目2',
            dataIndex: 'evaluateItem',
            key: 'evaluateItem2'
        }];

        this.state = {
            columns
        };
    }

    componentDidMount() {
        const items = Store.data.items;
        items.forEach((item) => {
            item[ROW_KEY] = getUUID();
        });
    }

    rowChange(index, key, value) {
        Store.changeDetailValue(index, key, value);
    }

    render() {
        const { columns } = this.state;
        return (
            <Table
                columns={columns}
                dataSource={Store.getItems}
                // dataSource={get(Store.detailInfo, 'items')}
                pagination={false}
                rowKey={ROW_KEY}
                size={'small'}
            />
        );
    }
}

export default Cmp;

 @observable detailInfo = {
    items: [
      {
        evaluateItem: 1,
      },
      {
        evaluateItem: 2,
      },
      {
        evaluateItem: 3,
      },
    ],
    categories: []
};

@action changeDetailValue(tableKey, index, key, value) {
    // const row = { ...this.detailInfo[tableKey][index], [key]: value };
    // this.detailInfo[tableKey][index] = row;
    const table = this.detailInfo[tableKey];
    table[index][key] = value;
    // set(this.detailInfo, `${tableKey}`, table);
    // window.console.log(table === this.detailInfo[tableKey]); // false
}

@computed get getItems() {
  return this.detailInfo.items.slice();
}

```

### 实际结果

由于第一反应是尽可能少的改变Mobx中被观察的变量，所以找到该行所对应的对象，修改其中的字段，发现Table并没有更新。

然后通过data.slice()发现内容更新，但是通过React的Preferences中的Highlight Update可以发现，Table的其他行都重新渲染了！

这并不是想要的结果，如果我有成千上百行，我只改变其中一个单元格，如果触发全部刷新，那性能该有多差？

### 思考过程

- mobx如果把一个对象（数组）变为可观察对象，observable，会递归遍历所有的子，就是说如果一个对象数组是被观察的，那其中的每个对象，甚至对象的每个属性，都是可观察的。

- state变化或者props改变，react会更新，re-render

- mobx为什么能使react变化，mobx的对象在react中使用，相当于在组件的上下文中有个get，然后get和mobx中去对比，如果不同，则更新

综上，要使变化被监听，你这个变量（细粒度的变量）比如对象数组中的某个对象的某个属性，要在render里有所体现，比如store.items[0].name。

看起来似乎不那么智能？但是这可能是比较好的实现了。试想，你没有引用的值，如果也监听到组件上，可能会带来无意义的更新。所以不如让程序员来决定，哪些值是需要被观察，并且影响组件的渲染的。

### 为什么有些能触发更新

用slice()（slice的原理其实和toJS差不多，对每一层使用get转化为普通js对象）整个items都变了（引用变化），而`dataSource={Store.getItems}`是一个@computed，通过slice每次输出的其实都是一个新的数组！，所以对Cmp来说，这个值每次都发生了变化（引用变了），所以Table要重新渲染，也正是这个原因，Table会发生全更新。

同理，slice()，toJS()，[...items]之类的都是同一个道理。

### 为什么改变被观察对象内的某个值不会更新？

这个可以说是Ant Design的Table的小瑕疵了，因为Table组件并不是一个可观察的组件，而Table怎么更新呢？对Table来说，就是dataSource的引用变了

如果Ant Design的Table组件的Row甚至Field是observable的，因为是这里用到了store.items[0].evaluateItem，那他可以变化。很遗憾不是，甚至Table都不是，所以对整个Table来说，props没变（引用没变），state没变（显而易见），所以Table不更新，就不会触发里面的组件（Row或者Field）rerender，也就是不更新。

### 怎么做会更新，且比较好？

改变name，改变items[0]，items的引用，总而言之，改了那个值，沿着这个值找上去，把引用都改了，别的都用...引回来，那对table来说，items变了，他要去更新，然后把每个item分发给row组件，对没有变的行来说，props里的item没变（引用没变）不更新，对变的来说，变了更新，把每个字段分发给field，所以，这个table的这行的这个单元格重新刷新了