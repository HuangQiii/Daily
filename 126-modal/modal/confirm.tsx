import React from 'react';
import { ModalProps } from './Modal';
import { getKey, open } from '../modal-container/ModalContainer';
import Constants from '../util/Constants';
import Icon from '../icon';
import noop from '../util/noop';

export default function confirm(props: ModalProps & { iconType?: string, type?: string, children } | string) {
  if (typeof props === 'string') {
    props = {
      children: props,
    };
  }
  const {
    children, type = 'confirm', onOk = noop, onCancel = noop,
    iconType = 'error', header= false, ...otherProps,
  } = props;
  const prefixCls = `${Constants.PREFIX}-confirm`;
  return new Promise((resolve) => {
    open({
      key: getKey(),
      title: '提示',
      header,
      type,
      destroyOnClose: true,
      okCancel: true,
      closable: false,
      movable: false,
      style: { width: '4rem' },
      children: (
        <table className={prefixCls}>
          <tbody>
          <tr>
            <td className={`${prefixCls}-icon ${prefixCls}-${type}`}>
              <Icon type={iconType} />
            </td>
            <td>{children}</td>
          </tr>
          </tbody>
        </table>
      ),
      onOk: async () => {
        const result = await onOk();
        if (result !== false) {
          resolve('ok');
        }
        return result;
      },
      onCancel: async () => {
        const result = await onCancel();
        if (result !== false) {
          resolve('cancel');
        }
        return result;
      },
      ...otherProps,
    });
  });
}
