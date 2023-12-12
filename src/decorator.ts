import type {GenericDecorator, Rest1Type, TypedMethodDecorator} from './types'
import {createDefaultSetter, keyToName} from './utils'
import {__internal__wrap, wraps} from './wrap'

export interface DecoratorOptions {
  lazy?: boolean
}

export {decorator}
/** Create a decorator using a simple method that returns a function wrapping another */
function decorator<F extends (...args: any[]) => any, A extends any[]>(
  wrapper: (fn: F, ...rest: A) => F,
  options?: DecoratorOptions,
): (...args: A) => TypedMethodDecorator<F>
function decorator<W extends <Value>(fn: Value, ...rest: any[]) => Value>(
  wrapper: W,
  options?: DecoratorOptions,
): (...args: Rest1Type<W>) => GenericDecorator
function decorator<W extends <Value>(fn: Value, ...rest: any[]) => Value>(
  wrapper: W,
  options?: DecoratorOptions,
): (...args: Rest1Type<W>) => TypedMethodDecorator<any> {
  let decoratorAdapter: (...args: Rest1Type<W>) => TypedMethodDecorator<any>
  if (options?.lazy) {
    decoratorAdapter =
      (...args) =>
      (cls, name, descriptor) =>
        createLazyLegacyDecorator(cls, name, descriptor, wrapper, args)
  } else {
    decoratorAdapter =
      (...args) =>
      (cls, name, descriptor) =>
        createLegacyDecorator(cls, name, descriptor, wrapper, args)
  }

  return wraps(wrapper, decoratorAdapter)
}

function createLegacyDecorator<
  Value,
  Wrapper extends (fn: Value, ...rest: unknown[]) => Value,
>(
  cls: ThisParameterType<Value>,
  name: string | symbol,
  descriptor: TypedPropertyDescriptor<Value>,
  decorator: Wrapper,
  args: Rest1Type<Wrapper>,
) {
  if (descriptor.get) {
    return createGetterResultDecorator(descriptor, decorator, args)
  }

  return {
    ...descriptor,
    value: __internal__wrap(decorator, [descriptor.value!, ...args]),
  }
}

function createLazyLegacyDecorator<
  Inner,
  Decorator extends (fn: Inner, ...rest: unknown[]) => Inner,
>(
  cls: ThisParameterType<Inner>,
  name: string | symbol,
  descriptor: TypedPropertyDescriptor<Inner>,
  decorator: Decorator,
  args: Rest1Type<Decorator>,
) {
  if (descriptor.get) {
    return createGetterResultDecorator(descriptor, decorator, args)
  }

  const {configurable, enumerable, writable, value: originalValue} = descriptor

  function getter(this: ThisParameterType<Inner>) {
    const value = __internal__wrap(decorator, [originalValue!, ...args], this)
    Object.defineProperty(this, name, {
      configurable,
      enumerable,
      value,
      writable,
    })
    return value
  }

  const setter = writable ? createDefaultSetter(name) : undefined
  return {
    configurable,
    enumerable,
    get: getter,
    set: setter,
  }
}

function createGetterResultDecorator<
  Inner,
  Decorator extends (fn: Inner, ...rest: unknown[]) => Inner,
>(
  descriptor: TypedPropertyDescriptor<Inner>,
  decorator: Decorator,
  args: Rest1Type<Decorator>,
) {
  return {
    ...descriptor,
    get(this: ThisParameterType<Inner>) {
      const originalValue = descriptor.get!.call(this)
      return __internal__wrap(decorator, [originalValue, ...args], this)
    },
  }
}
