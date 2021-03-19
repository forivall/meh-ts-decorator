import {
  GenericMethodDecorator,
  KeyedMethodDecorator,
  Rest1Type,
  TypedMethodDecorator,
  WrappedFunction
} from './types'

export {TypedMethodDecorator as Decorator, WrappedFunction}

/** Create a decorator using a simple method that returns a function wrapping another */
export default function decorator<
  F extends (...args: any[]) => any, A extends any[]
>(wrapper: (fn: F, ...rest: A) => F): (...args: A) => TypedMethodDecorator<F>;
export default function decorator<
  W extends <F extends (...args: any[]) => any>(fn: F, ...rest: any[]) => F
>(wrapper: W): (...args: Rest1Type<W>) => GenericMethodDecorator;
export default function decorator<
  W extends <F extends (...args: any[]) => any>(fn: F, ...rest: any[]) => F
>(wrapper: W): (...args: Rest1Type<W>) => TypedMethodDecorator {
  // tslint:disable-next-line: typedef
  return (...args) => (cls, name, descriptor) => ({
    ...descriptor,
    value: _wrap(wrapper, descriptor.value, args),
  })
}

// TODO: integrate https://github.com/jayphelps/core-decorators/blob/master/src/decorate.js

/** Use `wrapper` to wrap `inner` */
export function wrap<
  F extends (...args: any[]) => any,
  W extends (fn: F, ...rest: any[]) => F
>(wrapper: W, inner: F, ...wrapperArgs: Rest1Type<W>): WrappedFunction<F> {
  return _wrap(wrapper, inner, wrapperArgs)
}

/** Mark that `outer` wraps `inner` */
export function wraps<F extends (...args: any[]) => any, G extends (...args: any[]) => any = F>(
  inner: G,
  outer: F,
  wrapperName = '<wrapped>',
): WrappedFunction<F, G> {
  Object.defineProperty(outer, 'name', {
    value: `${inner.name} (${wrapperName})`,
  })
  Object.defineProperty(outer, 'inner', {
    enumerable: false,
    value: inner,
  })
  try { Object.setPrototypeOf(outer, inner) } catch { /* empty */ }
  return outer as WrappedFunction<F, G>
}

function _wrap<
  F extends (...args: unknown[]) => unknown,
  W extends (fn: F, ...rest: unknown[]) => F
>(wrapper: W, inner: F, wrapperArgs: Rest1Type<W>): WrappedFunction<F> {
  const wrapped =
    wrapperArgs.length > 0 ? wrapper(inner, ...wrapperArgs) : wrapper(inner)

  return wraps(inner, wrapped, wrapper.name || wrapped.name)
}

const symRe = /^Symbol\((.*)\)$/
/** Convert a symbol or number to a string in the manner v8 does when declaring methods */
export function keyToName(name: PropertyKey): string {
  if (typeof name === 'symbol') {
    const symStr = name.toString();
    const symMatch = symRe.exec(symStr)
    /* istanbul ignore next */
    if (!symMatch) return symStr;
    const symName = symMatch[1];
    return symName && `[${symName}]`;
  }
  return String(name)
}

/**
 * Mark the that the method `targetName` on `target` wraps the function
 * `wrapped`, generally on some object that is a member of `target`
 *
 * @example
 * class A {
 *   foo() {}
 * }
 * class B {
 *   a = new A();
 *   \@proxies(A)
 *   foo() {
 *     return this.a.foo();
 *   }
 * }
 */

 export function proxies<T, N extends undefined | keyof T = undefined>(
  target: {prototype: T},
  targetName?: N,
  wrappedName?: string,
): KeyedMethodDecorator<N extends undefined ? string : Extract<N, string | symbol>> {
  type P = N extends undefined ? string : Extract<N, string | symbol>;
  return (ctor, propertyKey: P, descriptor): PropertyDescriptor => ({
    ...descriptor,
    value: proxied(
      target,
      targetName === undefined ? propertyKey as keyof T : targetName as Exclude<N, undefined>,
      descriptor.value!,
      wrappedName || descriptor.value!.name || undefined
    )
  })
}

/** Non-decorator version of {@link proxies}, useful when dynamically constructing a class */
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
  } catch { /* empty */ }

  Object.defineProperty(wrapped, 'inner', {
    configurable: true,
    get(): T[N] {
      return target.prototype[targetName]
    },
  })
  return wrapped as W & {inner: T[N]}
}
