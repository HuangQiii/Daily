import { DataSet } from 'choerodon-hap-ui';
import updateHotkeys from '../../../src/containers/components/util/updateHotkeys.js';

const HotkeyDataSet = new DataSet({
  name: 'Hotkey',
  autoQuery: true,
  autoLocate: false,
  primaryKey: 'hotkeyId',
  fields: [
    { name: 'hotkeyId', type: 'number', label: '热键ID' },
    { name: 'code', type: 'string', label: '热键编码', required: true },
    { name: 'hotkeyLevel', type: 'string', label: '热键级别', defaultValue: 'SYSTEM' },
    { name: 'hotkeyLevelId', type: 'number', label: '热键级别 ID' },
    { name: 'hotkey', type: 'string', label: '热键' },
    { name: 'description', type: 'string', label: '热键描述' },
  ],
  events: {
    submitSuccess: ({ dataSet, data }) => {
      const { success, rows, total } = data;
      if (success && total > 0) {
        updateHotkeys(rows);
      }
    },
  },
});

export default HotkeyDataSet;
