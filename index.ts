import { readFileSync, writeFileSync, existsSync } from 'node:fs'

type JSONType = string | number | boolean | null | undefined | JSONType[] | { [key: string]: JSONType }

export class AriaDB<T> {
  #state: T

  #write (filePath: string, data: any): void {
    writeFileSync(filePath, JSON.stringify(data, null, 0), 'utf-8')
  }

  #exist (filePath: string): boolean {
    return existsSync(filePath)
  }

  #read (filePath: string): T {
    const payload = readFileSync(filePath, 'utf-8')
    try {
      return JSON.parse(payload)
    } catch (error) {
      throw new Error('The file is not a valid JSON')
    }
  }

  constructor (private readonly filePath: string) {
    const exist = this.#exist(filePath)
    if (!exist) this.#write(filePath, '{}')
    this.#state = this.#read(filePath)
  }

  get<V> (path: V | keyof T): T | undefined {
    const pt = (path as string).toString().split('.')
    let value = this.#state
    for (let i = 0; i < pt.length; i++) {
      value = (value as any)[pt[i]]
      if (value === undefined) return undefined
    }
    return value
  }

  set<V> (path: V | keyof T, value: JSONType): boolean {
    const obj = this.get(path)
    if (obj === undefined) return false
    const keys = (path as string).toString().split('.')
    const lastKey: any = keys.pop()
    const lastState = keys.reduce((acc: any, key) => acc[key], this.#state)
    if (Array.isArray(obj)) {
      lastState[lastKey].push(value)
    } else {
      lastState[lastKey] = value
    }
    this.#write(this.filePath, this.#state)
    return true
  }

  has<V> (path: V | keyof T): boolean {
    const value = this.get(path)
    return value !== undefined
  }

  remove<V> (path: V | keyof T): boolean {
    // remove property of object
    const obj = this.get(path)
    if (obj === undefined) return false
    const keys = (path as string).toString().split('.')
    if (keys.length === 1) {
      delete (this.#state as any)[keys[path]]
      this.#write(this.filePath, this.#state)
      return true
    } else {
      // remove value of array
      const lastKey: any = keys.pop()
      const lastState = keys.reduce((acc: any, key) => acc[key], this.#state)
      const index = lastState[lastKey].indexOf(obj)
      if (index > -1) {
        lastState[lastKey].splice(index, 1)
        this.#write(this.filePath, this.#state)
        return true
      }
    }
    return false
  }

  delete<V> (path: V | keyof T): boolean {
    // remove property of array
    const obj = this.get(path)
    if (obj === undefined) return false
    const keys = (path as string).toString().split('.')
    if (keys.length === 1) {
      delete (this.#state as any)[keys[0]]
      this.#write(this.filePath, this.#state)
      return true
    } else {
      // remove value of array
      const lastKey: any = keys.pop()
      const lastState = keys.reduce((acc: any, key) => acc[key], this.#state)
      const index = lastState[lastKey].indexOf(obj)
      if (index > -1) {
        lastState[lastKey].splice(index, 1)
        this.#write(this.filePath, this.#state)
        return true
      }
    }
    return false
  }

  push<V> (path: V | keyof T, value: JSONType): boolean {
    const obj = this.get(path)
    if (obj === undefined) return false
    const keys = (path as string).toString().split('.')
    const lastKey: any = keys.pop()
    const lastState = keys.reduce((acc: any, key) => acc[key], this.#state)
    lastState[lastKey].push(value)
    this.#write(this.filePath, this.#state)
    return true
  }

  clear (): void {
    this.#state = {}
    this.#write(this.filePath, this.#state)
  }

  query (path: string, fn: Function): object | undefined {
    const obj = this.get(path)
    if (obj === undefined) return undefined
    return fn(obj)
  }

  toogle<V> (path: V | keyof T): boolean {
    const obj = this.get(path)
    if (obj === undefined) return false
    const keys = (path as string).toString().split('.')
    const lastKey: any = keys.pop()
    const lastState = keys.reduce((acc: any, key) => acc[key], this.#state)
    lastState[lastKey] = !(lastState[lastKey])
    this.#write(this.filePath, this.#state)
    return true
  }
}
