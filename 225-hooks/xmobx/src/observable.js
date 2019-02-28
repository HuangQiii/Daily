import manager from './manager';
import isArray from '../utils/isArray';
import getKey from '../utils/kenGen';

export default class Observable {
  obID;
  value;

  constructor(value) {
    this.obID = getKey();

    if (isArray(value)) {
      this._setArrayProxy(value);
    } else {
      this.value = value;
    }
  }

  get() {
    manager.collect(this.obID);
    return this.value;
  }

  set(value) {
    if (isArray(value)) {
      this._setArrayProxy(value);
    } else {
      this.value = value;
    }
    manager.trigger(this.obID);
  }

  _setArrayProxy(array) {
    this.value = new Proxy(array, {
      set: (obj, key, value) => {
        obj[key] = value;
        if (key != 'length') {
          manager.trigger(this.obID);
        }
        return true;
      }
    });
  }
}
