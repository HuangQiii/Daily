import * as React from 'react';
import RippleChild from './RippleChild';
import Constants from '../util/Constants';

export interface RippleProps {
  prefixCls?: string;
}

export default class Ripple extends React.Component<RippleProps> {

  static defaultProps = {
    prefixCls: `${Constants.PREFIX}-ripple`,
  };

  render() {
    const { children } = this.props;
    if (!children) {
      return null;
    }
    return React.Children.map(children, this.rippleChild);
  }

  rippleChild = (child: React.ReactChild) => {
    return <RippleChild prefixCls={this.props.prefixCls}>{child}</RippleChild>;
  };
}
