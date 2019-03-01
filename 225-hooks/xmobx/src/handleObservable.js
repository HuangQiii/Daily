import Observable from './observable';

const createObservableProperty = (target, property) => {
  const observable = new Observable(target[property]);
  Object.defineProperty(target, property, {
    get: function get() {
      return observable.get();
    },
    set: function set(value) {
      return observable.set(value);
    }
  });
  if (typeof target[property] === 'object') {
    for (let i in target[property]) {
      if (target[property].hasOwnProperty[i]) {
        createObservableProperty(target[property], i);
      }
    }
  }
}

const createObservable = (target) => {
  for (let i in target) {
    if (target.hasOwnProperty(i)) {
      createObservableProperty(target, i);
    }
  }
}

const extendObserver = (target, obj) => {
  for (let i in obj) {
    if (obj.hasOwnProperty(i)) {
      target[i] = obj[i];
      createObservableProperty(target, i);
    }
  }
}

export {
  extendObserver,
  createObservable,
};
