export type Decorator = (
  cls: unknown,
  name: keyof any,
  descriptor: PropertyDescriptor,
) => PropertyDescriptor

export type WrappedFunction<
  F extends (...args: unknown[]) => unknown = (...args: unknown[]) => unknown
> = F & {inner: F}

export type Rest1Type<T extends (a1: any, ...rest: any[]) => any> = T extends (
  a1: any,
  ...rest: infer U
) => any
  ? U
  : never
