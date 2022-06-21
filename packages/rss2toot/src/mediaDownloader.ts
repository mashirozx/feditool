import axios from 'axios'
import fs from 'fs'
import path from 'path'
import { randomUUID } from 'crypto'
import mime from 'mime-types'
import { Logger } from '@feditool/shared/src/logger'

import type { FileItem } from './types'
import { Formatter } from './formatters/formatter'
/**
 * Media Downloader Class
 */
export class MediaDownloader {
  /**
   * The file list
   */
  public fileList = <FileItem[]>[]

  constructor(
    /**
     * The logger instance
     */
    private logger = new Logger(),
    /**
     * The options...
     */
    private options = {
      /**
       * Specify the temp folder
       */
      tmpPath: path.join(path.resolve('./'), 'tmp'),
      /**
       * Well, shall we show the progress? Defaults to `true`
       */
      progress: false
    }
  ) {}

  /**
   * The downloader
   * @param url
   * @returns Promise<string>
   */
  public async download(url: string, description?: string, focus?: string) {
    const { fileList, logger, options } = this
    const tmpPath = options.tmpPath

    !fs.existsSync(tmpPath) && fs.mkdirSync(tmpPath)

    return axios
      .request<fs.ReadStream>({ url, method: 'GET', responseType: 'stream' })
      .then((response): Promise<string> => {
        return new Promise((resolve, reject) => {
          const contentType = response.headers['content-type']
          const ext = contentType
            ? `.${mime.extension(contentType)}`
            : path.extname(url) ?? '.bin'
          const filePath = path.join(tmpPath, randomUUID()) + ext

          const file = fs.createWriteStream(filePath)

          // piping the response to file
          response.data.pipe(file)

          // show progress
          if (options.progress) {
            let written = 0
            const size = parseInt(response.headers['content-length'])
            response.data.on('data', data => {
              written += data.length
              logger.info(
                `written ${written} of ${size} bytes (${(
                  (written / size) *
                  100
                ).toFixed(2)}%)`
              )
            })
          }

          file.on('error', error => {
            Logger.error(error.message)
            reject(error)
          })

          file.on('finish', () => {
            file.close()

            fileList.push({
              url,
              path: filePath,
              description,
              focus
            })
            logger.info(`Media download completed: ${url} => ${filePath}`)
            resolve(filePath)
          })
        })
      })
      .catch(error => {
        logger.error(error.message)
        return Promise.reject(error)
      })
  }

  /**
   * Clear files in tmp file list
   */
  public clearTempFiles() {
    this.fileList.forEach(file => {
      if (file.path) {
        fs.rmSync(file.path)
        file.path = null
      }
    })
  }

  /**
   * Remove the tmp folder (should never be used)
   */
  public removeTempDir() {
    fs.rmSync(this.options.tmpPath, { recursive: true })
  }

  public async handleFormattedStatusContent(
    formattedStatusContent: Formatter,
    bypassVideo = false
  ) {
    const { logger, fileList } = this
    logger.info(`Handling media attachments...`)
    if (formattedStatusContent.videos.length > 0) {
      const video = formattedStatusContent.videos[0]
      if (!bypassVideo || !!video.thumbnail) {
        logger.info(
          `Downloading ${bypassVideo ? 'video thumbnail' : 'video'}: ${
            video.src
          }`
        )
        await this.download(
          bypassVideo ? video.thumbnail! : video.src,
          video.title || `Video source: ${video.src}`
        )
      } else {
        logger.info(`Bypassing video download: ${video.src}`)
      }
    } else {
      const images = formattedStatusContent.images
      await Promise.allSettled(
        images.map(async image => {
          logger.info(`Downloading image: ${image.src}`)
          await this.download(
            image.src,
            image.title || `Image source: ${image.src}`
          )
        })
      )
    }
  }
}

// const d = new MediaDownloader()
// d.removeTempDir()
// // d.clearTempFiles()
// d.download(
//   'https://s3.mashiro.top/mstdn/cache/media_attachments/files/108/216/260/621/968/831/original/8795109c62d6b773.mp4'
//   // 'https://cloud.moezx.cc/Video/Lets%20Go%20-%20Venice.mp4'
//   // 'https://wx1.sinaimg.cn/large/a66d0169ly8h1cvf4ag93j23uw265b2f.jpg'
// ).then(async () => {
//   await new Promise(resolve => setTimeout(resolve, 1000))
//   // d.clearTempFiles()
// })
