import React, {Component} from 'react';
import Loadable from 'react-loadable';

const Button = Loadable({
    loader: () => requireEnsure('button'),
    loading: () => <div>Loading...</div>,
});

export default class Client extends Component {

    constructor(props){
        window.console.log('constructor')
        super(props)
        this.state = {
            count: 0,
            moment: null
        }
    }

    componentDidMount(){
        window.console.log('componentDidMount')
        requireEnsure('moment').then(m => {
            window.console.log(m.default.now)
            this.setState({moment: m.default})
        })
    }

    add(){
        window.console.log(this.state.moment)
        this.setState((prevState, props) => ({ count: prevState.count + 1 }));
    }

    render(){
        window.console.log(this.state.moment)
        return (<div><span style={{paddingRight: 5}}>{this.state.count}: {this.state.moment === null? '':this.state.moment.now()}</span><Button onClick={(e) => this.add()}>+1</Button></div>)
    }

}