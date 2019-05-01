amdjs('test1', undefined, function () {
  console.log('test1');
  return {
    test1: 1
  };
});

amdjs('test2', ['jquery'], function ($) {
  console.log('test2');
  return {
    jquery: $
  };
});
