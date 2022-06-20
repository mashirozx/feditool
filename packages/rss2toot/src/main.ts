import fs from 'fs'
import ini from 'ini'
import { RedisService } from './redisService'

import type { Config } from './types'
import { Worker } from './worker'

async function main() {
  const configFilePath = './config.ini'
  const config = <Config>ini.parse(fs.readFileSync(configFilePath, 'utf-8'))
  const redisService = new RedisService()
  await redisService.createConnection(config.redis.url)
  const redis = redisService.client
  const worker = new Worker(config, redis)
  await worker.run()
}

main()
