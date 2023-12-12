import type {NamedTypedDecorator} from './types'
import {keyToName} from './utils'

/**
 * Mark the that the method `targetName` on `target` wraps the function
 * `wrapped`, generally on some object that is a member of `target`
 *
 * This decorator currently does _not_ support `get`/`set`, and currently only
 * supports legacy decorators
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
): NamedTypedDecorator<
  N extends undefined ? Extract<keyof T, string | symbol> : string
> {
  type P = N extends undefined ? keyof T : string
  return (ctor, propertyKey: P, descriptor): PropertyDescriptor => ({
    ...descriptor,
    value: proxied(
      target,
      targetName === undefined
        ? (propertyKey as keyof T)
        : (targetName as Exclude<N, undefined>),
      descriptor.value!,
      wrappedName || descriptor.value!.name || undefined,
    ),
  })
}

/** Non-decorator version of {@link proxies}, useful when dynamically constructing a class */
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
  } catch {
    /* empty */
  }

  Object.defineProperty(wrapped, 'inner', {
    configurable: true,
    get(): T[N] {
      return target.prototype[targetName]
    },
  })
  return wrapped as W & {inner: T[N]}
}
