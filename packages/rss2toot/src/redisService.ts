import { createClient, RedisClientType } from 'redis'
import { Logger } from '@feditool/shared/src/logger'
import colors from '@colors/colors'

export class RedisService {
  public client!: RedisClientType
  public status = 'end'

  public async createConnection(url: string) {
    this.client = createClient({ url })

    this.client.on('connect', () => {
      this.status = 'connect'
      Logger.warn('Redis client is initiating a connection to the server.')
    })

    this.client.on('ready', () => {
      this.status = 'ready'
      Logger.success(
        'Redis client successfully initiated the connection to the server.'
      )
    })

    this.client.on('end', () => {
      this.status = 'end'
      Logger.warn(
        'Redis client disconnected the connection to the server via .quit() or .disconnect().'
      )
    })

    this.client.on('error', error => {
      this.status = 'error'
      Logger.error(
        'Redis client unable to connect to the server or the connection closed unexpectedly.'
      )
    })

    this.client.on('reconnecting', () => {
      this.status = 'reconnecting'
      Logger.warn('Redis client is trying to reconnect to the server.')
    })

    await this.client.connect()
  }
}
