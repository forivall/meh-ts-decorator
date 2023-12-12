export type {
  TypedMethodDecorator as Decorator,
  WrappedFunction,
  WrappedValue,
} from './types'
export type {DecoratorOptions} from './decorator'
export {decorator as default} from './decorator'
export {proxied, proxies} from './proxy'
export {wrap, wraps, wrapped} from './wrap'
