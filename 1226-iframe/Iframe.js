import React from 'react';
import { withRouter } from 'react-router';

class Main extends React.Component {

  componentDidMount() {
    window.addEventListener("message", this.receiveMessage, false);
    setTimeout(this.handleSendMsg, 5000);
  }

  handleSendMsg = () => {
    const ifr = document.getElementById('iframe');
    const url = document.location.origin + '/idemo.html';
    const data = ['halo'];
    ifr.contentWindow.postMessage(data, url);
  }

  receiveMessage = (event) => {
    window.console.log(event);
    const origin = event.origin || event.originalEvent.origin; 
    if (origin !== "http://localhost:3000") return;
    if (!event.data) return;
    const url = event.data.slice(8, -1);
    this.props.history.push(`${url}`);
  }


  render(){
      return (
        <div>
          <iframe
            id="iframe"
            src="/idemo.html"
            width='100%'
            height='600'
          />
        </div>
      )
  }
}

export default withRouter(Main);