import React, { Component } from 'react';
import classNames from 'classnames';
import { withRouter } from 'react-router-dom';
import { inject, observer } from 'mobx-react';
import getHotkeyManager from '../master/HotkeyManager';
import './style';

@withRouter
@inject('AppState')
@observer
export default class PageContent extends Component {
  constructor(props) {
    super(props);
    this.urlKey = undefined;
  }

  componentDidMount() {
    this.registryHotkey();
  }

  componentWillUnmount() {
    this.removeHotkey();
  }

  registryHotkey() {
    const { props } = this;
    const { hotkeys, history } = props;
    if (hotkeys) {
      const hotkeyManager = getHotkeyManager();
      const urlKey = history.location.pathname;
      this.urlKey = urlKey;
      hotkeyManager.addHandlers({
        [urlKey]: hotkeys,
      });
    }
  }

  removeHotkey() {
    const { props } = this;
    const { hotkeys, history } = props;
    if (hotkeys && this.urlKey) {
      const hotkeyManager = getHotkeyManager();
      hotkeyManager.deleteHandlers([this.urlKey]);
    }
  }

  /**
   * get string of keydown, return `Shift+G` or such like this
   * @param {*} event 
   */
  handleEventToGetHotkeyString(event) {
    const hotkeyArr = [];
    if (event.ctrlKey) {
      hotkeyArr.push('Ctrl');
    }
    if (event.shiftKey) {
      hotkeyArr.push('Shift');
    }
    if (event.altKey) {
      hotkeyArr.push('Alt');
    }
    hotkeyArr.push(event.key.toUpperCase());
    return hotkeyArr.join('+');
  }

  handleOnKeyDown = (event) => {
    const hotkeyManager = getHotkeyManager();
    const { props } = this;
    const { hotkeys, history } = props;
    const urlKey = history.location.pathname;
    hotkeyManager.emit(urlKey, this.handleEventToGetHotkeyString(event));
  }

  render() {
    const { props } = this;
    const { className, children, style } = props;
    const classString = classNames('page-content', className);
    if (!props.hotkeys) {
      return (
        <div className={classString} style={style}>
          {children}
        </div>
      );
    }
    return (
      <div className={classString} style={style} tabIndex="-1" onKeyDown={this.handleOnKeyDown}>
        {children}
      </div>
    );
  }
}
