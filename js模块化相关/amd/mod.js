function getRandom() {
  return Math.random().toString(32).substr(2);
}

function Mod(loadjs, id, exact) {
  this.id = id;
  this.path = loadjs._urlUtil.fixUrl(id);
  this.shim = undefined;
  this.deps = [];
  this.depsObj = [];
  var uniqModule = loadjs._config.module[id];
  if (uniqModule) {
    if (uniqModule.path)
      this.path = loadjs._urlUtil.fixUrl(uniqModule.path);
    if (uniqModule.shim) this.shim = uniqModule.shim;
    if (uniqModule.exact) exact = true;
    if (uniqModule.deps)
      this.deps = [].concat(
        typeof uniqModule.deps === 'string'
          ? [uniqModule.deps]
          : uniqModule.deps
      );
  }
  this._id = exact ? id : this.path;
  var mod = loadjs._rootMod.loadMod(this._id);

  if (mod) {
    if (mod.status === Mod.status.loadedAllDeps)
      mod._loadjs.emit(mod._loadjs.EVENT.MOD_LOADED, mod);
    return mod;
  }
  this.STATUS = Mod.status;
  this._loadjs = loadjs;
  this.hasRequested = false;
  this.hasExecutedCb = false;
  this.hasInited = false;
  this.exports = {};
  this.status = Mod.status.pending;
  this._loadjs.emit(this._loadjs.EVENT.REGISTER_MOD, this);
  var self = this;
  if (this.shim) {
    if (this.deps.length) {
      loadjs.on(loadjs.EVENT.MOD_LOADED, function (mod) {
        var flag = false;
        self.depsObj.forEach(function (depObj) {
          if (depObj._id === mod._id) {
            flag = true;
          }
        });
        if (flag) {
          var hasloaded = self.hasAllDepsLoaded();
          if (hasloaded) {
            self.request();
          }
        }
      });
      this.deps.forEach(function (dep, index) {
        var mod = new Mod(self._loadjs, dep);
        self.depsObj.push(mod);
      });
    } else {
      self.request();
    }
  }
}

Mod.prototype.initMod = function (deps, cbFn) {
  if (this.hasInited) return;
  deps = deps || [];
  this.hasInited = true;
  var self = this;
  var loadjs = this._loadjs;
  this.status = Mod.status.resolved;
  this.deps = [].concat(deps);
  loadjs.on(loadjs.EVENT.MOD_LOADED, function (mod) {
    var flag = false;
    self.depsObj.forEach(function (depObj) {
      if (depObj._id === mod._id) {
        flag = true;
      }
    });
    if (flag) {
      self.checkDepsLoaded(cbFn);
    }
  });
  this.deps.forEach(function (dep, index) {
    var mod = new Mod(self._loadjs, dep);
    if (!mod.shim) {
      mod.request();
    }
    self.depsObj.push(mod);
  });
  if (!this.depsObj.length) this.checkDepsLoaded(cbFn);
  return this;
};

Mod.prototype.hasAllDepsLoaded = function () {
  var self = this;
  var flag = true;
  var i, mod;
  for (i = this.depsObj.length; i--;) {
    mod = this.depsObj[i];
    if (mod.status !== Mod.status.loadedAllDeps) {
      flag = false;
      break;
    }
  }
  return flag;
};

Mod.prototype.checkDepsLoaded = function (cbFn) {
  var flag =
    this.status === Mod.status.loadedAllDeps || this.hasAllDepsLoaded();
  if (flag && !this.hasExecutedCb) {
    this.status = Mod.status.loadedAllDeps;
    this.hasExecutedCb = true;
    this.exports = cbFn
      ? cbFn(
        ...this.depsObj.map(function (dep) {
          return dep.exports;
        })
      )
      : {};
  }
  if (flag) this._loadjs.emit(this._loadjs.EVENT.MOD_LOADED, this);
};

Mod.prototype.request = function () {
  if (this.hasRequested || this._loadjs._rootMod.getModByReqCache(this.path))
    return false;
  this.hasRequested = true;
  this._loadjs.emit(this._loadjs.EVENT.MOD_REQUESTED, this);
  var self = this;
  var scriptElem = document.createElement('script');
  scriptElem.onload = function (e) {
    document.body.removeChild(scriptElem);
    var shim = self.shim;
    if (shim) {
      var cbFn =
        typeof shim === 'function'
          ? shim
          : function () {
            return window[shim];
          };
      self.checkDepsLoaded(cbFn);
    }
  };
  scriptElem.onerror = function (e) { };
  scriptElem.src = this.path;
  scriptElem.setAttribute('crossorigin', 'anonymous');
  document.body.appendChild(scriptElem);
  return true;
};

Mod.status = {
  pending: getRandom(),
  resolved: getRandom(),
  rejected: getRandom(),
  loadedAllDeps: getRandom(),
};

module.exports = Mod;
