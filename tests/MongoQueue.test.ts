import { MongoQueue } from '../src'

const mongoQueue = new MongoQueue({ identifier: 'testing', url: 'mongodb://localhost:27017/test' })

beforeAll(async (): Promise<void> => {
  await mongoQueue.connect()
  await mongoQueue.clear()
})

afterAll(async (): Promise<void> => {
  await mongoQueue.disconnect()
})

describe(MongoQueue, (): void => {
  it('enqueues an item and retrieve them by priority', async (): Promise<void> => {
    const enqueuedItem1 = await mongoQueue.enqueue({ test: 1 }, 'normal')
    const enqueuedItem2 = await mongoQueue.enqueue({ test: 2 }, 'high')
    const enqueuedItem3 = await mongoQueue.enqueue({ test: 3 }, 'low')
    const enqueuedItem4 = await mongoQueue.enqueue({ test: 4 }, 'emails')

    expect(await mongoQueue.dequeue('normal')).toEqual(enqueuedItem1)
    expect(await mongoQueue.dequeue('normal')).toBeUndefined()

    expect(await mongoQueue.dequeue('high')).toEqual(enqueuedItem2)
    expect(await mongoQueue.dequeue('high')).toBeUndefined()

    expect(await mongoQueue.dequeue('low')).toEqual(enqueuedItem3)
    expect(await mongoQueue.dequeue('low')).toBeUndefined()

    expect(await mongoQueue.dequeue('emails')).toEqual(enqueuedItem4)
    expect(await mongoQueue.dequeue('emails')).toBeUndefined()
  })

  it('enqueues an that can be retrieved after time', async (): Promise<void> => {
    const enqueuedItem = await mongoQueue.enqueue({ test: true }, 'normal', { wait: '1 seconds' })
    let item = await mongoQueue.dequeue('normal')

    expect(item).toBeUndefined()

    await new Promise((resolve) => setTimeout(resolve, 2000))

    item = await mongoQueue.dequeue('normal')
    expect(item).toEqual(enqueuedItem)
  })

  it('enqueues an that can be retrieved at time', async (): Promise<void> => {
    const enqueuedItem = await mongoQueue.enqueue({ test: true }, 'normal', { at: new Date(Date.now() + 1000) })
    let item = await mongoQueue.dequeue('normal')

    expect(item).toBeUndefined()

    await new Promise((resolve) => setTimeout(resolve, 2000))

    item = await mongoQueue.dequeue('normal')
    expect(item).toEqual(enqueuedItem)
  })
})
