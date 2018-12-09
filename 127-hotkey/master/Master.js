import React from 'react';
import { inject, observer } from 'mobx-react';
import { HashRouter } from 'react-router-dom';
import 'moment/locale/zh-cn';
import { localeContext, ModalContainer } from 'choerodon-hap-ui';
import Menu from '../menu';
import Axios from '../axios';
import Tabbar from '../tabbar';
import Header from '../header';
import getHotkeyManager from './HotkeyManager';
import './style';

@inject('AppState')
@observer
export default class Index extends React.Component {
  componentDidMount() {
    this.handleLocaleContext();
    this.initHotkeyManager();
  }

  /**
   * query hotkey dictionary
   * and set in manager
   */
  initHotkeyManager() {
    const hotkeyManager = getHotkeyManager();
    Axios.post('/dataset/Hotkey/queries?page=1&pagesize=10', {})
      .then((res) => {
        if (res.success) {
          hotkeyManager.init(res.rows);
        } else {
          hotkeyManager.init([]);
        }
      })
      .catch((error) => {
        hotkeyManager.init([]);
      });
  }

  handleLocaleContext() {
    const { AppState } = this.props;
    const { locales, currentLang } = AppState;
    if (Object.keys(locales).length) {
      localeContext.setSupports(locales);
    }

    if (currentLang) {
      import(`choerodon-hap-ui/lib/locale-context/${currentLang}.js`)
        .then((o) => {
          localeContext.setLocale(o);
        });
    }
  }

  render() {
    const { AutoRouter, AppState } = this.props;
    return (
      <div className="master-wrapper">
        <Header />
        <div className="master-body">
          <div className="master-content-wrapper">
            <Menu />
            <div className="master-content-container">
              <div className="master-container">
                <Tabbar />
                <div className="master-content">
                  <AutoRouter />
                </div>
              </div>
            </div>
          </div>
        </div>
        <ModalContainer />
      </div>
    );
  }
}
