import axios, { AxiosError } from 'axios'
import RssParser from 'rss-parser'
import { Logger } from '@feditool/shared/src/logger'

import { RssData } from './types'

export class RssHandler {
  public readonly rssParser = new RssParser()
  private rssObject?: RssData

  constructor(
    private readonly feedUrl: string,
    private readonly logger: Logger = new Logger()
  ) {}

  public async request() {
    return axios
      .get(this.feedUrl)
      .then(async response => {
        this.logger.info(`Fetched ${this.feedUrl}`)
        this.rssObject = <RssData>await this.parse(response.data)
        return Promise.resolve(this.rssObject)
      })
      .catch((error: Error | AxiosError) => {
        this.logger.error(`Failed to fetch ${this.feedUrl}`)
        this.logger.error(`Reason: ${error.message}`)
        return Promise.reject(error)
      })
  }

  private async parse(data: string) {
    const feed = await this.rssParser.parseString(data)
    return feed
  }

  /**
   * (getter) The parsed RSS object
   */
  public get data() {
    if (!this.rssObject) {
      const message = 'RSS object is not fetched yet'
      this.logger.error(message)
      throw new Error(message)
    }
    return this.rssObject
  }
}
