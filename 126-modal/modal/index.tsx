import Modal from './Modal';
import { open, getKey } from '../modal-container/ModalContainer';
import confirm from './confirm';
import { isValidElement } from 'react';

function normalizeProps(props) {
  if (typeof props === 'string' || isValidElement(props)) {
    return {
      children: props,
    };
  }
  return props;
}

Modal.key = getKey;
Modal.open = open;
Modal.confirm = confirm;
Modal.info = function (props) {
  return confirm({
    type: 'info',
    iconType: 'info',
    okCancel: false,
    ...normalizeProps(props),
  });
};
Modal.success = function (props) {
  return confirm({
    type: 'success',
    title: '成功',
    iconType: 'check_circle',
    okCancel: false,
    ...normalizeProps(props),
  });
};
Modal.error = function (props) {
  return confirm({
    type: 'error',
    title: '错误',
    iconType: 'cancel',
    okCancel: false,
    ...normalizeProps(props),
  });
};
Modal.warning = function (props) {
  return confirm({
    type: 'warning',
    title: '警告',
    iconType: 'warning',
    okCancel: false,
    ...normalizeProps(props),
  });
};

export default Modal;
