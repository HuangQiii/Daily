import 'antd/dist/antd.css';
import React from 'react';
import ReactDOM from 'react-dom';
import Loadable from 'react-loadable';
import { Layout, Menu, Icon } from 'antd';
import { HashRouter, Link, Route } from 'react-router-dom';

const { Content, Sider } = Layout;

const Main = Loadable({
    loader: () => import('./main'),
    loading: () => <div>Loading...</div>,
});

const requireEnsure = (name) => {
    if(name == 'moment'){
        return import('moment')
    }
    return import('./antd/' + name)
}

function Loading() {
  return <div>Loading...</div>;
}

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

const DyComponent = Loadable({
    loader: () => (fetch('/lib/c.js').then(r => r.text()).then(js => {
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


class Index extends React.Component {

    state = {
        collapsed: false
    };

    onCollapse = (collapsed) => {
        this.setState({ collapsed });
    }

    render() {
        return (
            <HashRouter>
                <Layout style={{height: '100vh'}}>
                    <Sider
                        collapsible
                        collapsed={this.state.collapsed}
                        onCollapse={this.onCollapse} >
                        <Menu theme="dark" defaultSelectedKeys={['1']} mode="inline">
                            <Menu.Item key="1">
                                <Link to="/">
                                    <Icon type="pie-chart" />
                                    <span>Main</span>
                                </Link>
                            </Menu.Item>
                            <Menu.Item key="2">
                                <Link to="/dc">
                                    <Icon type="pie-chart" />
                                    <span>DynamicComponent</span>
                                </Link>
                            </Menu.Item>
                            <Menu.Item key="3">
                                <Link to="/c">
                                    <Icon type="pie-chart" />
                                    <span>c</span>
                                </Link>
                            </Menu.Item>
                        </Menu>
                    </Sider>
                    <Layout>
                        <Content style={{ margin: '16px' }}>
                            <Route exact path='/' component={Main} />
                            <Route exact path='/dc' component={DynamicComponent}/>
                            <Route exact path='/c' component={DyComponent}/>
                        </Content>
                    </Layout>
                </Layout>
            </HashRouter>
        );
    }
}

ReactDOM.render(<Index />, document.getElementById('root'));