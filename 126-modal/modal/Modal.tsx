import React, { Key, ReactNode } from 'react';
import PropTypes from 'prop-types';
import omit from 'lodash/omit.js';
import classNames from 'classnames';
import classes from 'component-classes';
import ViewComponent, { ViewComponentProps } from '../core/ViewComponent';
import Constants from '../util/Constants';
import Icon from '../icon';
import { autobind } from '../decorator';
import noop from '../util/noop';
import Button from '../button/Button';
import EventManager from '../util/EventManager';
import { pxToRem } from '../util/UnitConvertor';
import isEmpty from '../util/isEmpty';
import warning from '../util/warning';
import { ButtonColor, FuncType } from '../button/enum';
import asyncComponent from '../util/AsyncComponent';

export interface ModalProps extends ViewComponentProps {
  closable?: boolean;
  movable?: boolean;
  fullScreen?: boolean;
  maskClosable?: boolean;
  header?: boolean;
  footer?: ReactNode | boolean;
  destroyOnClose?: boolean;
  okText?: ReactNode;
  cancelText?: ReactNode;
  onClose?: () => Promise<boolean | undefined>;
  onOk?: () => Promise<boolean | undefined>;
  onCancel?: () => Promise<boolean | undefined>;
  afterClose?: () => void;
  close?: () => void;
  okCancel?: boolean;
  drawer?: boolean;
  key?: Key;
  offsetRight?: number;
  type?: string;
}

export interface ModalState {
  okLoading: boolean;
  cancelLoading: boolean;
}

export default class Modal extends ViewComponent<ModalProps> {
  static displayName = 'Modal';

  static propTypes = {
    closable: PropTypes.bool,
    movable: PropTypes.bool,
    fullScreen: PropTypes.bool,
    maskClosable: PropTypes.bool,
    header: PropTypes.bool,
    footer: PropTypes.oneOfType([PropTypes.node, PropTypes.bool]),
    destroyOnClose: PropTypes.bool,
    okText: PropTypes.node,
    cancelText: PropTypes.node,
    onClose: PropTypes.func,
    onOk: PropTypes.func,
    onCancel: PropTypes.func,
    afterClose: PropTypes.func,
    okCancel: PropTypes.bool,
    drawer: PropTypes.bool,
    offsetRight: PropTypes.number,
    type: PropTypes.string,
    ...ViewComponent.propTypes,
  };

  static defaultProps = {
    prefixCls: `${Constants.PREFIX}-modal`,
    header: true,
    closable: false,
    movable: true,
    maskClosable: true,
    okCancel: true,
    drawer: false,
  };

  static key;
  static open;
  static confirm;
  static info;
  static success;
  static error;
  static warning;

  moveEvent: EventManager = new EventManager(document);

  offset?: [number | string | undefined, number | string | undefined];

  state: ModalState = {
    okLoading: false,
    cancelLoading: false,
  };

  getOtherProps() {
    return omit(super.getOtherProps(), [
      'closable',
      'movable',
      'maskClosable',
      'fullScreen',
      'title',
      'header',
      'footer',
      'close',
      'okText',
      'cancelText',
      'okCancel',
      'onClose',
      'onOk',
      'onCancel',
      'destroyOnClose',
      'drawer',
    ]);
  }

  getClassName(): string | undefined {
    const { prefixCls, style = {}, fullScreen, drawer } = this.props;

    return super.getClassName({
      [`${prefixCls}-center`]: !drawer && !('left' in style || 'right' in style) && !this.offset,
      [`${prefixCls}-fullscreen`]: fullScreen,
      [`${prefixCls}-drawer`]: drawer,
    });
  }

  render() {
    const { prefixCls } = this.props;
    const header = this.getHeader();
    const body = this.getBody();
    const footer = this.getFooter();
    return (
      <div {...this.getOtherProps()}>
        <div className={`${prefixCls}-content`}>
          {header}
          {body}
          {footer}
        </div>
      </div>
    );
  }

  componentWillUnmount() {
    this.moveEvent.clear();
  }

  @autobind
  handleHeaderMouseDown(downEvent: MouseEvent) {
    const { element } = this;
    if (element) {
      const { prefixCls } = this.props;
      const { clientX, clientY } = downEvent;
      const { offsetLeft, offsetTop } = element;
      this.moveEvent.addEventListener('mousemove', (moveEvent: MouseEvent) => {
        const { clientX: moveX, clientY: moveY } = moveEvent;
        classes(element).remove(`${prefixCls}-center`);
        const left = pxToRem(Math.max(offsetLeft + moveX - clientX, 0));
        const top = pxToRem(Math.max(offsetTop + moveY - clientY, 0));
        this.offset = [left, top];
        Object.assign(element.style, {
          left,
          top,
        });
      }).addEventListener('mouseup', () => {
        this.moveEvent.clear();
      });
    }
  }

