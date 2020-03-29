import memo from '../memo'

describe('method memoization', () => {
  test('makes method memoized', () => {
    const prop1Handler = jest.fn((base: number, arg1: number, arg2: number) => base + arg1 + arg2)
    const prop2Handler = jest.fn((base: number, arg1: number, arg2: number) => base + arg1 + arg2)
    const prop3Handler = jest.fn((base: number, arg1: number, arg2: number) => base + arg1 + arg2)

    class A {
      constructor(private base: number) {}

      prop1(arg1: number, arg2: number) {
        return prop1Handler(this.base, arg1, arg2)
      }

      @memo prop2(arg1: number, arg2: number) {
        return prop2Handler(this.base, arg1, arg2)
      }

      @memo prop3(arg1: number, arg2: number) {
        return prop3Handler(this.base, arg1, arg2)
      }
    }

    const a1 = new A(1)

    expect(prop1Handler).toBeCalledTimes(0)
    expect(a1.prop1(1, 2)).toBe(4)
    expect(prop1Handler).toBeCalledTimes(1)
    expect(a1.prop1(1, 2)).toBe(4)
    expect(prop1Handler).toBeCalledTimes(2)

    expect(prop2Handler).toBeCalledTimes(0)
    expect(a1.prop2(1, 2)).toBe(4)
    expect(prop2Handler).toBeCalledTimes(1)
    expect(a1.prop2(1, 2)).toBe(4)
    expect(prop2Handler).toBeCalledTimes(1)
    expect(a1.prop2(2, 2)).toBe(5)
    expect(prop2Handler).toBeCalledTimes(2)

    expect(prop3Handler).toBeCalledTimes(0)
    expect(a1.prop3(1, 2)).toBe(4)
    expect(prop3Handler).toBeCalledTimes(1)
    expect(a1.prop3(1, 2)).toBe(4)
    expect(prop3Handler).toBeCalledTimes(1)

    const a2 = new A(2)

    expect(a2.prop1(1, 2)).toBe(5)
    expect(prop1Handler).toBeCalledTimes(3)
    expect(a2.prop1(1, 2)).toBe(5)
    expect(prop1Handler).toBeCalledTimes(4)

    expect(prop2Handler).toBeCalledTimes(2)
    expect(a2.prop2(1, 2)).toBe(5)
    expect(prop2Handler).toBeCalledTimes(3)
    expect(a2.prop2(1, 2)).toBe(5)
    expect(prop2Handler).toBeCalledTimes(3)
    expect(a2.prop2(2, 2)).toBe(6)
    expect(prop2Handler).toBeCalledTimes(4)

    expect(prop3Handler).toBeCalledTimes(1)
    expect(a2.prop3(1, 2)).toBe(5)
    expect(prop3Handler).toBeCalledTimes(2)
    expect(a2.prop3(1, 2)).toBe(5)
    expect(prop3Handler).toBeCalledTimes(2)
  })
})

describe('getter memoization', () => {
  test('makes getter lazily evaluated', () => {
    const prop1Handler = jest.fn((base: number) => base + 1)
    const prop2Handler = jest.fn((base: number) => base + 2)

    class A {
      constructor(private base: number) {}

      get prop1() {
        return prop1Handler(this.base)
      }

      @memo get prop2() {
        return prop2Handler(this.base)
      }
    }

    const a1 = new A(1)

    expect(prop1Handler).toBeCalledTimes(0)
    expect(a1.prop1).toBe(2)
    expect(prop1Handler).toBeCalledTimes(1)
    expect(a1.prop1).toBe(2)
    expect(prop1Handler).toBeCalledTimes(2)

    expect(prop2Handler).toBeCalledTimes(0)
    expect(a1.prop2).toBe(3)
    expect(prop2Handler).toBeCalledTimes(1)
    expect(a1.prop2).toBe(3)
    expect(prop2Handler).toBeCalledTimes(1)

    const a2 = new A(2)

    expect(a2.prop1).toBe(3)
    expect(prop1Handler).toBeCalledTimes(3)
    expect(a2.prop1).toBe(3)
    expect(prop1Handler).toBeCalledTimes(4)

    expect(prop2Handler).toBeCalledTimes(1)
    expect(a2.prop2).toBe(4)
    expect(prop2Handler).toBeCalledTimes(2)
    expect(a2.prop2).toBe(4)
    expect(prop2Handler).toBeCalledTimes(2)
  })

  test('handles dependencies', () => {
    const createModuleA = jest.fn((deps: Dependencies) => new ModuleA(deps))
    const createModuleB = jest.fn((deps: Dependencies) => new ModuleB(deps))
    const createModuleC = jest.fn((deps: Dependencies) => new ModuleC(deps))

    class Dependencies {
      @memo get moduleA() {
        return createModuleA(this)
      }

      @memo get moduleB() {
        return createModuleB(this)
      }

      @memo get moduleC() {
        return createModuleC(this)
      }

      constructor() {}
    }

    class ModuleA {
      constructor(public deps: Dependencies) {}

      public run() {}
    }

    class ModuleB {
      constructor(public deps: Dependencies) {}

      public run() {
        const { moduleC } = this.deps
        return moduleC.run()
      }
    }

    class ModuleC {
      constructor(public deps: Dependencies) {}

      public run() {}
    }

    const deps = new Dependencies()

    expect(createModuleA).toBeCalledTimes(0)
    expect(createModuleB).toBeCalledTimes(0)
    expect(createModuleC).toBeCalledTimes(0)

    deps.moduleA.run()

    expect(createModuleA).toBeCalledTimes(1)
    expect(createModuleB).toBeCalledTimes(0)
    expect(createModuleC).toBeCalledTimes(0)

    deps.moduleB.run()

    expect(createModuleA).toBeCalledTimes(1)
    expect(createModuleB).toBeCalledTimes(1)
    expect(createModuleC).toBeCalledTimes(1)

    deps.moduleC.run()

    expect(createModuleA).toBeCalledTimes(1)
    expect(createModuleB).toBeCalledTimes(1)
    expect(createModuleC).toBeCalledTimes(1)
  })
})
