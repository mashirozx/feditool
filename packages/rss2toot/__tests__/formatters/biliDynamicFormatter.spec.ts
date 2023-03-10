// cspell:disable
import { BiliDynamicFormatter } from '../../src/formatters/biliDynamicFormatter'

describe('BiliDynamicFormatter', () => {
  test('handle emoji', () => {
    const content = `<img alt="[tv_doge]" src="https://i0.hdslb.com/bfs/emote/6ea59c827c414b4a2955fe79e0f6fd3dcd515e24.png" style="margin: -1px 1px 0px; display: inline-block; width: 20px; height: 20px; vertical-align: text-bottom;" title="" referrerpolicy="no-referrer">`
    const filter = new BiliDynamicFormatter(content)
    expect(filter.content).toBe(' [tv_doge] ')
  })
})
