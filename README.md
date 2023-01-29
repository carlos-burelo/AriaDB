# AriaDB

AriaDB is a database manager based on a JSON file with a minimalist API with useful methods to manage information in a simple way.

## Features

- **Simple**: It is easy to use and understand.
- **Lightweight**: It is very lightweight and fast.
- **Secure**: It is secure and easy to use.
- **Powerful**: It is powerful and easy to use.
- **Open-source**: It is open-source and free to use.

## Installation

- Download the latest version of the source from [GitHub](https://gihub.com/carlos-burelo/AriaDB).

```bash
# install using npm
npm install ariadb

# install using yarn
yarn add ariadb
```

## Usage

To use AriaDB we simply need to create an instance of the AriaDB class which is exported by default from 'ariadb'

```ts
import { AriaDB } from 'ariadb'

interface Database {
  users: string[]
}
const db = new AriaDB<Database>('path/to/database.json')

db.set('users', ['ryan', 'john'])

const users = db.get('users')
console.log(users) // ['ryan', 'john']
```