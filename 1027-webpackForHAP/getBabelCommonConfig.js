import context from '../bin/common/context';

export default function babel(mode, env) {
  const { choerodonConfig } = context;
  return choerodonConfig.babelConfig({
    presets: [
      'react',
      [
        'es2015',
      ],
      'stage-1',
    ],
    plugins: [
      'transform-async-to-generator', //  turn async functions into ES2015 generators
      'transform-decorators-legacy',  // decorators
      'transform-class-properties', // static class properties
      'transform-runtime',  //  add poiiyfill
      'lodash', // cherry-pick Lodash modules
      [
        'import',
        {
          libraryName: 'choerodon-ui',
          style: true,
        },
        {
          libraryName: 'choerodon-hap-ui',
          style: true,
        },
      ],  // cherry-pick UI modules
    ],
  }, mode, env);
}
