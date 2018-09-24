const PROXY_FLAG = '@@SYMBOL_PROXY_FLAG'
const handler = {
  get(target, key) {
    if (key === PROXY_FLAG) return target
    return target.get(key)
  },
  set(target, key, value) {
    return target.set(key, value)
  },
} 

class Store {
  constructor(state) {
    this.modified = false
    this.source = state
    this.copy = null
  }
  get(key) {
    if (!this.modified) return this.source[key]
    return this.copy[key]
  }
  set(key, value) {
    if (!this.modified) this.modifing()
    return this.copy[key] = value
  }
  modifing() {
    if (this.modified) return
    this.modified = true
    this.copy = Array.isArray(this.source)
      ? this.source.slice()
      : { ...this.source }
  }
} 

function produce(state, producer) {
  const store = new Store(state)
  const proxy = new Proxy(store, handler)
  producer(proxy)
  const newState = proxy[PROXY_FLAG]
  if (newState.modified) return newState.copy
  return newState.source
}

// const state = {
//   obj: {},
//   val: 1,
// }

// const newState = produce(state, (draft) => {
//   draft.val = 2
// })

// console.log(state.val) // 1
// console.log(newState.val) // 2
// console.log(state.obj === newState.obj) // true