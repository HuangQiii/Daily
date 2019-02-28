import getLast from '../utils/getLast';

let isCollecting = false;
const observerStack = [];
const targetStack = [];
let currentObserver;
let currentTarget;

export default manager = {
  _store: {},

  _addCurrentObserver(obID) {
    this._store[obID] = this._store[obID] || {};
    this._store[obID].target = currentTarget;
    this._store[obID].watchers = this._store[obID].watchers || [];
    this._store[obID].watchers.push(currentObserver);
  },

  trigger(obID) {
    var res = this._store[obID];
    if (res && res.watchers) {
      res.watchers.forEach((watcher) => {
        watcher.call(res.target || this);
      });
    }
  },

  startCollect(observer, target) {
    idCollecting = true;
    observerStack.push(observer);
    targetStack.push(target);
    currentObserver = getLast(observerStack);
    currentTarget = getLast(targetStack);
  },

  collect(obID) {
    if (currentObserver) {
      this._addCurrentObserver(obID);
    }
    return false;
  },

  finishCollect() {
    isCollecting = false;
    observerStack.pop();
    targetStack.pop();
    currentObserver = getLast(observerStack);
    currentTarget = getLast(targetStack);
  }
};


