import manager from './manager';
import getKey from '../utils/kenGen';

export default class Computed {
  cpID;
  value;

  getter;
  target;

  bind;

  constructor(target, getter) {
    this.cpID = getKey();
    this.target = target;
    this.getter = getter;
  }

  _reCommpute() {
    this.value = this.getter.call(this.target);
    manager.trigger(this.cpID);
  }

  _bindAutoCompute() {
    if (!this.bind) {
      this.bind = true;
      manager.startCollect(this._reCommpute, this)
      this._reCompute();
      manager.finishCollect();
    }
  }

  get() {
    this._bindAutoCompute();
    manager.collect(this.cpID);
    return this.value;
  }
}