import { JSDOM } from 'jsdom'
import { Logger } from '@feditool/shared/src/logger'

import type { Image, Video, FormatterPayload, FormatterOptions } from './types'

export abstract class Formatter {
  /**
   * Image list
   */
  public images: Image[] = []
  /**
   * Video list
   */
  public videos: Video[] = []
  /**
   * Emoji list
   */
  public emojis: string[] = []

  /**
   * The virtual DOM
   */
  public dom!: JSDOM

  /**
   * The mark of whether the filters have been applied
   * (they shall only be applied once)
   */
  private _applied = false

  constructor(
    /**
     * Raw HTML of content
     */
    content: string,
    /**
     * The options...
     */
    protected options: FormatterOptions = {},
    /**
     * The logger instance
     */
    protected logger = new Logger(),
    /**
     * The content filter payload as options, to pipe information like
     * url, date, author that the filter may need to know.
     */
    protected payload: FormatterPayload = {}
  ) {
    this.dom = new JSDOM(content)
    // Default options
    this.options.markdown = options.markdown ?? false
    this.options.externalTag = options.externalTag ?? false
    this.options.remoteMedia = options.remoteMedia ?? false
    this.options.showSourceLink = options.showSourceLink ?? false
    this.options.sourceLinkPrefix = options.sourceLinkPrefix ?? ''
  }

  /**
   * Get the plain result
   */
  public get content(): string {
    if (!this._applied) this.applyFilters()
    return this.document.body.textContent ?? ''
  }

  /**
   * The visual `window.document`
   */
  public get document(): Document {
    return this.dom.window.document
  }

  /**
   * Get the formatted result
   */
  public get serialize() {
    if (!this._applied) this.applyFilters()
    return this.dom.serialize()
  }

  /**
   * Apply the filters
   */
  protected applyFilters(): void {
    this.imageFilter()
    this.videoFilter()
    if (this.options.showSourceLink) this.appendSourceLink()
    if (this.options.remoteMedia) this.useRemoteMedia()
    this._applied = true
  }

  /**
   * Image filter
   */
  protected abstract imageFilter(): void

  /**
   * Video filter
   */
  protected abstract videoFilter(): void

  protected useRemoteMedia() {
    let suffix = '\n'

    for (const video of this.videos) {
      const thumbnail = video.thumbnail ? `{${video.thumbnail}}` : ''
      suffix += `\nVIDEO: [${video.src}]${thumbnail}`
    }
    this.videos = []

    for (const image of this.images) {
      const thumbnail = image.thumbnail ? `{${image.thumbnail}}` : ''
      suffix += `\nIMAGE: [${image.src}]${thumbnail}`
    }
    this.images = []

    this.document.body.innerHTML += suffix
  }

  protected appendSourceLink() {
    if (!this.payload.link) return
    let template = this.payload.link
    if (this.options.sourceLinkPrefix)
      template = `${this.options.sourceLinkPrefix} ${template}`
    this.document.body.innerHTML += `\n\n${template}`
  }
}
