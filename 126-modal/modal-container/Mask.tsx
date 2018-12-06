import React from 'react';
import ViewComponent, { ViewComponentProps } from '../core/ViewComponent';
import Constants from '../util/Constants';

export default class Mask extends ViewComponent<ViewComponentProps> {
  static displayName = 'Mask';

  static defaultProps = {
    prefixCls: `${Constants.PREFIX}-mask`,
  };

  render() {
    return <div {...this.getOtherProps()} />;
  }
}
