export type Rest1Type<T extends (a1: any, ...rest: any[]) => any> = T extends (
  a1: any,
  ...rest: infer U
) => any
  ? U
  : never
