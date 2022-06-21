// TODO: use randomUUID
import { v4 as uuid } from 'uuid'
import colors from '@colors/colors'

export class Logger {
  constructor(private readonly _id: string = uuid()) {
    this._id
  }

  get id() {
    return this._id
  }

  static log(message: string, ...optionalParams: any[]) {
    console.log(message, ...optionalParams)
  }

  static error(message: string, ...optionalParams: any[]) {
    console.error(colors.red(message), ...optionalParams)
    console.trace()
  }

  static warn(message: string, ...optionalParams: any[]) {
    console.warn(colors.yellow(message), ...optionalParams)
  }

  static success(message: string, ...optionalParams: any[]) {
    console.log(colors.green(message), ...optionalParams)
  }

  static debugPrint(payload: any) {
    console.log(JSON.stringify(payload, null, 2))
  }

  log(message: string) {
    Logger.log(`[${this._id}] ${message}`)
  }

  error(message: string) {
    Logger.error(`[${this._id}] [ERROR] ${message}`)
  }

  info(message: string) {
    Logger.log(`[${this._id}] [INFO] ${message}`)
  }

  warn(message: string) {
    Logger.warn(`[${this._id}] [WARN] ${message}`)
  }

  debug(message: string) {
    Logger.log(`[${this._id}] [DEBUG] ${message}`)
  }

  success(message: string) {
    Logger.success(`[${this._id}] [SUCCESS] ${message}`)
  }

  debugPrint(payload: any) {
    Logger.debugPrint(`[${this._id}] ${JSON.stringify(payload, null, 2)}`)
  }
}
