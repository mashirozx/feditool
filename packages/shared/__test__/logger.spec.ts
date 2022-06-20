import { Logger } from '../src/logger'

describe('Logger', () => {
  test('log', () => {
    console.log = jest.fn()
    Logger.log('hello')
    expect(console.log).toHaveBeenCalledWith('hello')
  })
})
