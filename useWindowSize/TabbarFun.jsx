import React, { useEffect } from 'react';
import queryString from 'query-string';
import _ from 'lodash';
import { inject } from 'mobx-react';
import { observer } from 'mobx-react-lite';
import { withRouter } from 'react-router-dom';
import { Icon, Menu, Dropdown } from 'choerodon-ui';
import classNames from 'classnames';
import useWindowSize from './useWindowSize';
import './style';

const TAB_PLACEHOLDER_NAME = '临时标签页';
const MAX_WIDTH = 120;
const HIDDEN_CLOSE_WIDTH = 80;
const MIN_WIDTH = 20;

function splitPathname(pn, se) {
  if (se) {
    return {
      pathname: pn,
      search: se,
    };
  }
  if (pn && pn.indexOf('?')) {
    return {
      pathname: pn.split('?')[0],
      search: pn.split('?')[1],
    };
  } else {
    return {
      pathname: pn,
    };
  }
}

const MenuBar = (props) => {
  const { history: { location: { pathname: pn, search: se } } } = props;
  const { pathname, search } = splitPathname(pn, se);

  function insertTabs(key, tab) {
    const { MenuStore } = props;
    const tabs = MenuStore.getTabs;
    if (!tabs.find(v => v && v.route === key)) {
      tabs.push(tab);
      MenuStore.setTabs(tabs);
    }
  }

  function getNextTabName() {
    const { MenuStore } = props;
    const tabs = MenuStore.getTabs;
    const tabsNameArr = _.filter(_.map(tabs, 'name'), v => v.startsWith(TAB_PLACEHOLDER_NAME));
    if (!tabsNameArr.length) return `${TAB_PLACEHOLDER_NAME}1`;

    const nums = tabsNameArr.map(v => v.slice(v.indexOf(TAB_PLACEHOLDER_NAME) + TAB_PLACEHOLDER_NAME.length));
    const nextNum = _.max(nums) * 1 + 1;
    return `${TAB_PLACEHOLDER_NAME}${nextNum}`;
  }

  function loadTabbar() {
    const { MenuStore, location: { state } } = props;
    MenuStore.loadMenuData().then((menus) => {
      if (pathname !== '/') {
        MenuStore.treeReduce({ subMenus: menus }, (menu) => {
          if (menu.route === pathname || pathname.indexOf(`${menu.route}/`) === 0) {
            insertTabs(pathname, { ...menu, search });
            return true;
          }
        });
        const tab = MenuStore.tabs.find(v => v.code === pathname);
        if (tab && tab.search !== search) {
          MenuStore.updateTab(tab, search);
        }
        const construct = {
          code: pathname,
          name: (state && state.name) || getNextTabName(),
          route: pathname,
          search,
        };
        insertTabs(pathname, construct);
        return false;
      }
    });
  }


  const windowSize = useWindowSize();

  useEffect(() => {
    loadTabbar(props);
  }, [pathname, windowSize.innerWidth]);

  function checkIsActive(tab) {
    if (tab.route === pathname || pathname.indexOf(`${tab.route}/`) === 0) {
      return true;
    }
    return false;
  }

  function getMenuLink(tab) {
    return `${tab.route}${tab.search ? `?${tab.search}` : ''}`;
  }

  function handleLink(tab, isFromFresh) {
    const { route } = tab;
    if (checkIsActive(tab) && !isFromFresh) return;
    props.history.push(getMenuLink(tab));
  }

  function handleCloseTab(tab, event) {
    const { MenuStore } = props;
    if (event) event.stopPropagation();
    if (checkIsActive(tab)) {
      const desTab = MenuStore.getNextTab(tab);
      let desUrl;
      if (desTab.code !== 'HOME_PAGE') {
        const { route } = desTab;
        desUrl = getMenuLink(desTab);
      } else {
        desUrl = '/';
      }
      props.history.push(desUrl);
    }
    MenuStore.closeTabAndClearCacheByCacheKey(tab);
  }

  function handleClickTabMenu(tab, { key }) {
    const { MenuStore, history } = props;
    const { tabs } = MenuStore;
    const urlKey = history.location.pathname;
    const index = tabs.findIndex(v => v.code === tab.code);
    switch (key) {
      case 'close_self':
        handleCloseTab(tab);
        break;
      case 'close_other':
        handleLink(tab);
        tabs
          .filter(v => v.code !== tab.code && v.code !== 'HOME_PAGE')
          .forEach((t) => {
            handleCloseTab(t);
          });
        break;
      case 'close_all':
        props.history.push('/');
        tabs
          .filter(v => v.code !== 'HOME_PAGE')
          .forEach((t) => {
            MenuStore.closeTabAndClearCacheByCacheKey(t);
          });
        break;
      case 'close_left':
        handleLink(tab);
        if (index !== undefined) {
          tabs
            .filter((v, i) => i < index && v.code !== 'HOME_PAGE')
            .forEach((t) => {
              handleCloseTab(t);
            });
        }
        break;
      case 'close_right':
        handleLink(tab);
        if (index !== undefined) {
          tabs
            .filter((v, i) => i > index && v.code !== 'HOME_PAGE')
            .forEach((t) => {
              handleCloseTab(t);
            });
        }
        break;
      case 'refresh':
        if (tab && tab.pagePermissionType === 'page') {
          MenuStore.setContentKey(urlKey, Date.now());
        } else {
          handleCloseTab(tab);
          handleLink(tab, true);
        }
        break;
      default:
        break;
    }
  }

  const { MenuStore: { tabs } } = props;
  const MAX_NUMBER = Math.floor((document.body.clientWidth - 360) / MAX_WIDTH);
  const num = tabs.length;
  const eachTabWidth = num ? (document.body.clientWidth - 360) / num : MAX_WIDTH;
  let width;
  if (num <= MAX_NUMBER) {
    width = MAX_WIDTH;
  } else if (eachTabWidth < MIN_WIDTH) {
    width = MIN_WIDTH;
  } else {
    width = eachTabWidth;
  }

  const activeIndex = tabs.findIndex(tab => pathname === `${tab.route}`);
  if (activeIndex !== -1) {
    // MenuStore.setCurrentTabIndex(activeIndex);
  }

  const getDropdownOverlay = tab => (
    <Menu onClick={o => handleClickTabMenu(tab, o)} selectedKeys={[]}>
      {tab.code === 'HOME_PAGE' ? null : <Menu.Item key="close_self"> 关闭该标签页 </Menu.Item>}
      {pathname === tab.route || pathname === `/iframe/${tab.code}` ? <Menu.Item key="refresh"> 刷新 </Menu.Item> : null}
      <Menu.Item key="close_other">关闭其他标签页</Menu.Item>
      <Menu.Item key="close_all">关闭全部标签页</Menu.Item>
      <Menu.Item key="close_right">关闭右侧标签页</Menu.Item>
      {tab.code === 'HOME_PAGE' ? null : <Menu.Item key="close_left">关闭左侧标签页</Menu.Item>}
    </Menu>
  );

  return (
    <div className="tab-bar-wrap">
      <ul className="tab-bar-list">
        {
          tabs.filter(v => !!v).map((tab, i) => (
            <Dropdown
              trigger={['contextMenu']}
              key={tab.code}
              placement="bottomLeft"
              overlay={getDropdownOverlay(tab)}
            >
              <li
                key={tab.code}
                className={classNames({
                  tab: true,
                  'tab-active': activeIndex === i,
                  'tab-hover': activeIndex !== i,
                  'tab-active-before': activeIndex >= 1 && i === activeIndex - 1,
                  'tab-active-after': activeIndex >= 0 && i === activeIndex + 1,
                })}
                style={{ width }}
                onClick={() => handleLink(tab)}
              >
                <div className="li-wrapper" style={{ width, paddingLeft: 15.5, paddingRight: 13.5, positon: 'relative', height: '100%' }}>
                  <div
                    style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', lineHeight: '47px' }}
                  >
                    {tab.name}
                  </div>
                  {
                    tab.code === 'HOME_PAGE' || (num > MAX_NUMBER && eachTabWidth < HIDDEN_CLOSE_WIDTH && pathname !== `${tab.route}` && pathname !== `/iframe/${tab.code}`) ? null : (
                      <span
                        className="icon-wrapper"
                        style={{
                          background: activeIndex === i 
                            ? 'linear-gradient(to right, rgba(255, 255, 255, 0), #fff 40%, #fff)'
                            : 'linear-gradient(to right, rgba(245, 245, 245, 0), #3f51b5 40%, #3f51b5)',
                        }}
                      >
                        <Icon
                          type="close"
                          style={{ fontSize: 14, marginLeft: 20 }}
                          onClick={e => handleCloseTab(tab, e)}
                        />
                      </span>
                    )
                  }
                </div>
              </li>
            </Dropdown>
          ))
        }
      </ul>
    </div>
  );
};

export default withRouter(inject('MenuStore', 'AppState')(observer(MenuBar)));
