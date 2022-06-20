import cron from 'node-cron'
import type { RedisClientType } from 'redis'

import type { Config, SingleNodeConfig } from './types'
import { Service } from './service'
import { Logger } from '@feditool/shared/src/logger'
import { SourceType } from './enums'
import { join } from 'path'

export class Worker {
  constructor(
    private readonly config: Config,
    private readonly redis: RedisClientType,
    private readonly logger = new Logger()
  ) {}

  public async run() {
    // this.addSchedule(this.config.weibo['英国报姐'])
    const types = Object.values(SourceType).map(i => String(i))
    for (const [group, configs] of Object.entries(this.config)) {
      if (types.includes(group)) {
        this.logger.info(`Adding group ${group}`)
        for (const [key, config] of Object.entries(configs)) {
          this.logger.info(`Adding schedule for ${group}:${key}`)
          this.addSchedule(config)
        }
      }
    }
  }

  private addSchedule(config: SingleNodeConfig) {
    const { redis } = this
    const validate = cron.validate(config.cron)
    if (!validate) {
      this.logger.error(`${config.cron} is not a valid cron expression`)
      return
    }

    this.logger.info(`Schedule added: ${config.rssUrl}`)

    const job = cron.schedule(
      config.cron,
      async () => {
        const logger = new Logger()
        logger.info(
          `Switch to new task logger: ${logger.id}, which belongs to worker: ${this.logger.id}`
        )
        logger.info(`Start to run ${config.cron} ${config.rssUrl}`)
        const redisProcessingKey = `rss2toot:feed:processing:${config.rssUrl}`
        const expiresIn = 60 * 60 * 24

        if (await redis.get(redisProcessingKey)) {
          logger.info(`Feed is processing, skip: ${config.rssUrl}`)
          return
        }

        await redis.set(redisProcessingKey, logger.id, {
          EX: expiresIn,
          NX: true
        })

        const service = new Service(config, logger, redis)
        await service.run()

        await redis.del(redisProcessingKey)
      },
      {
        scheduled: false
      }
    )

    job.start()
  }
}
