# dynamic react component

## dynamic import() syntax

```javascript
import("./math").then(math => {
  console.log(math.add(16, 26));
});
```

这样，只有在执行到这里时才会去加载math.js文件。

考虑另一种场景，当一个页面有很多状态时，每个状态对应不同的页面组件，如果全部引入组件固定可行，但是绝大部分（大部分情况下只有一个是有用的）
是不显示的。

更棒的是，当webpack遇到这种写法，会自动进行code-spliting.

[参考链接](https://reactjs.org/docs/code-splitting.html#import)

## dynamically on demand

```javascript
const eventElement = events.map(event => {
  switch (event) {
    case "PushEvent": return <PushEvent key={shortid.generate()} />;
    case "ReleaseEvent": return <ReleaseEvent key={shortid.generate()} />;
    case "StatusEvent": return <StatusEvent key={shortid.generate()} />;
    default: return <div key={shortid.generate()}></div>;
  }
});

return (
  <div>
    {eventElement}
  </div>
);
```

```javascript
addComponent = async type => {
  console.log(`Loading ${type} component...`);
  
  import(`./components/${type}.js`)
    .then(component =>
      this.setState({
        components: this.state.components.concat(component.default)
      })
    )
    .catch(error => {
      console.error(`"${type}" not yet supported`);
    });
};

async componentDidMount() {
  const { events } = this.props;
  events.map(async type => await this.addComponent(type));
}
```

这样做，可以

- 只动态导入需要的组件
- 更好维护，没有复杂的选择情况

具体优化：

部分业务场景有多种可能，以敏捷为例子，1.加载中，2.获取到的冲刺为空，3.冲刺不为空，但该冲刺下无卡片，这些都对应不同的视图组件，动态导入的优势就很明显。

[参考链接](https://www.slightedgecoder.com/2017/12/03/loading-react-components-dynamically-demand/)

## React Loadable

React Loadable是一个方便地动态导入并且进行code split的库。

```javascript
import Loadable from 'react-loadable';

const LoadableOtherComponent = Loadable({
  loader: () => import('./OtherComponent'),
  loading: () => <div>Loading...</div>,
});

const MyComponent = () => (
  <LoadableOtherComponent/>
);
```

[官方文档](https://github.com/jamiebuilds/react-loadable)非常详细。

[参考链接](https://reactjs.org/docs/code-splitting.html#react-loadable)

## load from remote

有时候在运行时，需要请求远端接口直接获取组件代码，而运行环境是ES5的，所以要用Babel进行编译。‘

```javascript
function loadRemoteComponent(url){
  return fetch(url)
  .then(res=>res.text())
  .then(source=>{
    var exports = {}
    function require(name){
      if(name == 'react') return React
      else throw `You can't use modules other than "react" in remote component.`
    }
    const transformedSource = Babel.transform(source, {
      presets: ['react', 'es2015', 'stage-2']
    }).code
    eval(transformedSource)
    return exports.__esModule ? exports.default : exports
  })
}

loadRemoteComponent('https://codepen.io/tonytonyjan/pen/QEawag.js').then((Hello) => {
  ReactDOM.render(<Hello/>, document.getElementById('hello'))
})
```

在客户端通过eval()执行代码，而代码是经过Babel编译的，其中的依赖部分都变成require了，而又重写了require函数。

参考链接：

[链接](https://codepen.io/qborreda/pen/JZyEaj)

## combine

采用上面load from remote的思想，可以控制并写出异步加载的模式，而import是单例形式的，所以不用考虑缓存问题。

```javascript
const DynamicComponent = Loadable({
    loader: () => (fetch('/lib/client.js').then(r => r.text()).then(js => {
        var require = (name) => {
            if(name == 'react'){
                return React
            } else if(name == 'react-loadable'){
                return Loadable
            } else {
                console.error('no supported require: ' + name);
            }
        }
        var exports = {};eval(js)
        return exports.__esModule ? exports.default : exports
    })),
    loading: Loading,
});
```

因为brower环境无法使用babel.translate，所以在本地生成编译后的client文件，重写require函数，将公用库（如主页用到的React,react-loadable)直接返回，因为他们经过了babel编译。

而对没在主页上使用的，要在主页部分通过异步加载载入，使之通过babel编译并且可以在ES5下直接使用。

```javascript
const requireEnsure = (name) => {
    if(name == 'moment'){
        return import('moment')
    }
    return import('./antd/' + name)
}
```

而在client.js下

```javascript
componentDidMount(){
  window.console.log('componentDidMount')
  requireEnsure('moment').then(m => {
    window.console.log(m.default.now)
    this.setState({moment: m.default})
  })
}
```

可以获取到moment库。

且在别的页面同样使用时，不会重复加载。（import使用的是单例）

这样，可以实现设计好的组件（在服务端），需要的时候下载到本地（例子中模拟的是已经在本地并且经过Babel编译的），进行编译后，安装内部的依赖，然后运行。

### 例子运行过程

- 在跟目录下，`npm run babel`，讲custom下的文件编译到lib下
- 运行`npm start`在浏览器中查看

[例子](https://github.com/HuangQiii/Daily/blob/master/928-reactDyCmp/)
