import { createClient, RedisClientType } from 'redis'
import { Logger } from '@feditool/shared/src/logger'

export class RedisService {
  public client!: RedisClientType
  public ready = false

  constructor(private logger = new Logger()) {}

  public async createConnection(url: string) {
    this.client = createClient({ url })

    this.client.on('error', err => console.log('Redis Client Error', err))

    await this.client.connect()

    this.ready = true
  }
}
