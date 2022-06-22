import type { RedisClientType } from 'redis'
import type { Logger } from '@feditool/shared/src/logger'

import type { FileItem, RssItem, SingleNodeConfig } from './types'
import { MediaDownloader } from './mediaDownloader'
import { TootPoster } from './tootPoster'
import { RssHandler } from './rssHandler'
import type { Formatter } from './formatters/formatter'
import { WeiboFormatter } from './formatters/weiboFormatter'
import { SourceType } from './enums'

export const MAX_RETRY_TIME = 3
export class Service {
  /**
   * RSS handler
   */
  private handler: RssHandler
  private poster: TootPoster

  /**
   * Flag to indicate when the quit signal is received.
   */
  private sigint = false

  /**
   * Flag for stop method
   */
  private done = false

  constructor(
    private readonly config: SingleNodeConfig,
    private readonly logger: Logger,
    private readonly redis: RedisClientType
  ) {
    this.handler = new RssHandler(config.rssUrl, logger)
    this.poster = new TootPoster(
      {
        instanceType: config.instanceType,
        instanceUrl: config.instanceUrl,
        accessToken: config.accessToken
      },
      logger
    )
  }

  public async run() {
    const { handler, logger } = this
    let shouldStop = false
    await handler.request().catch(() => (shouldStop = true))
    if (shouldStop) {
      this.done = true
      return
    }
    const statuses = handler.data.items
    for (const status of statuses) {
      this.handleStatus(status)
    }
    this.done = true
    logger.info(`Service done.`)
  }

  public async stop() {
    this.sigint = true
    await new Promise(resolve => {
      const timer = setInterval(() => {
        if (this.done) {
          clearInterval(timer)
          resolve(true)
        }
      }, 200)
    })
  }

  private async handleStatus(status: RssItem) {
    if (this.sigint) return

    const { logger, redis } = this

    const redisProcessingKey = `rss2toot:status:processing:${status.link}`
    const redisSucceedKey = `rss2toot:status:succeed:${status.link}`
    const redisFailedKey = `rss2toot:status:failed:${status.link}`
    const redisRetryKey = `rss2toot:status:retry:${status.link}`
    const expiresIn = 60 * 60 * 24

    // Skip if is processing
    if (await redis.get(redisProcessingKey)) {
      logger.info(`Status is processing, skip: ${status.link}`)
      return
    }

    // Skip if is succeed
    if (await redis.get(redisSucceedKey)) {
      logger.info(`Status has already been posted, skip: ${status.link}`)
      return
    }

    // Skip if reach max retry time
    if (await redis.get(redisFailedKey)) {
      const count = Number(await redis.get(redisRetryKey))
      if (count >= MAX_RETRY_TIME) {
        logger.info(`Status has reached max retry time, skip: ${status.link}`)
        return
      }
    }

    logger.info(`Processing status: ${status.link}`)
    await redis.set(redisProcessingKey, logger.id, {
      EX: expiresIn,
      NX: true
    })

    const formattedStatusContent = this.applyFormatter(status)
    const content = formattedStatusContent.content
    const downloader = await this.handleMediaAttachments(formattedStatusContent)
    const mediaAttachments = downloader.fileList
    this.logger.info(`Posting status: ${status.link}`)
    // logger.debug(`Posting status: ${content}`)

    if (!this.sigint) {
      /**
       * Is postToot success?
       */
      let succeed = true
      await this.postToot(content, mediaAttachments)
        .then(() => (succeed = true))
        .catch(() => (succeed = false))
      if (succeed) {
        await redis.set(redisSucceedKey, logger.id)
        await redis.del(redisFailedKey)
        await redis.del(redisRetryKey)
      } else {
        await redis.set(redisFailedKey, logger.id)
        if (await redis.get(redisRetryKey)) {
          await redis.incr(redisRetryKey)
        } else {
          await redis.set(redisRetryKey, 1)
        }
      }
      downloader.clearTempFiles()
    }
    await redis.del(redisProcessingKey)
  }

  /**
   * Apply content formatter
   */
  private applyFormatter(status: RssItem) {
    const { config, logger } = this
    const { markdown, externalTag, remoteMedia } = config

    const options = {
      markdown: markdown ?? false,
      externalTag: externalTag ?? false,
      remoteMedia: remoteMedia ?? false,
      showSourceLink: config.showSourceLink ?? true,
      sourceLinkPrefix: config.sourceLinkPrefix ?? 'Source:'
    }

    const payload = {
      title: status.title,
      link: status.link,
      pubDate: status.pubDate,
      author: status.author
    }

    let formatter!: Formatter
    switch (config.sourceType) {
      case SourceType.Weibo:
        formatter = new WeiboFormatter(status.content, options, logger, payload)
        break
      default:
        logger.error(`No filter found for source type: ${config.sourceType}`)
    }

    return formatter
  }

  /**
   * Handle medias
   */
  private async handleMediaAttachments(formattedStatusContent: Formatter) {
    const downloader = new MediaDownloader(this.logger)
    await downloader.handleFormattedStatusContent(
      formattedStatusContent,
      this.config.bypassVideo ?? false
    )
    return downloader
  }

  /**
   * Post status
   */
  private async postToot(content: string, mediaAttachments: FileItem[]) {
    const { visibility, language } = this.config
    const toot = await this.poster.buildToot(content, {
      medias: mediaAttachments,
      visibility,
      language
    })
    return this.poster.post(toot)
  }
}
