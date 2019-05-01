amdjs.config({
  baseUrl: '/test/exam2/',
  module: {
    jquery: {
      path: 'https://code.jquery.com/jquery-3.3.1.min.js',
      shim: 'jQuery'
    },
    test1: {
      path: 'bundle1',
      exact: true
    },
    test2: {
      path: 'bundle1',
      exact: true
    }
  }
});

amdjs(['test1', 'test2'], function (test1, test2) {
  console.log('ok', test1, test2);
});
