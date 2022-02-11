import AriaDB from './dist';

interface Persona {
  name: string;
  age: number;
  country: {
    name: string;
    code: string;
  };
}

const db = AriaDB<Persona>('db.json');
db.defaults({ name: 'nose' } as any);
