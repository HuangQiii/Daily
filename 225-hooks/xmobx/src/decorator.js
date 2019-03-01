import { createObservable } from './handleObservable';
import Observable from './observable';
import Computed from './computed';
import autorun from './autorun';

function observable(target, name, descriptor) {
  var v = descriptor.initializer.call(this);
  if (typeof v === 'object') {
    createObservable(v);
  }
  var observable = new Observable(v);
  return {
    enumerable: true,
    configurable: true,
    get: function() {
      return observable.get();
    },
    set: function() {
      if (typeof v === 'object') {
        createObservable(v);
      }
      return observable.set(v);
    }
  }
}

function computed(target, name, descriptor) {
  const getter = descriptor.get;
  var computed = new Computed(target, getter);
  return {
    enumerable: true,
    configurable: true,
    get: function() {
      computed.target = this;
      return computed.get();
    }
  };
}

var ReactMixin = {
  componentWillMount: function() {
    autorun(() => {
      this.render();
      this.forceUpdate();
    });
  }
};

function observer(target) {
  const cmpComponentWillMount = target.prototype.componentWillMount;
  target.prototype.componentWillMount = function() {
    if (cmpComponentWillMount) {
      cmpComponentWillMount.call(this);
      ReactMixin.componentWillMount.call(this);
    }
  }
}

export {
  observer,
  observable,
  computed,
};
