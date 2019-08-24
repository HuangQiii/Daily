class Dep {
  constructor() {
    this.deps = new Set();
  }

  depend() {
    if (Dep.target) {
      this.deps.add(Dep.target);
    }
  }

  notify() {
    this.deps.forEach((dep) => {
      dep();
    })
  }
}

Dep.target = null;

class Observable {
  constructor(obj) {
    return this.walk(obj);
  }

  walk(obj) {
    const keys = Object.keys(obj);
    keys.forEach((key) => {
      this.defineReactive(obj, key, obj[key]);
    })
    return obj;
  }

  defineReactive(obj, key, val) {
    const dep = new Dep();
    if (Array.isArray(obj[key])) {
      // Array添加push的钩子
      Object.defineProperty(obj[key], 'push', {
        value() {
          this[this.length] = arguments[0];
          dep.notify();
        }
      })
      Object.defineProperty(obj, key, {
        get() {
          dep.depend();
          return val;
        }
      })
    } else {
      Object.defineProperty(obj, key, {
        get() {
          dep.depend();
          return val;
        },
        set(newVal) {
          val = newVal;
          dep.notify();
        }
      })
    }
  }
}

class Watcher {
  constructor(obj, key, cb, onComputedUpdate) {
    this.obj = obj;
    this.key = key;
    this.cb = cb;
    this.onComputedUpdate = onComputedUpdate;
    return this.defineComputed();
  }

  defineComputed() {
    const self = this;
    const onDepUpdated = () => {
      const val = self.cb();
      this.onComputedUpdate(val);
    }

    Object.defineProperty(self.obj, self.key, {
      get() {
        Dep.target = onDepUpdated;
        const val = self.cb();
        Dep.target = null;
        return val;
      },
      set() {
        console.error('计算属性无法被赋值！');
      }
    })
  }
}

const hero = new Observable({
  name: '赵云',
  hp: 3000,
  sp: 150,
  equipment: ['马', '矛']
});

new Watcher(hero, 'health', () => {
  return hero.hp > 2000 ? '强壮' : '良好';
}, (val) => {
  console.log(`英雄的健康状况是：${val}`);
});

new Watcher(hero, 'job', () => {
  return hero.sp < 3000 ? '武将' : '谋士'
}, (val) => {
  console.log(`英雄的职业是：${val}`);
});

new Watcher(hero, 'weapon', () => {
  return hero.equipment;
}, (val) => {
  console.log(`英雄的武器是：${val}`);
});

console.log(`英雄初始健康状况：${hero.health}`);
// -> 英雄初始健康状况：强壮

console.log(`英雄初始职业：${hero.job}`);
// -> 英雄初始职业：武将

console.log(`英雄初始武器：${hero.weapon}`);
// -> 英雄初始武器：马,矛

hero.name = '诸葛亮';
console.log(`英雄的名字是：${hero.name}`);
// -> 英雄的名字是：诸葛亮

hero.hp = 1000;
// -> 英雄的健康状况是：良好

hero.sp = 4000;
// -> 英雄的职业是：谋士

hero.equipment.push('羽扇');
// -> 英雄的武器是：马,矛,羽扇