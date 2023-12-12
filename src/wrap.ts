import type {Rest1Type, WrappedFunction, WrappedValue} from './types'

export const wrapped = Symbol.for('decora.wrapped')

export {wrap, wraps, _wrap as __internal__wrap}
/**
 * Invoke the function `wrapper` with `inner`, and, if the result is a
 * function, update it to indicate that it wraps `inner` (update `name` and set
 * its `inner` property)
 */
function wrap<
  Fn extends (...args: any[]) => any,
  Decorator extends (fn: Fn, ...rest: any[]) => Fn,
>(
  decorator: Decorator,
  value: Fn,
  ...decoratorArgs: Rest1Type<Decorator>
): WrappedFunction<ReturnType<Decorator>, Fn>
function wrap<Value, Decorator extends (value: Value, ...rest: any[]) => unknown>(
  decorator: Decorator,
  value: Value,
  ...decoratorArgs: unknown[]
): WrappedValue<ReturnType<Decorator>, Value>
function wrap<Value, Result>(
  decorator: (value: Value, ...rest: unknown[]) => Result,
  value: Value,
  ...decoratorArgs: unknown[]
): WrappedValue<Result, Value> {
  return _wrap(decorator, [value, ...decoratorArgs])
}

/**
 * Update the `name` of `outer` to indicate that it is wrapping `inner`, set
 * `outer.inner` to the value of `inner`, and try to set the prototype of
 * `outer` to `inner`.
 */
function wraps<Outer, Inner = Outer>(
  inner: Inner,
  outer: Outer,
  wrapperName?: string,
): WrappedValue<Outer, Inner>
function wraps<Outer, Inner = Outer>(
  inner: Inner,
  outer: Outer,
  wrapperName?: string,
): WrappedValue<Outer, Inner>
function wraps<Outer, Inner = Outer>(
  inner: Inner,
  outer: Outer,
  wrapperName = '<wrapped>',
): WrappedValue<Outer, Inner> {
  if (typeof outer !== 'function') {
    return outer as WrappedValue<Outer, Inner>
  }

  Object.defineProperty(outer, 'name', {
    value: `${typeof inner === 'function' ? inner.name : '<unknown>'} (${wrapperName})`,
  })
  Object.defineProperty(outer, wrapped, {
    enumerable: false,
    value: inner,
  })
  // eslint-disable-next-line no-eq-null
  if (inner != null) {
    // prettier-ignore
    try { Object.setPrototypeOf(outer, inner) } catch { /* empty */ }
  }

  return outer as WrappedValue<Outer, Inner>
}

function _wrap<Value, Result = Value>(
  decorator: (value: Value, ...rest: unknown[]) => Result,
  decoratorArgs: [Value, ...unknown[]],
  context?: ThisParameterType<Value>,
): WrappedValue<Result, Value> {
  const wrapped = decorator.apply(context, decoratorArgs)
  const wrapperName =
    decorator.name || (typeof wrapped === 'function' ? wrapped.name : undefined)
  return wraps(decoratorArgs[0], wrapped, wrapperName)
}
