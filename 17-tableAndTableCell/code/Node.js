import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { Icon } from 'choerodon-hap-ui';
import { Dropdown, Menu } from 'choerodon-ui';
import classNames from 'classnames';
import DataSourceStore from './stores';

@observer
export default class TableNode extends Component {
  handleOnClick() {
    const { onClick } = this.props;
    if (onClick) {
      onClick();
    }
  }

  handleClickAdd(visible) {
    if (visible) {
      if (DataSourceStore.shouldLoadingRelationTables) {
        DataSourceStore.getRelationTables();
      }
    }
  }

  handleAdd(parentNode, { key }) {
    const { tableDS } = this.props;
    DataSourceStore.addNode(parentNode, {
      key,
    });
    const currentRecordId = tableDS.current.id;
    const created = tableDS.create();
    created.set('tableKey', key);
    created.set('parentKey', parentNode.key);
    const index = tableDS.findIndex(r => r.id === currentRecordId);
    if (index !== -1) {
      tableDS.locate(index);
    }
  }

  handleDelete(node, parentNode, e) {
    e.stopPropagation();
    const { tableDS } = this.props;
    DataSourceStore.deleteNode(node, parentNode);
    const record = tableDS.find(r => r.get('tableKey') === node.key);
    const parentIndex = tableDS.findIndex(r => r.get('tableKey') === parentNode.key);
    if (parentIndex !== -1 && record) {
      DataSourceStore.setCurrentTable(parentNode);
      tableDS.locate(parentIndex);
      tableDS.remove(record);
    }
  }

  render() {
    const { node, isMain, isActive, parentNode } = this.props;
    const className = classNames('tree-node-inner', {
      'tree-node-inner-active': isActive,
    });

    return (
      <div
        className={className}
        role="none"
        onClick={this.handleOnClick.bind(this)}
      >
        <div className="title">
          {node.title}
        </div>
        <div className="sub-title">
          {node.key}
        </div>
        <div className="graph-tools">
          <Dropdown
            onVisibleChange={this.handleClickAdd.bind(this)}
            overlay={(
              <Menu onClick={this.handleAdd.bind(this, node)}>
                {
                  DataSourceStore.relationTables.map(rt => (
                    <Menu.Item key={rt.code}>
                      <span>{rt.title}</span>
                    </Menu.Item>
                  ))
                }
              </Menu>
            )}
            trigger={['click']}
          >
            <Icon type="add_circle" style={{ background: '#fff' }} />
          </Dropdown>
          {!isMain && !node.children.length && <Icon type="remove_circle" style={{ background: '#fff' }} onClick={this.handleDelete.bind(this, node, parentNode)} />}
        </div>
        {!isMain && <i className="inner-join" />}
      </div>
    );
  }
}
