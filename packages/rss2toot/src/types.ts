import type { InstanceType, SourceType, Visibility } from './enums'
import type { ProxyConfig, MegalodonInterface } from 'megalodon'

/**
 * Config type of a single account/service
 */
export interface SingleNodeConfig {
  cron: string
  sourceType: SourceType
  instanceType: InstanceType
  instanceUrl: string
  accessToken: string
  rssUrl: string
  visibility?: Visibility
  language?: string
  markdown?: boolean
  externalTag?: boolean
  remoteMedia?: boolean
  bypassVideo?: boolean
  showSourceLink?: boolean
  sourceLinkPrefix?: string
}

export type RedisConfig = {
  redis: {
    url: string
  }
}

export type GeneralConfig = {
  general: {
    debug?: boolean
    dryRunFirst?: boolean
  }
}

export type NodeConfigs = {
  [key in SourceType]: {
    [nickname: string]: SingleNodeConfig
  }
}

/**
 * Type of `config.ini` file
 */
export type Config = GeneralConfig & RedisConfig & NodeConfigs

/**
 * Profile for `TootPoster` to login
 */
export interface Profile {
  instanceType?: InstanceType
  instanceUrl: string
  accessToken: string
  userAgent?: string
  proxyConfig?: false | ProxyConfig
}

export type PostStatusArgs = Parameters<MegalodonInterface['postStatus']>

/**
 * Local cached media files info
 */
export interface FileItem {
  path: string | null
  url: string
  description?: string
  focus?: string
}

/**
 * The RSS item
 */
export interface RssItem {
  creator: string
  title: string
  link: string
  /**
   * Readable like "Tue, 10 May 2022 12:02:20 GMT"
   */
  pubDate: string
  author: string
  content: string
  contentSnippet: string
  /**
   * Seems like the same as `link`
   */
  guid: string
  /**
   * Something like "2022-05-10T12:02:20.000Z"
   */
  isoDate: string
}

/**
 * The parsed RSS object
 */
export interface RssData {
  items: RssItem[]
  feedUrl: string
  image: {
    link: string
    url: string
    title: string
  }
  /**
   * Seems like the same as `feedUrl`
   */
  paginationLinks: {
    self: string
  }
  /**
   * Like "xxx的微博"
   */
  title: string
  language: string
  /**
   * Format: "Tue, 10 May 2022 15:49:51 GMT"
   */
  lastBuildDate: string
  /**
   * Number string
   */
  ttl: string
}
