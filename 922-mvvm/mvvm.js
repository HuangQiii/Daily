function Mvvm(options = {}) {
  this.$options = options;
  let data = this._data = this.$options.data;

  observe(data);

  for (let key in data) {
    Object.defineProperty(this, key, {
      configurable: true,
      get() {
        return this._data[key];
      },
      set(newVal) {
        this._data[key] = newVal;
      }
    });
  }

  new Compile(options.el, this);
}

function Observe(data) {
  let dep = new Dep();
  for (let key in data) {
    let val = data[key];
    observe(val);
    Object.defineProperty(data, key, {
      configurable: true,
      get() {
        Dep.target && dep.addSub(Dep.target);
        return val;
      },
      set(newVal) {
        if (val === newVal) {
          return;
        }
        val = newVal;
        observe(newVal);
        dep.notify();
      }
    });
  }
}

function observe(data) {
  if (!data || typeof data !== 'object') return;
  return new Observe(data);
}

function Compile(el, vm) {
  vm.$el = document.querySelector(el);

  let fragment = document.createDocumentFragment();

  while (child = vm.$el.firstChild) {
    fragment.appendChild(child);
  }

  function replace(frag) {
    Array.from(frag.childNodes).forEach(node => {
      let txt = node.textContent;
      let reg = /\{\{(.*?)\}\}/g;

      if (node.nodeType === 1) {
        let nodeAttr = node.attributes;
        Array.from(nodeAttr).forEach(attr => {
          let name = attr.name;
          let exp = attr.value;
          if (name.includes('v-')) {
            node.value = vm[exp];
          }
          new Watcher(vm, exp, function (newVal) {
            node.value = newVal;
          });

          node.addEventListener('input', e => {
            let newVal = e.target.value;
            vm[exp] = newVal;
          });
        });
      }

      if (node.nodeType === 3 && reg.test(txt)) {
        console.log(RegExp.$1);
        let arr = RegExp.$1.split('.');
        let val = vm;
        arr.forEach(key => {
          val = val[key];
        });
        node.textContent = txt.replace(reg, val).trim();

        new Watcher(vm, RegExp.$1, newVal => {
          node.textContent = txt.replace(reg, newVal).trim();
        });
      }
      if (node.childNodes && node.childNodes.length) {
        replace(node);
      }
    });
  }

  replace(fragment);

  vm.$el.appendChild(fragment);
}


function Dep() {
  this.subs = [];
}

Dep.prototype = {
  addSub(sub) {
    this.subs.push(sub);
  },
  notify() {
    this.subs.forEach(sub => sub.update());
  },
}

function Watcher(vm, exp, fn) {
  this.fn = fn;
  this.vm = vm;
  this.exp = exp;

  Dep.target = this;
  let arr = exp.split('.');
  let val = vm;
  arr.forEach(key => {
    val = val[key];
  });
  Dep.target = null;
}

Watcher.prototype.update = function () {
  let arr = this.exp.split('.');
  let val = this.vm;
  arr.forEach(key => {
    val = val[key];
  })
  this.fn(val);
}