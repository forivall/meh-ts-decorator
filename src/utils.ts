const symRe = /^Symbol\((.*)\)$/
/** Convert a symbol or number to a string in the manner v8 does when declaring methods */
export function keyToName(name: PropertyKey): string {
  if (typeof name === 'symbol') {
    const symString = name.toString()
    const symMatch = symRe.exec(symString)
    /* istanbul ignore next */
    if (!symMatch) return symString
    const symName = symMatch[1]
    return symName && `[${symName}]`
  }

  return String(name)
}

export function createDefaultSetter(name: string | symbol) {
  function setter(this: unknown, newValue: unknown) {
    Object.defineProperty(this, name, {
      configurable: true,
      writable: true,
      // IS enumerable when reassigned by the outside word
      enumerable: true,
      value: newValue,
    })

    return newValue
  }

  Object.defineProperty(setter, 'name', {
    value: `${keyToName(name)} (set)`,
  })
  return setter
}
