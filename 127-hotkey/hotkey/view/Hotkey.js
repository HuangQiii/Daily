import React, { Component } from 'react';
import { Table, TextField, IntlField } from 'choerodon-hap-ui';
import Content from '../../../src/containers/components/page/Content';
import { HotkeyDataSet } from '../stores';

const { Column } = Table;

export default class Hotkey extends Component {
  handleOnKeyDown = (event) => {
    window.console.log('listening');
  }

  render() {
    return (
      <Content
        hotkeys={{
          hotkey_create: () => {
            window.console.log('[Hotkey module]: i emit hotkey ctrl + g');
          },
          hotkey_save: () => {
            window.console.log('[Hotkey module]: i emit hotkey ctrl + s');
          },
        }}
      >
        <Table dataSet={HotkeyDataSet} buttons={['add', 'save', 'delete']} border={false}>
          <Column name="code" />
          <Column name="hotkey" editor={<TextField onChange={this.handleOnKeyDown} />} />
          <Column name="description" editor={<IntlField />} />
        </Table>
      </Content>
    );
  }
}
