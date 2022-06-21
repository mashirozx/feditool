import fs from 'fs'
import { AxiosError } from 'axios'
import generator, { Entity, Response, MegalodonInterface } from 'megalodon'
import { Logger } from '@feditool/shared/src/logger'

import { FileItem } from './types'
import type { Profile, PostStatusArgs } from './types'
import { InstanceType, Visibility, MediaType } from './enums'

export interface Toot {
  status: PostStatusArgs[0]
  options: PostStatusArgs[1]
}

/**
 * Class to post toot
 */
export class TootPoster {
  private client: MegalodonInterface

  /**
   * @param profile The login info
   * @param logger The logger
   */
  constructor(profile: Profile, protected logger = new Logger()) {
    this.client = generator(
      profile.instanceType ?? InstanceType.Mastodon,
      profile.instanceUrl,
      profile.accessToken,
      profile.userAgent,
      profile.proxyConfig
    )
  }

  /**
   * Post the toot
   */
  public async post(toot: Toot) {
    const { client } = this
    return client
      .postStatus(toot.status, toot.options)
      .then((res: Response<Entity.Status>) => {
        this.logger.info(`Toot post succeed: ${res.data.url}`)
        return Promise.resolve(res.data)
      })
      .catch(error => {
        this.logger.error(error)
        return Promise.reject(error)
      })
  }

  /**
   * Build the toot payload
   */
  public async buildToot(
    status: PostStatusArgs[0],
    options?: {
      medias?: FileItem[]
      poll?: {
        options: Array<string>
        expires_in: number
        multiple?: boolean
        hide_totals?: boolean
      }
      in_reply_to_id?: string
      sensitive?: boolean
      spoiler_text?: string
      visibility?: Visibility
      scheduled_at?: string
      language?: string
      quote_id?: string
    }
  ) {
    const medias = <Entity.Attachment[]>(
      await Promise.all(
        (options?.medias ?? []).map(async media => {
          return this.uploadMedia(media).catch(() => false)
        })
      )
    ).filter(i => !!i)

    const media_ids: string[] = []

    // We will only check media type after upload in `TootPoster`, and to prevent
    // the duplicated video/audio upload, filter them before passing  `medias`.
    //
    // Here, left the instance to determine whether a video is Gifv or real video.
    if (medias.filter(media => media.type === MediaType.Video).length > 1) {
      media_ids.push(
        medias.filter(media => media.type === MediaType.Video)[0].id
      )
    } else {
      media_ids.push(...medias.map(media => media.id))
    }

    delete options?.medias

    return {
      status,
      options: {
        media_ids,
        ...(options as Omit<typeof options, 'medias'>)
      }
    }
  }

  /**
   * Method to upload media, should only be called when `post()` toot
   */
  public async uploadMedia(fileItem: FileItem) {
    if (!fileItem.path || !fs.existsSync(fileItem.path)) {
      const error = `Invalid file path: ${fileItem.path}`
      this.logger.error(error)
      return Promise.reject(error)
    }
    const image = fs.createReadStream(fileItem.path)
    this.logger.info(`Uploading media: ${fileItem.path}`)
    return this.client
      .uploadMedia(image, { description: fileItem.description })
      .then((res: Response<Entity.Attachment>) => {
        this.logger.info(
          `Media upload succeed: ${fileItem.path} => ${res.data.url}`
        )
        return Promise.resolve(res.data)
      })
      .catch((error: Error | AxiosError) => {
        this.logger.error(error.toString())
        return Promise.reject(error)
      })
  }
}
