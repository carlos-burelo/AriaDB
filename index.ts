import { readFileSync, writeFileSync, existsSync as exist } from 'fs';

export interface AriaDBInterface {
  /**
   * @param {string} path - The path to the value separated by dots
   * @example
   * db.get('user.name');
   * // use numbers as index for arrays
   * db.get('user.hobbies.0');
   */
  get: (path: string) => any;
  /**
   * @param {string} path - The path to the value separated by dots
   * @param {any} value - The value to set
   * @example
   * db.set('user.name', 'Carlos');
   * // use numbers as index for arrays
   * db.set('user.hobbies.0', 'Programming');
   */
  set: (path: string, value: any) => void;
  /**
   * @description Check if the value in the path exists and return true or false
   * @param {string} path - The path to the value separated by dots
   * @example
   * db.has('user.name');
   * // use numbers as index for arrays
   * db.has('user.hobbies.0');
   * @returns {boolean}
   */
  has: (path: string) => boolean;
  /**
   * @param {string} path - The path to the value separated by dots
   * @example
   * // delete method is not supported for arrays
   * db.delete('user.name');
   * @returns {boolean}
   */
  delete: (path: string) => boolean;
  /**
   * @param {string} path - The path to the value separated by dots
   * @param {any} value - The value to remove
   * @example
   * db.remove('user.hobbies', 'Programming');
   * // use props for arrays of objects
   * db.remove('user.hobbies', { name: 'Programming' });
   * @returns {boolean}
   */
  remove: (path: string, value: any) => boolean;
  /**
   * @description This method returns only the properties required in `values`
   * in the object obtained in the path, if it is an array, it returns only the
   * properties of the elements
   * @param {string} path - The path to the value separated by dots
   * @param {string[]} value - The value to update
   * @example
   * db.query('user', ['name', 'age', 'hobbies']);
   * // expected outpu:  { name: 'Carlos', age: 30, hobbies: ['Programming', 'Cooking'] }
   */
  query: (path: string, values: string[]) => any;
  /**
   * @param {string} path - The path to the value separated by dots
   * @param {string[]} values - The value to add to the array
   * @example
   * db.push('user.hobbies', 'Programming');
   * // use props for arrays of objects
   * db.push('user.hobbies', { name: 'Programming' });
   */
  push: (path: string, value: any) => boolean;
  /**
   * @description Este metodo busca que el objeto obtenido del path exista e
   * invierte el valor del mismo, si es true asigna false y viceversa.
   * Si value no existe, entonces invertira el valor del objeto.
   * Si value existe, entonces invertira el valor del mismo en base al valor proporsionado.
   *
   * @param {string} path - The path to the value separated by dots
   * @param {boolean} [value] - The value to set manually
   * @example
   * db.toggle('user.active'); // reverse the value of user.active
   */
  toggle: (path: string, value?: boolean) => boolean | undefined;
}
function read<Schema>(filePath: string): Schema {
  if (!exist(filePath)) writeFileSync(filePath, '{}', 'utf-8');
  const data = readFileSync(filePath, 'utf-8');
  try {
    return JSON.parse(data);
  } catch (error) {
    throw new Error('The file is not a valid JSON');
  }
}
function write(filePath: string, data: any): void {
  if (typeof data !== 'string') {
    try {
      data = JSON.stringify(data, null, 0);
    } catch (error) {
      throw new Error("Can't write the data");
    }
  }
  return writeFileSync(filePath, data, 'utf-8');
}
export default class AriaDB<Custom> implements AriaDBInterface {
  #state: Custom = {} as Custom;
  constructor(private filePath: string) {
    if (!exist(filePath)) write(filePath, '{}');
    this.#state = read<Custom>(filePath);
  }
  get(path: string) {
    const pt = path.split('.');
    let value = this.#state;
    for (let i = 0; i < pt.length; i++) {
      value = (value as any)[pt[i]];
      if (value === undefined) return undefined;
    }
    return value;
  }
  set(path: string, value: any) {
    const obj = this.get(path);
    if (obj === undefined) return false;
    const keys = path.split('.');
    const lastKey: any = keys.pop();
    const lastState = keys.reduce((acc: any, key) => acc[key], this.#state);
    if (Array.isArray(obj)) {
      lastState[lastKey].push(value);
    } else {
      lastState[lastKey] = value;
    }
    write(this.filePath, this.#state);
    return true;
  }
  has(path: string): boolean {
    const value = this.get(path);
    return value !== undefined;
  }
  delete(path: string): boolean {
    const obj = this.get(path);
    if (obj === undefined) return false;
    const keys = path.split('.');
    if (keys.length === 1) {
      delete (this.#state as any)[keys[0]];
      write(this.filePath, this.#state);
      return true;
    }
    const lastKey: any = keys.pop();
    const lastState = keys.reduce((acc: any, key) => acc[key], this.#state);
    delete lastState[lastKey];
    write(this.filePath, this.#state);
    return true;
  }
  remove(path: string, value: any): boolean {
    const obj = this.get(path);
    if (obj === undefined) return false;
    if (Array.isArray(obj)) {
      const index = obj.findIndex((item: any) => item === value);
      if (index === -1) return false;
      obj.splice(index, 1);
    } else {
      for (const key in obj) {
        if (obj[key] === value) {
          delete obj[key];
          break;
        }
      }
    }
    write(this.filePath, this.#state);
    return true;
  }
  query(path: string, values: string[]): any {
    const obj = this.get(path);
    if (obj === undefined) return undefined;
    if (Array.isArray(obj)) {
      const array = obj.filter((item: any) => {
        return values.some((key: string) => item[key] !== undefined);
      });
      return array.map((item: any) => {
        const res: any = {};
        values.forEach((key: string) => {
          res[key] = item[key];
        });
        return res;
      });
    }
    const res: any = {};
    for (const key in obj) {
      if (values.includes(key)) {
        res[key] = obj[key];
      }
    }
    return res;
  }
  push(path: string, value: any): boolean {
    const obj = this.get(path);
    if (obj === undefined) return false;
    this.set(path, value);
    return true;
  }
  toggle(path: string, value?: boolean | undefined): boolean | undefined {
    const obj = this.get(path);
    if (obj === undefined) return undefined;
    if (typeof obj !== 'boolean') return undefined;
    if (!value) {
      this.set(path, !obj);
      return !obj;
    } else {
      this.set(path, value);
      return value;
    }
  }
}
