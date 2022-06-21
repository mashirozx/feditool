import cron from 'node-cron'
import type { RedisClientType } from 'redis'
import { remove } from 'lodash'

import type { Config, SingleNodeConfig } from './types'
import { Service } from './service'
import { Logger } from '@feditool/shared/src/logger'
import { SourceType } from './enums'

export class Jobs {
  constructor(
    private readonly config: Config,
    private readonly redis: RedisClientType,
    private readonly logger = new Logger()
  ) {}

  /**
   * List for scheduled jobs
   */
  private jobs: cron.ScheduledTask[] = []

  /**
   * List for current running workers (services)
   */
  private workers: { id: string; service: Service }[] = []

  /**
   * Flag to indicate when the quit signal is received.
   */
  private sigint = false

  public async run() {
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

  public async stop() {
    this.sigint = true
    await Promise.all(this.jobs.map(job => job.stop()))
    await Promise.all(
      this.workers.map(async worker => await worker.service.stop())
    )
  }

  private addSchedule(config: SingleNodeConfig) {
    const { redis, jobs, workers, sigint } = this
    if (sigint) return
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

        let service = new Service(config, logger, redis)
        workers.push({ id: logger.id, service })
        await service.run()
        remove(workers, { id: logger.id })
        service = null // release memory

        await redis.del(redisProcessingKey)
      },
      {
        scheduled: false
      }
    )

    job.start()

    jobs.push(job)
  }
}
