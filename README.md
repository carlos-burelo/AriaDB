# AriaDB

AriaDB is a minimalist and simple open source project for modeling local databases based on a JSON file in order to reduce the need to use an external database or require another server to store the information.

The project has a simple and practical API which has allowed it to be extremely light weighing less than 10kb.

## Install

```bash
# using npm
npm install ariadb

#usin yarn
yarn add ariadb
```

## Usage

```js
import AriaDB from 'ariadb';

const db = AriaDB('/path/to/db.json');

//
db.defaults({
  users: [],
  posts: [],
  comments: [],
});

const users = db.get('users');
```

> Generate a new database file:db.json

```json
{
  "users": [],
  "posts": [],
  "comments": [],
  "admin": {
    "username": "admin",
    "password": "admin"
  }
}
```

## Get

Get users list from database

```ts
const users = db.get('users');
```

## Set

```ts
db.set('users', [
  {
    id: 1,
    name: 'John Doe',
  },
]);
```

## Push

```ts
db.push('users', {
  id: 1,
  name: 'John Doe',
});
```

## Remove

```ts
db.remove('users', {
  id: 1,
});
```

## delete

```ts
// if the value does not exist, then the first
// level property of the object is removed
db.delete('users');
// or
db.delete('admin', 'username');
```

## Save

```ts
// force save the database
db.save();
```
