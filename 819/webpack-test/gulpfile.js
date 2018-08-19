const gulp = require('gulp');
const webpack = require('webpack');
const UglifyJs = require('uglifyjs-webpack-plugin');
const dev_config = require('./webpack.config');

const dev_config_plugins = dev_config.plugins;
dev_config_plugins.push(new UglifyJSPlugin({
  compress: {
    warnings: false,
    drop_console: true,
    collapse_vars: true,
    reduce_vars: true,
  },
  output: {
    beautify: false,
    comments: false,
  },
}));
const pro_config = Object.assign({}, dev_config, {
  mode: 'production',
  devtool: false,
  plugins: dev_config_plugins,
});
const compiler = webpack(pro_config);
gulp.task('webpack', function(cb) {
  compiler.run(function(err, stats) {
    if (!err) {
      cb();
    }
  });
});