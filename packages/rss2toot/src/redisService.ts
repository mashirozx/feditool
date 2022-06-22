import { createClient, RedisClientType } from 'redis'
import { Logger } from '@feditool/shared/src/logger'
import colors from '@colors/colors'

export enum RedisStatus {
  connect = 1,
  ready = 2,
  end = 3,
  error = 4,
  reconnecting = 5
}
export class RedisService {
  public client!: RedisClientType
  public status = RedisStatus.end

  public async createConnection(url: string) {
    this.client = createClient({ url })

    this.client.on('connect', () => {
      this.status = RedisStatus.connect
      Logger.warn('Redis client is initiating a connection to the server.')
    })

    this.client.on('ready', () => {
      this.status = RedisStatus.ready
      Logger.success(
        'Redis client successfully initiated the connection to the server.'
      )
    })

    this.client.on('end', () => {
      this.status = RedisStatus.end
      Logger.warn(
        'Redis client disconnected the connection to the server via .quit() or .disconnect().'
      )
    })

    this.client.on('error', error => {
      this.status = RedisStatus.error
      Logger.error(
        'Redis client unable to connect to the server or the connection closed unexpectedly.'
      )
    })

    this.client.on('reconnecting', () => {
      this.status = RedisStatus.reconnecting
      Logger.warn('Redis client is trying to reconnect to the server.')
    })

    await this.client.connect()
  }
}
