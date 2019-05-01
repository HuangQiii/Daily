function RootMod(loadjs) {
  var self = this;
  this._loadjs = loadjs;
  this.mods = {};
  this._urlcache = {};
  loadjs.on(loadjs.EVENT.REGISTER_MOD, function (mod) {
    self.mods[mod._id] = mod;
  });
  loadjs.on(loadjs.EVENT.MOD_LOADED, function (mod) {
    self.mods[mod._id] = mod;
  });
  loadjs.on(loadjs.EVENT.MOD_REQUESTED, function (mod) {
    self._urlcache[mod.path] = mod;
  });
}

RootMod.prototype.getModByReqCache = function (path) {
  var mod = this._urlcache[path];
  return mod;
};

RootMod.prototype.loadMod = function (_id) {
  var mod = this.mods[_id];
  return mod;
};

module.exports = RootMod;
