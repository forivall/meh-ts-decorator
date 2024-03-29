# @forivall/decorator

Simple function decorator/wrapping util, in typescript

[![build status](https://github.com/forivall/meh-ts-decorator/actions/workflows/main.yml/badge.svg)](https://github.com/forivall/meh-ts-decorator/actions/workflows/main.yml)
[![dependency status](https://img.shields.io/david/forivall/meh-ts-decorator)](https://david-dm.org/forivall/meh-ts-decorator)
[![dependency status](https://badges.depfu.com/badges/019638eb029618a184c44b4b8a9ebeef/count.svg)](https://depfu.com/github/forivall/meh-ts-decorator?project_id=29951)
[![coverage status](https://coveralls.io/repos/github/forivall/meh-ts-decorator/badge.svg)](https://coveralls.io/github/forivall/meh-ts-decorator)
[![npm version](https://img.shields.io/npm/v/@forivall/decorator)](https://npm.im/@forivall/decorator)
[![bundle size](https://img.shields.io/bundlephobia/minzip/@forivall/decorator)](https://bundlephobia.com/package/@forivall/decorator)

## Installation

```
npm install --save @forivall/decorator
```

## Usage

Using the following wrapper function for our examples

```ts
function log<F extends (...args: any[]): any>(fn: F, label: string): F {
  return (...args: Parameters<F>) => {
    console.log(`enter ${label}`)
    const out: ReturnType<F> = fn(...args)
    console.log(`exit ${label}`)
    return out
  } as F
}
```

### `wrap()`
```ts
import {wrap} from '@forivall/decorator'
const doStuff = wrap(log, () => console.log('stuff'), 'doStuff')
doStuff()
// Output:
// enter doStuff
// stuff
// exit doStuff
```

### `decorator()`
Create a decorator function
```ts
import decorator from '@forivall/decorator'
const logDecorator = decorator(log)
class Stuff {
  @logDecorator('doStuff')
  doIt() {
    console.log('stuff')
  }
}
new Stuff().doIt()
// Output:
// enter doStuff
// stuff
// exit doStuff
```

### `proxied()`
Add metadata to a function that proxies another. Useful for the proxy pattern.
```ts
class Stuff {
  doIt() {
    console.log('stuff')
  }
  somethingElse() {
    console.log('more stuff')
  }
}

import {proxied} from '@forivall/decorator'
class StuffWrapper {
  stuff = new Stuff()
}
interface StuffWrapper implements Stuff {}
Object.keys(Stuff.prototype).forEach((k) => {
  StuffWrapper.prototype[k] = proxied(Stuff, k, function(this: StuffWrapper, ...args: unknown[]) {
    return this.stuff[k](...args)
  })
})
```

## Credits
[Emily Marigold Klassen](https://github.com/forivall/)

## License

ISC
