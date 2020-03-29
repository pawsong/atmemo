const HOP = Object.prototype.hasOwnProperty;

function defaultHashFn(...args: any[]) {
  return args.map(arg => String(arg)).join(':')
}

export function createMemo(hashFn: (...args: any[]) => string) {
  return (
    target: any,
    propertyKey: PropertyKey,
    descriptor: PropertyDescriptor,
  ) => {
    if (descriptor.get) {
      const getter = descriptor.get
      descriptor.get = function() {
        // eslint-disable-next-line prefer-rest-params
        const value = getter.apply(this, arguments)
        Object.defineProperty(this, propertyKey, { value })
        return value
      }
    } else if (descriptor.value) {
      const cacheKey = Symbol(String(propertyKey))
      const fn = descriptor.value
      descriptor.value = function() {
        let cache = this[cacheKey]
        if (!cache) {
          cache = {}
          Object.defineProperty(this, cacheKey, {
            value: cache,
            enumerable: false,
          })
        }

        const hash = hashFn.apply(this, arguments)
        if (HOP.call(cache, hash)) {
          return cache[hash]
        }

        const value = fn.apply(this, arguments)
        cache[hash] = value
        return value
      }
    }
  }
}

const memo = createMemo(defaultHashFn)

export default memo
