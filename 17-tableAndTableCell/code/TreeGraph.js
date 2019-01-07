import React, { Component } from 'react';
import { observer } from 'mobx-react';
import classNames from 'classnames';
import Node from './Node';
import DataSourceStore from './stores';
import AssociatedStore from './stores/Associated';

@observer
export default class DataSource extends Component {
  handleClickNode(node) {
    DataSourceStore.setCurrentTable(node);
    const index = this.props.tableDS.findIndex(r => r.get('tableKey') === node.key);
    if (index !== -1) {
      this.props.tableDS.locate(index);
      AssociatedStore.loadFieldAndSet(node.key);
    }
  }

  renderTree() {
    const treeData = DataSourceStore.tables;
    if (!treeData.length) {
      return null;
    }
    return (
      <div
        style={{ 
          display: 'table-cell',
          textAlign: 'center',
          verticalAlign: 'middle',
        }}
      >
        <div style={{ display: 'inline-block', textAlign: 'left' }}>
          <Node
            level={0}
            node={treeData[0]}
            parentNode={null}
            isMain
            isLast
            isActive={DataSourceStore.currentTableCode === treeData[0].key}
            onClick={this.handleClickNode.bind(this, treeData[0])}
            tableDS={this.props.tableDS}
          />
          <div className="tree-node-children">
            {treeData[0].children.map((n, i) => this.renderTreeNode(n, 1, i === treeData[0].children.length - 1, treeData[0]))}
          </div>
        </div>
      </div>
    );
  }

  renderTreeNode(treeNode, level, isLast, parentNode) {
    const className = classNames('tree-node', {
      'tree-node-not-last': !isLast,
    });
    if (treeNode.children && treeNode.children.length) {
      return (
        <div className={className}>
          <Node
            level={level}
            node={treeNode}
            parentNode={parentNode}
            isMain={false}
            isLast={isLast}
            isActive={DataSourceStore.currentTableCode === treeNode.key}
            onClick={this.handleClickNode.bind(this, treeNode)}
            tableDS={this.props.tableDS}
          />
          <div className="tree-node-children">
            {treeNode.children.map((tn, i) => this.renderTreeNode(tn, level + 1, i === treeNode.children.length - 1, treeNode))}
          </div>
        </div>
      );
    }
    return (
      <div className={className}>
        <Node
          level={level}
          node={treeNode}
          parentNode={parentNode}
          isMain={false}
          isLast={isLast}
          isActive={DataSourceStore.currentTableCode === treeNode.key}
          onClick={this.handleClickNode.bind(this, treeNode)}
          tableDS={this.props.tableDS}
        />
      </div>
    );
  }

  render() {
    return (
      <div className="graph-wrap">
        <div
          style={{
            textAlign: 'center',
            height: '100%',
            width: '100%',
            display: 'table',
            verticalAlign: 'middle',
          }}
        >
          {this.renderTree()}
        </div>
      </div>
    );
  }
}
