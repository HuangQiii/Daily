function compose() {
  var args = arguments; // 保存compose的参数，和后面的返回的匿名函数的参数不同
  var start = args.length - 1; // 取最后一个
  return function() {
    var i = start;
    var result = args[start].apply(this, arguments);
    while (i--) {
      result = args[i].call(this, result);
    }
    return result;
  }
}


// es6

const compose = (...fns) => fns.reduce((f, g) => (...args) => f(g(...args)));

fns.reduce(function(f, g) {
  return function(arg) {
    f(g(arg));
  }
})