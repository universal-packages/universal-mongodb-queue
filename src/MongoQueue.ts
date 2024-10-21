import { Collection, MongoClient } from 'mongodb'
import ms from 'ms'

import { EnqueueOptions, MongoQueueOptions, QueueItem } from './MongoQueue.types'

export default class MongoQueue {
  public readonly options: MongoQueueOptions
  public readonly client: MongoClient

  private isClientMine = false
  private readonly DEFAULT_IDENTIFIER = 'priority-queue'
  private collection: Collection<Omit<QueueItem, 'id'>>

  public constructor(options?: MongoQueueOptions) {
    this.options = { ...options }
    const { client, identifier, url, ...mongoOptions } = this.options
    this.isClientMine = !client
    this.client = this.isClientMine ? new MongoClient(url, mongoOptions) : client
    this.collection = this.client.db().collection(identifier || this.DEFAULT_IDENTIFIER)
  }

  public async connect(): Promise<void> {
    if (this.isClientMine) await this.client.connect()
  }

  public async disconnect(): Promise<void> {
    if (this.isClientMine) await this.client.close()
  }

  public async clear(): Promise<void> {
    await this.collection.deleteMany({})
  }

  /** Enqueue a new item and set it ready to be dequeued at the right moment by its timestamp */
  public async enqueue(payload: Record<string, any>, queue: string, options?: EnqueueOptions): Promise<QueueItem> {
    const currentTime = Date.now()
    const dequeueTimestamp = options?.wait ? currentTime + ms(options.wait) : options?.at?.getTime() || currentTime
    const queueItem: Omit<QueueItem, 'id'> = { payload, queue, enqueuedAt: currentTime, dequeueAfter: dequeueTimestamp }

    const insertedResult = await this.collection.insertOne(queueItem)

    return {
      id: insertedResult.insertedId.toHexString(),
      queue: queueItem.queue,
      payload: queueItem.payload,
      enqueuedAt: queueItem.enqueuedAt,
      dequeueAfter: queueItem.dequeueAfter
    }
  }

  /** Removes the next item available by its timestamp to be removed and returns the items data */
  public async dequeue(queue: string): Promise<QueueItem> {
    const now = Date.now()
    const result = await this.collection.findOneAndDelete({ queue, dequeueAfter: { $lte: now } })

    if (result)
      return {
        id: result._id.toHexString(),
        queue: result.queue,
        payload: result.payload,
        enqueuedAt: result.enqueuedAt,
        dequeueAfter: result.dequeueAfter
      }
  }
}
