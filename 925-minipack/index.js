const fs = require('fs');
const path = require('path');
const babylon = require('babylon');
const traverse = require('babel-traverse').default;
const { transformFromAst } = require('babel-core');

let config = {}

function getAst(filename) {
  const content = fs.readFileSync(filename, 'utf-8');

  // babylon.parse(code, [options])
  // sourceType can be module or script
  // doc: https://github.com/babel/babylon/blob/6.x/README.md

  return babylon.parse(content, { sourceType: 'module' });
}

function getDependence(ast) {
  let dependencies = [];

  // https://github.com/jamiebuilds/babel-handbook/blob/master/translations/en/plugin-handbook.md#babel-traverse

  traverse(ast, {
    ImportDeclaration: ({ node }) => {
      dependencies.push(node.source.value);
    },
  });
  return dependencies;
}

function compiler(ast) {
  // https://babeljs.io/docs/en/next/babel-core.html#transformfromast

  const { code } = transformFromAst(ast, null, { presets: ['env'] });
  return code;
}

function parse(fileName, entry) {
  let filePath = fileName.indexOf('.js') === -1 ? `${fileName}.js` : fileName;
  let dirName = entry ? '' : path.dirname(config.entry);
  let absolutePath = path.join(dirName, filePath);
  const ast = getAst(absolutePath);
  return {
    fileName,
    dependence: getDependence(ast),
    code: compiler(ast),
  };
}

function getQueue(main) {
  let queue = [main];
  for (let asset of queue) {
    asset.dependence.forEach((dep) => {
      let child = parse(dep);
      queue.push(child);
    });
  }
  return queue;
}

function bundle(queue) {
  let modules = '';
  queue.forEach((mod) => {
    modules += `'${mod.fileName}': function (require, module, exports) { ${mod.code} },`;
  });

  const result = `
    (function(modules) {
      function require(fileName) {
        const fn = modules[fileName];

        const module = { exports : {} };

        fn(require, module, module.exports);

        return module.exports;
      }

      require('${config.entry}');
    })({${modules}})
  `;

  return result;
}

function bundleFile(option) {
  config = option;
  let mainFile = parse(config.entry, true);

  let queue = getQueue(mainFile);
  return bundle(queue);
}

module.exports = bundleFile;
