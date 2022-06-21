import fs from 'fs'
import ini from 'ini'
import colors from '@colors/colors'

import { RedisService } from './redisService'

import type { Config } from './types'
import { Jobs } from './jobs'
import packageJson from '../package.json' // assert { type: 'json' }

async function main() {
  const start = Date.now()

  console.log(
    colors.inverse(
      colors.green(' @feditool/rss2toot ') + ` v${packageJson.version} `
    )
  )
  console.log(colors.green(`Service booting...`))

  const configFilePath = './config.ini'
  const config = <Config>ini.parse(fs.readFileSync(configFilePath, 'utf-8'))
  const redisService = new RedisService()
  await redisService.createConnection(config.redis.url)
  const redis = redisService.client
  const jobs = new Jobs(config, redis)
  await jobs.run()
  process.on('SIGINT', async () => {
    console.log(colors.green('Caught interrupt signal'))
    console.log(colors.green('Gracefully shutting down...'))
    console.log(colors.green('Clearing queues...'))
    await jobs.stop()
    console.log(colors.green('Closing redis connection...'))
    await redis.quit()
    console.log(
      colors.inverse(
        colors.green(' Bye! ') + ` run for ${Date.now() - start} ms `
      )
    )
    process.exit()
  })
}

main()
