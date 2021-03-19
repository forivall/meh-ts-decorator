export type TypedMethodDecorator<T = any> = (
  cls: unknown,
  name: string | symbol,
  descriptor: TypedPropertyDescriptor<T>,
) => TypedPropertyDescriptor<T>

export type KeyedMethodDecorator<N extends string | symbol, T = (...args: any) => any> = (
  cls: unknown,
  name: N,
  descriptor: TypedPropertyDescriptor<T>,
) => TypedPropertyDescriptor<T>

/** @extends {MethodDecorator} */
export type GenericMethodDecorator = <T>(
  cls: unknown,
  name: string | symbol,
  descriptor: TypedPropertyDescriptor<T>
) => TypedPropertyDescriptor<T>;

export type WrappedFunction<
  F extends (...args: unknown[]) => unknown = (...args: unknown[]) => unknown,
  G extends (...args: unknown[]) => unknown = F
> = F & {inner: G}
// TODO: rename inner to a symbol called 'wrapped'. Next major release.

export type Rest1Type<T extends (a1: any, ...rest: any[]) => any> = T extends (
  a1: any,
  ...rest: infer U
) => any
  ? U
  : never
