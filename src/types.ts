import type {wrapped} from './wrap'

export type TypedMethodDecorator<T> = (
  cls: ThisParameterType<T>,
  name: string | symbol,
  descriptor: TypedPropertyDescriptor<T>,
) => TypedPropertyDescriptor<T>

export type NamedTypedDecorator<N extends string | symbol, T = (...args: any) => any> = (
  cls: unknown,
  name: N,
  descriptor: TypedPropertyDescriptor<T>,
) => TypedPropertyDescriptor<T>

/** @extends {MethodDecorator} */
export type GenericDecorator = <T>(
  cls: unknown,
  name: string | symbol,
  descriptor: TypedPropertyDescriptor<T>,
) => TypedPropertyDescriptor<T>

export type WrappedFunction<
  Outer extends (...args: any) => any = (...args: unknown[]) => unknown,
  Inner = Outer,
> = Outer & {[wrapped]: Inner}

export type WrappedValue<Outer, Inner = Outer> = Outer extends (...args: any) => any
  ? WrappedFunction<Outer, Inner>
  : Outer

export type Rest1Type<T extends (a1: any, ...rest: any[]) => any> = T extends (
  a1: any,
  ...rest: infer U
) => any
  ? U
  : never
