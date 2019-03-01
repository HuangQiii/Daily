import { createObservable } from './handleObservable';
import Observable from './observable';

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

