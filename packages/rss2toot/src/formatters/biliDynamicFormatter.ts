import { Formatter } from './formatter'

export class BiliDynamicFormatter extends Formatter {
  override applyFilters() {
    this.linkFilter()
    this.emojiFilter()
    super.applyFilters()
  }

  protected imageFilter(): void {
    const { document, images } = this
    // document.querySelectorAll('img').forEach(img => {
    //   const src = img.getAttribute('src')
    //   if (src) {
    //     images.push({ src })
    //   }
    //   img.remove()
    // })

    // // Animated images
    // document.querySelectorAll('video').forEach(video => {
    //   const thumbnail = video.getAttribute('poster') ?? undefined
    //   if (video.getAttribute('src')) {
    //     images.push({
    //       src: video.getAttribute('src'),
    //       thumbnail
    //     })
    //     video.remove()
    //   }
    // })
  }

  protected videoFilter(): void {
    const { document, videos } = this

    const iframe = document.querySelector('iframe')
    if (iframe) {
      const imgs = document.querySelectorAll('img')
      const thumbnail = imgs[imgs.length - 1]

      iframe.remove()
      thumbnail.remove()
    }
  }

  protected linkFilter() {
    const { document } = this
    // const { markdown, externalTag } = this.options
    // document.querySelectorAll('a').forEach(link => {
    //   const href = link.getAttribute('href') ?? ''
    //   const context = link.text

    //   // condition: @username
    //   const isWeiboUserLink =
    //     href.startsWith('https://weibo.com/u/') ||
    //     href.startsWith('https://weibo.com/n/')

    //   if (isWeiboUserLink) {
    //     const span = document.createElement('span')
    //     span.innerHTML = markdown ? ` [${context}](${href}) ` : ` ${context} `
    //     link.replaceWith(span)
    //     return
    //   }

    //   // condition: #hashtag#
    //   const hashtagRegex = /^#([^#]+)#$/
    //   const isWeiboTagLink = hashtagRegex.test(context.trim())
    //   if (isWeiboTagLink) {
    //     const tag = context.match(hashtagRegex)![1]
    //     const span = document.createElement('span')
    //     // TODO: super topic icon
    //     // TODO: to PC version of hot topic url (decodeURL)
    //     span.innerHTML =
    //       markdown && externalTag ? ` [⋕${tag}](${href}) ` : ` #${tag} `
    //     link.replaceWith(span)
    //     return
    //   }

    //   // condition: xxx的微博视频
    //   const weiboVideoRegex = /^((?:.+)的微博视频)$/
    //   const isWeiboVideoLink = weiboVideoRegex.test(context.trim())
    //   if (isWeiboVideoLink) {
    //     const label = context.match(weiboVideoRegex)![1]
    //     const span = document.createElement('span')
    //     // TODO: video icon
    //     span.innerHTML = markdown ? ` [${label}](${href}) ` : ` ${label} `
    //     link.replaceWith(span)
    //     return
    //   }

    //   // condition: normal link
    //   const span = document.createElement('span')
    //   span.innerHTML = markdown
    //     ? ` [${context}](${href}) `
    //     : ` ${context} (${href}) ` // TODO: if the context is a url

    //   link.replaceWith(span)
    // })
  }

  protected emojiFilter() {
    const { document } = this

    document.querySelectorAll('img').forEach(img => {
      const alt = img.getAttribute('alt')?.trim() ?? ''
      const emojiRegex = /^\[([^[\]]*)\]$/

      if (emojiRegex.test(alt)) {
        const emoji = alt.match(emojiRegex)![1]
        const span = document.createElement('span')
        // TODO: emoji mapping
        span.innerHTML = ` [${emoji}] `
        img.replaceWith(span)
      }
    })
  }
}
