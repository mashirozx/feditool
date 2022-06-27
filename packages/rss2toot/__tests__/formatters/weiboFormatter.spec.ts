// cspell:disable
import { WeiboFormatter } from '../../src/formatters/weiboFormatter'

describe('WeiboFormatter', () => {
  test('handle @username', () => {
    const content = `<a href="https://weibo.com/n/英国报姐">@英国报姐</a>`
    const filter = new WeiboFormatter(content)
    expect(filter.content).toBe(' @英国报姐 ')
  })

  test('handle @username as markdown', () => {
    const content = `<a href="https://weibo.com/n/英国报姐">@英国报姐</a>`
    const filter = new WeiboFormatter(content, {
      markdown: true,
      externalTag: false
    })
    expect(filter.content).toBe(' [@英国报姐](https://weibo.com/n/英国报姐) ')
  })

  test('handle #hashtag#', () => {
    const content = `<a href="https://m.weibo.cn/search?containerid=231522type%3D1%26t%3D10%26q%3D%23%E5%91%A8%E7%AC%94%E7%95%85%23&amp;isnewpage=1" data-hide=""><span class="surl-text">#周笔畅#</span></a>`
    const filter = new WeiboFormatter(content)
    expect(filter.content).toBe(' #周笔畅 ')
  })

  test('handle #hashtag# with external link as markdown', () => {
    const content = `<a href="https://m.weibo.cn/search?containerid=231522type%3D1%26t%3D10%26q%3D%23%E5%91%A8%E7%AC%94%E7%95%85%23&amp;isnewpage=1" data-hide=""><span class="surl-text">#周笔畅#</span></a>`
    const filter = new WeiboFormatter(content, {
      markdown: true,
      externalTag: true
    })
    expect(filter.content).toBe(
      ' [⋕周笔畅](https://m.weibo.cn/search?containerid=231522type%3D1%26t%3D10%26q%3D%23%E5%91%A8%E7%AC%94%E7%95%85%23&isnewpage=1) '
    )
  })

  test('handle emojis', () => {
    const content = `<img alt="[心]" src="https://h5.sinaimg.cn/m/emoticon/icon/others/l_xin-43af9086c0.png" style="width:1em; height:1em;" referrerpolicy="no-referrer">`
    const filter = new WeiboFormatter(content)
    filter.serialize

    expect(filter.content).toBe(' [心] ')
  })

  test('handle images', () => {
    const content = `昨天，三名太空出差半年的航天英雄载誉归来，“神州十三号”成功返回地球！为我国航天向星辰大海又迈进一步，感到骄傲又自豪！4月17日，中国乳业的创新科技也迎来里程碑时刻，<a href="https://m.weibo.cn/search?containerid=231522type%3D1%26t%3D10%26q%3D%23%E4%BC%8A%E5%88%A9%E6%90%BA%E6%89%8B%E4%B8%AD%E5%9B%BD%E8%88%AA%E5%A4%A9%23&amp;extparam=%23%E4%BC%8A%E5%88%A9%E6%90%BA%E6%89%8B%E4%B8%AD%E5%9B%BD%E8%88%AA%E5%A4%A9%23" data-hide=""><span class="surl-text">#伊利携手中国航天#</span></a> 宣布：伊利正式签约成为中国航天太空创想乳制品官方合作伙伴，并启动 <a href="https://m.weibo.cn/search?containerid=231522type%3D1%26t%3D10%26q%3D%23%E5%85%A8%E7%90%83%E9%A6%96%E4%B8%AA%E4%B9%B3%E4%B8%9A%E5%A4%AA%E7%A9%BA%E5%AE%9E%E9%AA%8C%E5%AE%A4%23&amp;extparam=%23%E5%85%A8%E7%90%83%E9%A6%96%E4%B8%AA%E4%B9%B3%E4%B8%9A%E5%A4%AA%E7%A9%BA%E5%AE%9E%E9%AA%8C%E5%AE%A4%23" data-hide=""><span class="surl-text">#全球首个乳业太空实验室#</span></a> 带你一起开启“未来牛奶”的星空之旅，把星辰宇宙带进烟火人间<span class="url-icon"><img alt="[心]" src="https://h5.sinaimg.cn/m/emoticon/icon/others/l_xin-43af9086c0.png" style="width:1em; height:1em;" referrerpolicy="no-referrer"></span><a href="https://weibo.com/n/%E4%BC%8A%E5%88%A9%E9%9B%86%E5%9B%A2">@伊利集团</a><img style="" src="https://wx1.sinaimg.cn/large/a66d0169ly8h1cvf4ag93j23uw265b2f.jpg" referrerpolicy="no-referrer"><br><br><img style="" src="https://wx4.sinaimg.cn/large/a66d0169ly8h1cvf7r2ggj22x61x2npe.jpg" referrerpolicy="no-referrer"><br><br> `
    const filter = new WeiboFormatter(content)
    filter.serialize

    expect(filter.images[0].src).toBe(
      'https://wx1.sinaimg.cn/large/a66d0169ly8h1cvf4ag93j23uw265b2f.jpg'
    )
  })

  test('handle  animated images', () => {
    const content = `<video controls="controls" poster="https://wx1.sinaimg.cn/large/005zYraQgy1h3mz75p6l4j33402c0qv6.jpg" src="https://video.weibo.com/media/play?livephoto=https%3A%2F%2Flivephoto.us.sinaimg.cn%2F0046X8mWgx07Xb2JLJcj0f0f0100wknE0k01.mov" style="width: 100%"></video><video controls="controls" poster="https://wx4.sinaimg.cn/large/005zYraQgy1h3mz27jx5cj33402c0u0y.jpg" src="https://video.weibo.com/media/play?livephoto=https%3A%2F%2Flivephoto.us.sinaimg.cn%2F003traZHgx07Xb2Gvok80f0f0100tSRZ0k01.mov" style="width: 100%"></video><video controls="controls" poster="https://wx2.sinaimg.cn/large/005zYraQgy1h3mz2bhfv4j32bz1r4npd.jpg" src="https://video.weibo.com/media/play?livephoto=https%3A%2F%2Flivephoto.us.sinaimg.cn%2F0023mhTzgx07Xb2T40vm0f0f0100lyLY0k01.mov" style="width: 100%"></video>`
    const filter = new WeiboFormatter(content)
    filter.serialize

    expect(filter.videos.length).toBe(0)

    expect(filter.images[0].src).toBe(
      'https://video.weibo.com/media/play?livephoto=https%3A%2F%2Flivephoto.us.sinaimg.cn%2F0046X8mWgx07Xb2JLJcj0f0f0100wknE0k01.mov'
    )

    expect(filter.images[0].thumbnail).toBe(
      'https://wx1.sinaimg.cn/large/005zYraQgy1h3mz75p6l4j33402c0qv6.jpg'
    )
  })

  test('handle videos', () => {
    const content = `轻松对味，<a href="https://weibo.com/n/%E5%90%9B%E4%B9%90%E5%AE%9D%E7%AE%80%E9%86%87">@君乐宝简醇</a> 喜签<a href="https://m.weibo.cn/search?containerid=231522type%3D1%26t%3D10%26q%3D%23%E5%91%A8%E7%AC%94%E7%95%85%23&amp;isnewpage=1" data-hide=""><span class="surl-text">#周笔畅#</span></a>担任<a href="https://m.weibo.cn/search?containerid=231522type%3D1%26t%3D10%26q%3D%23%E7%AE%80%E9%86%87%E6%97%A0%E8%B4%9F%E6%8B%85%E5%94%B1%E5%93%8D%E5%AE%98%23&amp;extparam=%23%E7%AE%80%E9%86%87%E6%97%A0%E8%B4%9F%E6%8B%85%E5%94%B1%E5%93%8D%E5%AE%98%23" data-hide=""><span class="surl-text">#简醇无负担唱响官#</span></a>，笔笔同款0蔗糖酸奶 <a href="https://m.weibo.cn/search?containerid=231522type%3D1%26t%3D10%26q%3D%23%E6%97%A0%E8%B4%9F%E6%8B%85%E8%BD%BB%E6%9D%BE%E4%BA%AB%E6%B8%AF%E4%B9%90%23&amp;extparam=%23%E6%97%A0%E8%B4%9F%E6%8B%85%E8%BD%BB%E6%9D%BE%E4%BA%AB%E6%B8%AF%E4%B9%90%23" data-hide=""><span class="surl-text">#无负担轻松享港乐#</span></a> <a href="https://video.weibo.com/show?fid=1034:4758855998177431" data-hide=""><span class="url-icon"><img style="width: 1rem;height: 1rem" src="https://h5.sinaimg.cn/upload/2015/09/25/3/timeline_card_small_video_default.png" referrerpolicy="no-referrer"></span><span class="surl-text">英国报姐的微博视频</span></a> <br clear="both"><div style="clear: both"></div><video controls="controls" poster="https://wx1.sinaimg.cn/orj480/007XdJHwly8h1bgabbfgxj30p00p0dh7.jpg" style="width: 100%"><source src="https://f.video.weibocdn.com/o0/LKIBjq0vlx07VjNRudWU010412003b7H0E010.mp4?label=mp4_720p&amp;template=1280x720.25.0&amp;ori=0&amp;ps=1CwnkDw1GXwCQx&amp;Expires=1650097140&amp;ssig=J8ii8RgNzP&amp;KID=unistore,video"><source src="https://f.video.weibocdn.com/o0/xyQbN9YElx07VjNR6yuY010412001pAE0E010.mp4?label=mp4_hd&amp;template=852x480.25.0&amp;ori=0&amp;ps=1CwnkDw1GXwCQx&amp;Expires=1650097140&amp;ssig=PCOeou%2FYR7&amp;KID=unistore,video"><source src="https://f.video.weibocdn.com/o0/Mbz1WroOlx07VjNRbbAA010412000WIb0E010.mp4?label=mp4_ld&amp;template=640x360.25.0&amp;ori=0&amp;ps=1CwnkDw1GXwCQx&amp;Expires=1650097140&amp;ssig=F3QPujn4ZU&amp;KID=unistore,video"><p>视频无法显示，请前往<a href="https://video.weibo.com/show?fid=1034%3A4758855998177431&amp;luicode=10000011&amp;lfid=1076033099016097" target="_blank" rel="noopener noreferrer">微博视频</a>观看。</p></video>`
    const filter = new WeiboFormatter(content)
    filter.serialize

    expect(filter.videos[0].thumbnail).toBe(
      'https://wx1.sinaimg.cn/orj480/007XdJHwly8h1bgabbfgxj30p00p0dh7.jpg'
    )

    expect(filter.videos[0].src).toBe(
      'https://f.video.weibocdn.com/o0/LKIBjq0vlx07VjNRudWU010412003b7H0E010.mp4?label=mp4_720p&template=1280x720.25.0&ori=0&ps=1CwnkDw1GXwCQx&Expires=1650097140&ssig=J8ii8RgNzP&KID=unistore,video'
    )
  })
})
