import { MongoClient, MongoClientOptions } from 'mongodb'

export interface MongoQueueOptions extends MongoClientOptions {
  client?: MongoClient
  identifier?: string
  url?: string
}

export interface QueueItem {
  id: string
  queue: string
  payload: Record<string, any>
  enqueuedAt: number
  dequeueAfter: number
}

export interface EnqueueOptions {
  at?: Date
  wait?: string
}
