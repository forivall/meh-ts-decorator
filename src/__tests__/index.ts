/* tslint:disable: typedef */

import test from 'ava'
import decorator, {wrap, proxied, WrappedFunction, keyToName} from '..';

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
  ; (inst.inner as WrappedFunction).inner.call(inst)
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
  Outer.prototype.inner = proxied(Inner, 'inner', function (this: Outer) {
    t.is(i++, 0)
    this.innerObj.inner()
    t.is(i++, 2)
  })

  t.is(Outer.prototype.inner.name, Inner.prototype.inner.name)
  t.is(
    (Outer.prototype.inner as WrappedFunction).inner,
    Inner.prototype.inner
  )

  new Outer().inner()
})
