import {Decorator, Rest1Type, WrappedFunction} from './types'

export {Decorator, WrappedFunction}

export default function decorator<F extends (...args: any[]) => any, A extends any[]>(wrapper: (fn: F, ...rest: A) => F): (...args: A) => Decorator;
export default function decorator<W extends <F extends (...args: any[]) => any>(fn: F, ...rest: any[]) => F>(wrapper: W): (...args: Rest1Type<W>) => Decorator;
export default function decorator<
  W extends <F extends (...args: any[]) => any>(fn: F, ...rest: any[]) => F
>(wrapper: W): (...args: Rest1Type<W>) => Decorator {
  // tslint:disable-next-line: typedef
  return (...args) => (
    cls,
    name,
    descriptor,
  ) => ({
    ...descriptor,
    value: _wrap(wrapper, descriptor.value, args),
  })
}

export function wrap<
  F extends (...args: any[]) => any,
  W extends (fn: F, ...rest: any[]) => F
>(wrapper: W, inner: F, ...wrapperArgs: Rest1Type<W>): WrappedFunction<F> {
  return _wrap(wrapper, inner, wrapperArgs)
}

export function wraps<F extends (...args: any[]) => any>(
  inner: F,
  outer: F,
  wrapperName = '<wrapped>',
): WrappedFunction<F> {
  Object.defineProperty(outer, 'name', {
    value: `${inner.name} (${wrapperName})`,
  })
  Object.defineProperty(outer, 'inner', {
    enumerable: false,
    value: inner,
  })
  return outer as WrappedFunction<F>
}

function _wrap<
  F extends (...args: unknown[]) => unknown,
  W extends (fn: F, ...rest: unknown[]) => F
>(wrapper: W, inner: F, wrapperArgs: Rest1Type<W>): WrappedFunction<F> {
  const wrapped =
    wrapperArgs.length > 0 ? wrapper(inner, ...wrapperArgs) : wrapper(inner)

  return wraps(inner, wrapped, wrapper.name)
}

const symRe = /^Symbol\((.*)\)$/
export function keyToName(name: keyof any): string {
  if (typeof name === 'symbol') {
    const symMatch = symRe.exec(name.toString())
    return symMatch ? `[${symMatch[1]}]` : name.toString()
  }
  return String(name)
}

// tslint:disable-next-line: no-any
export function proxied<T, N extends keyof T, W extends (...args: any[]) => unknown>(
  target: {prototype: T},
  targetName: N,
  wrapped: W,
  name: string = keyToName(targetName),
): W & {
  inner: T[N]
} {
  try {
    Object.defineProperty(wrapped, 'name', {
      configurable: true,
      value: name,
    })
  } catch {} // tslint:disable-line: no-empty

  Object.defineProperty(wrapped, 'inner', {
    configurable: true,
    get(): T[N] {
      return target.prototype[targetName]
    },
  })
  return wrapped as W & {inner: T[N]}
}
