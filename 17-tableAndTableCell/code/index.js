import React, { Component } from 'react';
import { DataSet, Button } from 'choerodon-hap-ui';
import { Content } from 'choerodon-hap-front-boot';
import Graph from './TreeGraph';
import Msg from './Msg';
import TableDataSet from './stores/TableDataSet';
import AssociatedDataSet from './stores/AssociatedDataSet';
import AssociatedStore from './stores/Associated';
import FieldDataSet from './stores/FieldDataSet';
import LovDataSet from './stores/LovDataSet';
import LookupDataSet from './stores/LookupDataSet';
import OtherParamsDataSet from './stores/OtherParamsDataSet';
import AddedLovDataSet from './stores/AddedLovDataSet';
import AddedLovGroupDataSet from './stores/AddedLovGroupDataSet';
import AddedLookupDataSet from './stores/AddedLookupDataSet';
import './index.less';

export default class Index extends Component {
  constructor(props) {
    super(props);
    this.associatedDS = new DataSet(AssociatedDataSet);
    this.tableDS = new DataSet({
      ...TableDataSet,
      children: {
        associatedDS: this.associatedDS,
      },
    });
    this.fieldDS = new DataSet(FieldDataSet); //
    this.LovDS = new DataSet(LovDataSet); //
    this.lookupDS = new DataSet(LookupDataSet); //
    this.otherParamsDS = new DataSet(OtherParamsDataSet); //
    this.addedLovDS = new DataSet(AddedLovDataSet); //
    this.addedLovGroupDS = new DataSet(AddedLovGroupDataSet); //
    this.addedLookupDS = new DataSet(AddedLookupDataSet); //
    this.queryFieldDS = new DataSet(FieldDataSet); //
    this.queryAddedLovDS = new DataSet(AddedLovDataSet); //
  }

  componentDidMount() {
    this.loadPretendData();
  }

  loadPretendData() {
    const { tableDS } = this;
    const created0 = tableDS.create();
    created0.set('tableKey', 'act_demo_vacation');
    created0.set('parentKey', undefined);
    const created1 = tableDS.create();
    created1.set('tableKey', 'act_evt_log');
    created1.set('parentKey', 'act_demo_vacation');
    created1.set('association', 'act_demo_vacation.id = act_evt_log.id');
    const created2 = tableDS.create();
    created2.set('tableKey', 'act_exception');
    created2.set('parentKey', 'act_demo_vacation');
    created2.set('association', 'act_demo_vacation.id = act_exception.id');
    tableDS.locate(2);

    AssociatedStore.loadFieldAndSet(tableDS.current.get('tableKey'));
  }

  handleClickSave() {
    const { otherParamsDS, fieldDS, addedLookupDS, addedLovGroupDS, queryFieldDS } = this;
    const otherParamObj = otherParamsDS.current.toJSONData();
    const fieldsObj = fieldDS.data.map(r => r.toJSONData());
    const lovObj = addedLovGroupDS.data.map(r => r.toJSONData());
    const lookupObj = addedLookupDS.data.map(r => r.toJSONData());
    const queryObj = queryFieldDS.data.map(r => r.toJSONData());
    const result = {
      ...otherParamObj,
      fields: [
        ...fieldsObj,
        ...lovObj,
        ...lookupObj,
      ],
      queryFields: [
        ...lovObj,
        ...queryObj,
        ...lookupObj,
      ],
    };
    window.console.log(result);
  }

  render() {
    return (
      <Content style={{ padding: 0 }}>
        <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
          <div className="borad-wrap">
            <Graph tableDS={this.tableDS} />
            <Msg
              tableDS={this.tableDS}
              associatedDS={this.associatedDS}
              fieldDS={this.fieldDS}
              addedLovDS={this.addedLovDS}
              addedLovGroupDS={this.addedLovGroupDS}
              addedLookupDS={this.addedLookupDS}
              otherParamsDS={this.otherParamsDS}
              queryFieldDS={this.queryFieldDS}
              queryAddedLovDS={this.queryAddedLovDS}
            />
          </div>
          <div className="toolbar" style={{ borderTop: '1px solid #d3d3d3', padding: '9px 24px' }}>
            <Button color="blue" onClick={this.handleClickSave.bind(this)}>保存</Button>
            <Button>取消</Button>
          </div>
        </div>
      </Content>
    );
  }
}
