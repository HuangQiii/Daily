#!/usr/bin/env node

import path from 'path';
import fs from 'fs-extra';
import getAllSubModules from './getAllSubModules';
import getPackagePath from './getPackagePath';
import getServiceModuleManager from './serviceModuleManager';

const babelParse = require('@babel/parser').parse;
const traverse = require('babel-traverse').default;

function packRouteObj(res, packageInfo) {
  const result = [];
  res.forEach(({ routePath, component }) => {
    if (routePath === '*') {
      return;
    }
    const serviceModuleManager = getServiceModuleManager();
    const module = packageInfo.name;
    const service = serviceModuleManager.getServiceByModule(module);
    const routeObj = {
      path: `${packageInfo.routeName || packageInfo.name}${routePath}`,
      service,
      module,
      code: `${service}.${module}.${component}`,
    };
    result.push(routeObj);
  });
  return result;
}

function getMsgFromFileOfAST(routePath, packageInfo) {
  const code = fs.readFileSync(routePath, 'utf8');
  const ast = babelParse(code, {
    sourceType: 'module',
    allowImportExportEverywhere: true,
    plugins: [
      'dynamicImport',
      'jsx',
    ],
  });

  const res = [];

  traverse(ast, {
    // eslint-disable-next-line no-shadow
    JSXOpeningElement(path) {
      if (path.node.name.name === 'CacheRoute') {
        const attrs = path.node.attributes;
        const obj = {};
        attrs.forEach((attr) => {
          if (attr.name.name === 'path') {
            obj.routePath = attr.value.type !== 'StringLiteral'
              ? attr.value.expression.quasis[1].value.raw
              : attr.value.value;
          }
          if (attr.name.name === 'component') {
            obj.component = attr.value.expression.name;
          }
        });
        res.push(obj);
      }
    },
  });

  return packRouteObj(res, packageInfo);
}

async function getRouteMsg() {
  let res = [];
  const cmps = await getAllSubModules();
  cmps.forEach((module, i) => {
    const packageInfo = require(getPackagePath(`./target/generate-react/${module}`));
    const routePath = path.join(process.cwd(), `./target/generate-react/${module}`, packageInfo.main);
    res = res.concat(getMsgFromFileOfAST(routePath, packageInfo));
  });
  const mainPackage = require(getPackagePath());
  if (mainPackage.main) {
    const routePath = path.join(process.cwd(), mainPackage.main);
    res = res.concat(getMsgFromFileOfAST(routePath, mainPackage));
  }
  console.log(res);
  return res;
}

export default getRouteMsg;
