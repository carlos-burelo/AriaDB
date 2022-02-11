import {
  readFileSync as read,
  existsSync as exist,
  writeFileSync as write,
} from 'fs';
export type DBController = <Custom>(path: string) => {
  save: () => void;
  defaults: (data: Custom) => void;
  get: (path: string) => any;
  set: (path: string, value: any) => void;
  push: (path: string, value: any[]) => void;
  remove: (path: string, value: any) => void;
  delete: (path: string, value?: string | string[]) => void;
};

const serialize = JSON.stringify;
const deserialize = JSON.parse;

const AriaDB: DBController = (filePath) => {
  const isObject = (obj: any): boolean => {
    const value = new Object(obj);
    return value.constructor === Object;
  };
  const writeChanges = (data: any): void => {
    write(filePath, serialize(data) || '{}', 'utf-8');
  };
  const setChanges = (path: string, value: any): void => {
    try {
      let object = state;
      let keys = path.split('.');
      let { length } = keys;
      for (let i = 0; i < length - 1; i++) {
        let elem: string = keys[i];
        if (!object[elem]) object[elem] = {};
        object = object[elem];
      }
      if (isObject(value)) {
        object[keys[length - 1]] = {
          ...object[keys[length - 1]],
          ...value,
        };
      } else object[keys[length - 1]] = value;
      setState(object);
      writeChanges(state);
    } catch (error) {
      throw new Error("Can't set the value");
    }
  };
  const getValue = (path: string): any => {
    const keys = path.split('.');
    let temp = state;
    for (let i = 0; i < keys.length; i++) {
      temp = state[keys[i]];
    }
    return temp;
  };
  let state = {} as any;
  const setState = (data: any): void => {
    state = { ...state, ...data };
  };
  let data;
  const isfileExist = exist(filePath);
  if (!isfileExist) writeChanges(state);
  if (isfileExist) data = read(filePath, 'utf8');
  if (data) setState(deserialize(data));
  // Controllers

  return {
    defaults: (data) => {
      setState(data);
      writeChanges(state);
    },
    get: (path) => {
      const value = getValue(path);
      if (!value) throw new Error('The path does not exist');
      return value;
    },
    set: (path, value) => setChanges(path, value),
    push: (path, value) => {
      const currentValue = getValue(path);
      if (!currentValue) throw new Error(`The path ${path} is not exist`);
      if (!Array.isArray(currentValue)) {
        throw new Error(`The path ${path} is not an array`);
      }
      const newValue = [...currentValue, ...value];
      setChanges(path, newValue);
    },
    remove: (path, value) => {
      const array = getValue(path);
      if (!array) throw new Error(`The path ${path} is not exist`);
      if (!Array.isArray(array)) {
        throw new Error(`The path ${path} is not an array`);
      }
      if (isObject(value)) {
        const filtered = array.filter((element: any) => {
          return Object.keys(value).every((key: string) => {
            return element[key] !== value[key];
          });
        });
        setChanges(path, filtered);
        return true;
      }
      if (typeof value === 'string') {
        const filtered = array.filter((element: any) => {
          return element !== value;
        });
        setChanges(path, filtered);
        return true;
      }
    },
    delete: (path, value) => {
      const object = getValue(path);
      if (!object) throw new Error(`The path ${path} is not exist`);

      if (!value) {
        delete state[path];
        setState(state);
        writeChanges(state);
        return;
      }
      if (!isObject(object)) {
        throw new Error(`The path ${path} is not an object`);
      }
      if (typeof value === 'string') {
        delete object[value];
      } else {
        value.forEach((element: string) => {
          delete object[element];
        });
      }
      setChanges(path, object);
    },
    save: () => writeChanges(state),
  };
};

export default AriaDB;
