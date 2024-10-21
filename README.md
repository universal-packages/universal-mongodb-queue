# MongoDB Queue

[![npm version](https://badge.fury.io/js/@universal-packages%2Fmongodb-queue.svg)](https://www.npmjs.com/package/@universal-packages/mongodb-queue)
[![Testing](https://github.com/universal-packages/universal-mongodb-queue/actions/workflows/testing.yml/badge.svg)](https://github.com/universal-packages/mongodb-queue/actions/workflows/testing.yml)
[![codecov](https://codecov.io/gh/universal-packages/universal-mongodb-queue/branch/main/graph/badge.svg?token=CXPJSN8IGL)](https://codecov.io/gh/universal-packages/universal-mongodb-queue)

MongoDB queue system for [mongodb](https://github.com/mongodb/node-mongodb-native).

## Install

```shell
npm install @universal-packages/mongodb-queue
npm install mongodb
```

## MongoQueue

An instance of `MongoQueue` allows you to start enqueuing items to be retrieved later from anywhere and at the right time.

```js
import { MongoQueue } from '@universal-packages/mongodb-queue'

const mongoQueue = new MongoQueue({ identifier: 'my-app' })

await mongoQueue.connect()

await mongoQueue.enqueue({ job: 'update-users', which: 'all' }, 'normal')


/// Later

const item = await mongoQueue.dequeue('normal)

console.log(item.payload)

// > { job: 'update-users', which: 'all' }

```

### Options

`MongoQueue` takes the same [options](https://mongodb.github.io/node-mongodb-native/6.9/interfaces/MongoClientOptions.html) as the mongodb client.

Additionally takes the following ones:

- `client` `MongoClient`
  If you already have a client working in your app you can pass the instance here to not connect another client inside the `MongoQueue` instance.
- `identifier` `String`
  This will be used as the collection name to store the queue items.

### Instance methods

#### **`connect()`**

If you are not passing your own client in options you will need to tell the `MongoQueue` to connect its internal client.

```js
await mongoQueue.connect()
```

#### **`disconnect()`**

If you are not passing your own client in options you will need to tell the `MongoQueue` to disconnect its internal client when you no logger need it.

```js
await mongoQueue.disconnect()
```

#### **`enqueue(payload: Object, queue: string, [options])`**

Enqueues a `payload` with the given `queue`. Return the metadata related to the enqueued item.

```js
await mongoQueue.enqueue({ data: '❨╯°□°❩╯︵┻━┻' }, 'low')
await mongoQueue.enqueue({ data: '❨╯°□°❩╯︵┻━┻' }, 'normal')
await mongoQueue.enqueue({ data: '❨╯°□°❩╯︵┻━┻' }, 'high')
await mongoQueue.enqueue({ data: '❨╯°□°❩╯︵┻━┻' }, 'whatever')

const item = await mongoQueue.enqueue({ data: '❨╯°□°❩╯︵┻━┻' }, 'normal')

console.log(item)

// >  { dequeueAfter: 56462165
// >    enqueuedAt: 56462165
// >    id: 'complex-id'
// >    payload: { data: '❨╯°□°❩╯︵┻━┻' },
// >    queue: 'normal' }
```

#### options

You can also pass options related to where an item should be available to dequeue. `At` takes priority over `wait`.

- **`at`** `Date`
  The item will not be available before this date.
- **`wait`** `String`
  expressed with human language like `2 hours` or `1 day` and the enqueue item will not be available before current time plus wait time.

```js
await mongoQueue.enqueue({ data: '❨╯°□°❩╯︵┻━┻' }, 'normal', {})
```

#### **`dequeue(queue: string)`**

Dequeues an item from the given queue if it is ready to be dequeued.

```js
await mongoQueue.dequeue('low')
await mongoQueue.dequeue('normal')
await mongoQueue.dequeue('high')
await mongoQueue.dequeue('whatever')

const item = await mongoQueue.dequeue('normal')

console.log(item)

// >  { dequeueAfter: 56462165
// >    enqueuedAt: 56462165
// >    id: 'complex-id'
// >    payload: { data: '❨╯°□°❩╯︵┻━┻' },
// >    queue: 'normal' }
```

## Typescript

This library is developed in TypeScript and shipped fully typed.

## Contributing

The development of this library happens in the open on GitHub, and we are grateful to the community for contributing bugfixes and improvements. Read below to learn how you can take part in improving this library.

- [Code of Conduct](./CODE_OF_CONDUCT.md)
- [Contributing Guide](./CONTRIBUTING.md)

### License

[MIT licensed](./LICENSE).
