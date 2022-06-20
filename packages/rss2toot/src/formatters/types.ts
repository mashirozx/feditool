export interface FormatterOptions {
  /**
   * Enable markdown support?
   */
  markdown?: boolean
  /**
   * Include external tag (like super topic) link?
   * TODO: ignore default tag system (e.g. special symbol for tag)
   */
  externalTag?: boolean
  /**
   * Enable remote media support (with short code)
   */
  remoteMedia?: boolean
  /**
   * Display the source link?
   */
  showSourceLink?: boolean
  /**
   * Source link prefix context
   */
  sourceLinkPrefix?: string
}
export interface FormatterPayload {
  title?: string
  link?: string
  pubDate?: string
  author?: string
}

export interface Media {
  thumbnail?: string
  src: string
  title?: string
}

export type Video = Media

export type Image = Media
