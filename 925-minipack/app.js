#! /user/bin/env node

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const ora = require('ora');
const projectPath = process.cwd();
const bundleFile = require('./index');

const configPath = path.join(projectPath, 'minipack.config.js');

function init() {
  const spinner = ora('Start bundle...');
  spinner.start();

  if(!fs.existsSync(configPath)) {
    spinner.stop();
    chalk.red('Error: Can not find minipack.config.js.');
  }

  const config = require(configPath);

  const result = bundleFile(config);

  try {
    fs.writeFileSync(path.join(projectPath, config.output), result);
  } catch (e) {
    fs.mkdirSync(path.dirname(config.output));
    fs.writeFileSync(path.join(projectPath, config.output), result);
  }

  spinner.stop();
  chalk.yellow('Success.');
}

init();
