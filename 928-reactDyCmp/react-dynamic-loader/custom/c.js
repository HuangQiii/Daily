import React, {Component} from 'react';
import Loadable from 'react-loadable';

export default class Client extends Component {

    constructor(props){
        window.console.log('constructor')
        super(props)
        this.state = {
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

    render(){
        window.console.log(this.state.moment)
        return (<div><span style={{paddingRight: 5}}>{this.state.moment === null? '':this.state.moment.now()}</span></div>)
    }

}