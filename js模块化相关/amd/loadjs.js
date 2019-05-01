// study from https://github.com/lcfme/browser-module.git

const { EventEmitter } = require('events');
const { inherits } = require('util');

const Mod = require('./mod');
const RootMod = require('./rootMod');
const urlHandler = require('./url-handler');

function getRandom() {
  return Math.random().toString(32).substr(2);
}

function Loadjs() {
  this.EVENT = Loadjs.EVENT;
  this._config = {
    baseUrl: './',
    module: {}
  };
  this._rootMod = new RootMod(this);
  this._urlUtil = new urlHandler(this);
}

inherits(Loadjs, EventEmitter);

Loadjs.prototype.require = function (id, deps, cbFn) {
  var currentScriptSrc = document.currentScript
    ? document.currentScript.src
    : getRandom();
  var exact = false;
  if (typeof id === 'string' && typeof cbFn === 'function') {
    exact = true;
  }
  if (typeof id === 'function') {
    cbFn = id;
    deps = [];
    id = currentScriptSrc;
  }
  if (typeof deps === 'function') {
    cbFn = deps;
    deps = id;
    id = currentScriptSrc;
  }

  if (typeof deps === 'string') {
    deps = [deps];
  }
  if (!deps) {
    deps = [];
  }
  var mod = new Mod(this, id, exact);
  mod.initMod(deps, cbFn);
  return mod;
};

Loadjs.prototype.config = function (config) {
  this._config.baseUrl = config.baseUrl || this._config.baseUrl;
  this._config.module = Object.assign(this._config.module, config.module);
  return this;
};

Loadjs.EVENT = {
  MOD_LOADED: getRandom(),
  REGISTER_MOD: getRandom(),
  MOD_REQUESTED: getRandom(),
};

const loadjs = new Loadjs();

module.exports = function (id, deps, cbFn) {
  return loadjs.require(id, deps, cbFn);
};

exports = module.exports;

exports.config = function (config) {
  return loadjs.config(config);
};

exports.getSelf = function () {
  return loadjs;
};