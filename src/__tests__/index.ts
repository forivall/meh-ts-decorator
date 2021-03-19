/* tslint:disable: typedef */

import test from 'ava'

import decorator, {WrappedFunction, keyToName, proxied, wrap, wraps, proxies} from '..'

test('wraps', (t) => {
  t.plan(4)

  let i = 0
  function inner() {
    t.is(i++, 1)
  }
  function outer() {
    t.is(i++, 0)
    inner()
    t.is(i++, 2)
  }
  const wrapped = wraps(inner, outer, 'outer')

  t.is(wrapped.name, 'inner (outer)')

  wrapped()
})

test('wraps with no name', (t) => {
  t.plan(4)

  let i = 0
  function inner() {
    t.is(i++, 1)
  }
  const wrapped = wraps(inner, () => {
    t.is(i++, 0)
    inner()
    t.is(i++, 2)
  })

  t.is(wrapped.name, 'inner (<wrapped>)')

  wrapped()
})

test('wrap', (t) => {
  t.plan(4)

  let i = 0
  function outer(fn: () => void) {
    return () => {
      t.is(i++, 0)
      fn()
      t.is(i++, 2)
    }
  }

  function inner() {
    t.is(i++, 1)
  }

  const wrapped = wrap(outer, inner)

  t.is(wrapped.name, 'inner (outer)')

  wrapped()
})

test('wrap with args', (t) => {
  t.plan(6)

  let i = 0
  function outer(fn: (innerArg: string) => void, outerArg: string) {
    t.is(outerArg, 'outerArg')
    return (innerArg: string) => {
      t.is(i++, 0)
      fn(innerArg)
      t.is(i++, 2)
    }
  }

  function inner(innerArg: string) {
    t.is(i++, 1)
    t.is(innerArg, 'innerArg')
  }

  const wrapped = wrap(outer, inner, 'outerArg')

  t.is(wrapped.name, 'inner (outer)')

  wrapped('innerArg')
})

test('decorator', (t) => {
  t.plan(6)

  let i = 0
  function outer<T extends () => void>(fn: T) {
    return (() => {
      t.is(i++, 0)
      fn()
      t.is(i++, 2)
    }) as T
  }

  const outerDecorator = decorator(outer)

  let expectedInner = 1
  class Inner {
    @outerDecorator()
    inner() {
      t.is(i++, expectedInner)
    }
  }

  t.is(Inner.prototype.inner.name, 'inner (outer)')
  t.is((Inner.prototype.inner as WrappedFunction).inner.name, 'inner')

  const inst = new Inner()
  inst.inner()
  expectedInner = 3
  ;(inst.inner as WrappedFunction).inner.call(inst)
})

test('decorator with inner name', (t) => {
  t.plan(6)

  let i = 0
  const outerDecorator = decorator((fn: () => void) => {
    return function testDecorator() {
      t.is(i++, 0)
      fn()
      t.is(i++, 2)
    }
  })

  let expectedInner = 1
  class Inner {
    @outerDecorator()
    inner() {
      t.is(i++, expectedInner)
    }
  }

  t.is(Inner.prototype.inner.name, 'inner (testDecorator)')
  t.is((Inner.prototype.inner as WrappedFunction).inner.name, 'inner')

  const inst = new Inner()
  inst.inner()
  expectedInner = 3
  ;(inst.inner as WrappedFunction).inner.call(inst)
})

test('decorator symbol', (t) => {
  t.plan(4)

  let i = 0
  function outer<T extends () => void>(fn: T) {
    return (() => {
      t.is(i++, 0)
      fn()
      t.is(i++, 2)
    }) as T
  }

  const outerDecorator = decorator(outer)

  class Inner {
    @outerDecorator()
    [Symbol.iterator]() {
      t.is(i++, 1)
    }
  }

  t.is(Inner.prototype[Symbol.iterator].name, '[Symbol.iterator] (outer)')

  new Inner()[Symbol.iterator]()
})

test('keyToName', (t) => {
  t.is(keyToName('foo'), 'foo')
  t.is(keyToName(Symbol('foo')), '[foo]')
  t.is(keyToName(Symbol.iterator), '[Symbol.iterator]')
})

test('proxied', (t) => {
  t.plan(5)

  let i = 0

  class Inner {
    inner() {
      t.is(i++, 1)
    }
  }

  class Outer {
    innerObj = new Inner()
  }
  // tslint:disable-next-line: no-empty-interface
  interface Outer extends Inner {}
  Outer.prototype.inner = proxied(Inner, 'inner', function(this: Outer) {
    t.is(i++, 0)
    this.innerObj.inner()
    t.is(i++, 2)
  })

  t.is(Outer.prototype.inner.name, Inner.prototype.inner.name)
  t.is((Outer.prototype.inner as WrappedFunction).inner, Inner.prototype.inner)

  new Outer().inner()
})

test('proxies', (t) => {
  t.plan(5)

  let i = 0

  class Inner {
    inner() {
      t.is(i++, 1)
    }
  }

  class Outer {
    innerObj = new Inner()
    @proxies(Inner)
    inner() {
      t.is(i++, 0)
      this.innerObj.inner()
      t.is(i++, 2)
    }
  }

  t.is(Outer.prototype.inner.name, Inner.prototype.inner.name)
  t.is((Outer.prototype.inner as WrappedFunction).inner, Inner.prototype.inner)

  new Outer().inner()
})

test('proxies other', (t) => {
  t.plan(5)

  let i = 0

  class Inner {
    inner() {
      t.is(i++, 1)
    }
  }

  class Outer {
    innerObj = new Inner()
    @proxies(Inner, 'inner')
    outer() {
      t.is(i++, 0)
      this.innerObj.inner()
      t.is(i++, 2)
    }
  }

  t.is(Outer.prototype.outer.name, 'outer')
  t.is((Outer.prototype.outer as WrappedFunction).inner, Inner.prototype.inner)

  new Outer().outer()
})
