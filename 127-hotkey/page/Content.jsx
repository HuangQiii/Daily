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

  render() {
    const { props } = this;
    const { className, children, style } = props;
    const classString = classNames('page-content', className);
    return (
      <div className={classString} style={style} tabIndex="-1">
        {children}
      </div>
    );
  }
}
