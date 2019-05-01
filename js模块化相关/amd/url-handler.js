const url = require('url');

function urlHandler(loadjs) {
  this._loadjs = loadjs;
}

urlHandler.prototype.fixUrl = function (depUrl) {
  var baseUrl = url.resolve(
    location.href,
    this._loadjs._config.baseUrl || './'
  );
  depUrl = url.resolve(baseUrl, depUrl);
  if (!/\.js$/.test(depUrl)) {
    depUrl = depUrl + '.js';
  }
  return depUrl;
};

module.exports = urlHandler;
