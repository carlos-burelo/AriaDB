import AriaDB from '.';

const db = new AriaDB('db.json');

const res = db.remove('address.city', 'London');

console.log(res);
