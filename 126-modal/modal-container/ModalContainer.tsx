import React, { Component, Fragment } from 'react';
import { createPortal, render } from 'react-dom';
import { withRouter } from 'react-router';
import { observer } from 'mobx-react';
import classNames from 'classnames';
import findLast from 'lodash/findLast.js';
import { action, get, observable, runInAction, set } from 'mobx';
import Modal, { ModalProps } from '../modal/Modal';
import Animate from '../animate/Animate';
import Mask from './Mask';
import noop from '../util/noop';
import { measureScrollbar } from '../util/Measure';
import { pxToRem } from '../util/UnitConvertor';
import warning from '../util/warning';

const { prefixCls } = Modal.defaultProps;

const KeyGen = function* (id) {
  while (true) {
    yield `${prefixCls}-${id++}`;
  }
}(1);

let root;
let containerInstanse;
let defaultBodyStyle: { overflow, paddingRight } | undefined;

function hideBodyScrollBar() {
  const { style } = document.body;
  if (!defaultBodyStyle) {
    defaultBodyStyle = {
      overflow: style.overflow,
      paddingRight: style.paddingRight,
    };
    style.overflow = 'hidden';
    style.paddingRight = pxToRem(measureScrollbar()) || null;
  }
}

function showBodyScrollBar() {
  const { style } = document.body;
  if (defaultBodyStyle) {
    const { overflow, paddingRight } = defaultBodyStyle;
    defaultBodyStyle = void 0;
    style.overflow = overflow;
    style.paddingRight = paddingRight;
  }
}

@withRouter
@observer
export default class ModalContainer extends Component<any> {
  static displayName = 'ModalContainer';

  @observable modals: ModalProps[];

  constructor(props, context) {
    super(props, context);
    containerInstanse = this;
    runInAction(() => {
      this.modals = [];
    });
  }

  @action
  handleAnimationEnd = (modalKey, isEnter) => {
    if (!isEnter) {
      const { modals } = this;
      const index = this.findIndex(modalKey);
      if (index !== -1) {
        const props = modals[index];
        modals.splice(index, 1);
        if (!props.destroyOnClose) {
          modals.unshift(props);
        }
        if (props.afterClose) {
          props.afterClose();
        }
      }
    }
  };

  handleMaskClick = () => {
    const modal = findLast(this.modals, ({ hidden }) => !hidden);
    if (modal) {
      const { close = noop, maskClosable } = modal;
      if (maskClosable) {
        close();
      }
    }
  };

  componentWillUpdate(nextProps) {
    const { location } = nextProps;
    if (location && location.pathname !== this.props.location.pathname) {
      this.clear();
    }
  }

  componentWillUnmount() {
    containerInstanse = null;
  }

  findIndex(modalKey) {
    return this.modals.findIndex(({ key }) => key === modalKey);
  }

  @action
  open(props: ModalProps) {
    if (!props.key) {
      props.key = getKey();
      warning(!!props.destroyOnClose, `The modal which opened has no key, please provide a key or set the \`destroyOnClose\` as true.`);
    } else {
      const index = this.findIndex(props.key);
      if (index !== -1) {
        this.modals.splice(index, 1);
      }
    }
    this.modals.push(props);
  }

  @action
  close(props: ModalProps) {
    const target = this.modals.find(({ key }) => key === props.key);
    if (target) {
      set(Object.assign(target, props), 'hidden', true);
    }
  }

  @action
  clear() {
    this.modals.forEach(modal => this.close({ ...modal, destroyOnClose: true }));
  }

  getOffset(modals, idx) {
    const MARGIN_RIGHT_ARRAY: any = [];
    const DEFAULT = 150;
    const drawers = modals.filter(modal => modal.drawer && !modal.hidden);
    const indexInDrawers = drawers.findIndex(drawer => drawer.key === modals[idx].key);
    if (indexInDrawers === -1) {
      return 0;
    }
    for (let i = drawers.length - 1; i >= indexInDrawers; i--) {
      if (i === drawers.length - 1) {
        MARGIN_RIGHT_ARRAY.push(0);
      } else {
        const CURRENT_WIDTH = this.getModalWidth(drawers[i]);
        const NEXT_WIDTH = this.getModalWidth(drawers[i + 1]);
        const NEXT_MARGIN = MARGIN_RIGHT_ARRAY[drawers.length - i - 2];
        if (CURRENT_WIDTH >= NEXT_MARGIN + NEXT_WIDTH + DEFAULT) {
          MARGIN_RIGHT_ARRAY.push(0);
        } else {
          MARGIN_RIGHT_ARRAY.push(NEXT_MARGIN + NEXT_WIDTH + DEFAULT - CURRENT_WIDTH);
        }
      }
    }
    return MARGIN_RIGHT_ARRAY[MARGIN_RIGHT_ARRAY.length - 1];
  }

  getModalWidth(modal) {
    return (modal && modal.style && modal.style.width || 520);
  }

  getComponent() {
    let hidden = true;
    const { modals } = this;
    const items = modals.map((props, index) => {
      const thisHidden = get(props, 'hidden');
      if (hidden && !thisHidden) {
        hidden = false;
      }
      const newProps: any = {};
      if (props.drawer) {
        newProps.style = {
          marginRight: this.getOffset(modals, index),
          ...props.style,
        };
      }
      if (index === modals.length - 1) {
        newProps.className = classNames(props.className, `${prefixCls}-active`);
      }
      return (
        <Animate
          key={props.key}
          component="div"
          transitionAppear
          // transitionLeave
          transitionName={props.drawer ? 'slide-right' : 'zoom'}
          hiddenProp="hidden"
          onEnd={this.handleAnimationEnd}
        >
          <Modal key={props.key} {...props} {...newProps} />
        </Animate>
      );
    });
    const animationProps: any = {};
    if (typeof window !== 'undefined') {
      if (hidden) {
        animationProps.onEnd = showBodyScrollBar;
      } else {
        hideBodyScrollBar();
      }
    }
    return (
      <Fragment>
        <Animate
          component=""
          transitionAppear
          transitionName="fade"
          hiddenProp="hidden"
          {...animationProps}
        >
          <Mask hidden={hidden} onClick={this.handleMaskClick} />
        </Animate>
        {items}
      </Fragment>
    );
  };

  render() {
    const mount = getRoot();
    if (mount) {
      return createPortal(
        this.getComponent(),
        mount,
      );
    } else {
      return null;
    }
  }
}

function getRoot() {
  if (typeof window !== 'undefined') {
    const doc = window.document;
    if (root) {
      if (!root.parentNode) {
        doc.body.appendChild(root);
      }
    } else {
      root = doc.createElement('div');
      root.className = `${prefixCls}-container`;
      doc.body.appendChild(root);
    }
  }
  return root;
}

export function getContainer() {
  if (containerInstanse) {
    return containerInstanse;
  } else {
    render(<ModalContainer />, getRoot());
    return containerInstanse;
  }
}

export function open(props: ModalProps & { children }) {
  const container = getContainer();

  async function close(destroy?: boolean) {
    const { onClose = noop } = props;
    if (await onClose() !== false) {
      if (destroy) {
        container.close({ ...props, destroyOnClose: true });
      } else {
        container.close(props);
      }
    }
  }

  function show() {
    container.open(props);
  }

  props = {
    close,
    ...Modal.defaultProps,
    ...props,
  };
  container.open(props);

  return {
    close,
    open: show,
  };
}

export function getKey(): string {
  return KeyGen.next().value;
}