  @autobind
  async handleOk() {
    const { onOk = noop } = this.props;
    this.setState({
      okLoading: true,
    });
    try {
      const ret = await onOk();
      this.setState({
        okLoading: false,
      });
      if (ret !== false) {
        this.close();
      }
    } catch (e) {
      warning(false, e);
      this.setState({
        okLoading: false,
      });
    }
  }

  @autobind
  async handleCancle() {
    const { onCancel = noop } = this.props;
    this.setState({
      cancelLoading: true,
    });
    try {
      const ret = await onCancel();
      this.setState({
        cancelLoading: false,
      });
      if (ret !== false) {
        this.close();
      }
    } catch (e) {
      Modal.warning(false, e);
      this.setState({
        cancelLoading: false,
      });
    }
  }

  getTitle(): ReactNode {
    const { title, prefixCls } = this.props;
    if (title) {
      return (
        <div className={`${prefixCls}-title`}>
          {title}
        </div>
      );
    }
  }

  getHeader(): ReactNode {
    const { prefixCls, closable, movable, fullScreen, drawer, header } = this.props;
    if (!!header) {
      const title = this.getTitle();
      const buttons = this.getHeaderButtons();
      if (title || closable || movable) {
        const headerProps: any = {
          className: classNames(`${prefixCls}-header`, {
            [`${prefixCls}-movable`]: movable && !fullScreen && !drawer,
          }),
        };
        if (movable && !fullScreen && !drawer) {
          headerProps.onMouseDown = this.handleHeaderMouseDown;
        }
        return (
          <div {...headerProps}>
            {title}
            {buttons}
          </div>
        );
      }
    }
  }

  getHeaderButtons(): ReactNode {
    const { prefixCls } = this.props;
    const closeButton = this.getCloseButton();
    if (closeButton) {
      return (
        <div className={`${prefixCls}-header-buttons`}>
          {closeButton}
        </div>
      );
    }
  }

  getCloseButton(): ReactNode {
    const { prefixCls, closable } = this.props;
    if (closable) {
      return (
        <button className={`${prefixCls}-header-button`} onClick={this.close}>
          <Icon type="close" />
        </button>
      );
    }
  }

  getBody(): ReactNode {
    const { children, prefixCls } = this.props;
    if (typeof children === 'function') {
      return (
        <div className={`${prefixCls}-body`} style={{ maxHeight: 'calc(100vh - 120px)' }}>
          {asyncComponent(children)}
        </div>
      );
    }
    if (children) {
      return (
        <div className={`${prefixCls}-body`} style={{ maxHeight: 'calc(100vh - 120px)' }}>
          {children}
        </div>
      );
    }
  }

  getFooter(): ReactNode {
    const { footer = this.getDefaultFooter(), prefixCls, drawer, header } = this.props;
    if (!isEmpty(footer, true)) {
      const className = classNames(`${prefixCls}-footer`, {
        [`${prefixCls}-footer-drawer`]: !!drawer,
        [`${prefixCls}-footer-without-border`]: !header,
      });
      return (
        <div className={className}>
          {header ? footer : this.getConfirmFooter()}
        </div>
      );
    }
  }

  getConfirmFooter() {
    const { okText = '确定', cancelText = '取消', type } = this.props;
    const { okLoading, cancelLoading } = this.state;
    const isConfirm = type === 'confirm';
    const cancelBtn = isConfirm ? (
      <Button onClick={this.handleCancle} loading={cancelLoading}>{cancelText}</Button>
    ) : (
      <Button
        funcType={FuncType.flat}
        color={ButtonColor.blue}
        onClick={this.handleOk}
        loading={okLoading}
      >
        {okText}
      </Button>
    );
    return (
      <div>
        {isConfirm && <Button color={ButtonColor.blue} onClick={this.handleOk} loading={okLoading}>{okText}</Button>}
        {cancelBtn}
      </div>
    );
  }

  getDefaultFooter() {
    const { okCancel, okText = '确定', cancelText = '取消' } = this.props;
    const { okLoading, cancelLoading } = this.state;
    return (
      <div>
        <Button color={ButtonColor.blue} onClick={this.handleOk} loading={okLoading}>{okText}</Button>
        {okCancel && <Button onClick={this.handleCancle} loading={cancelLoading}>{cancelText}</Button>}
      </div>
    );
  }

  @autobind
  close() {
    const { close = noop } = this.props;
    close();
  }
}
