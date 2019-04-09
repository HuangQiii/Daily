const types = require('babel-types');

module.exports = {
  visitor: {
    ImportDeclaration(path, ref = {}) {
      let { opts } = ref
      let { node } = path;
      let { specifiers } = node;
      if (opts.library == node.source.value && !types.isImportDeclaration(specifiers[0])) {
        let newImport = specifiers.map((specifier) => (
          types.importDeclaration([types.ImportDefaultSpecifier(specifier.local)], types.stringLiteral(`${node.source.value}/${specifier.local.name}`))
        ));
        path.replaceWithMultiple(newImport)
      }
    }
  }
}