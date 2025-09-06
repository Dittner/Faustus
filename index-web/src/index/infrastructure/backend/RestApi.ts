import {PingCmd} from './cmd/PingCmd'
import {StoreFileCmd} from './cmd/StoreFileCmd'
import {LoadChildrenFilesCmd} from './cmd/LoadChildrenFilesCmd'
import {type AnyRXObservable, type RXObservable, RXObservableEntity, RXObservableValue} from 'flinker'
import {RemoveFileCmd} from './cmd/RemoveFileCmd'
import { GlobalContext } from '../../../global/GlobalContext'
import { TextFile } from '../../domain/IndexModel'

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE'
type RestApiErrorCategory = 'noConnection' | 'notAuthorized' | 'serverError' | 'clientError' | 'unknownError' | 'aborted'
export const NO_CONNECTION_STATUS = 0

export class RestApiError extends Error {
  readonly category: RestApiErrorCategory
  readonly statusCode: number
  constructor(category: RestApiErrorCategory, statusCode: number, message: string) {
    super(message)
    this.category = category
    this.statusCode = statusCode
    this.message = message
  }

  toString(): string {
    return 'RestApiError: ' + this.category + ', code: ' + this.statusCode + ', details: ' + this.message
  }
}

export interface Runnable {
  run: () => AnyRXObservable
}

export class RestApi extends RXObservableEntity<RestApi> {
  readonly baseUrl: string
  readonly assetsUrl: string
  readonly $isServerAvailable = new RXObservableValue(false)
  headers: any = {'Content-Type': 'application/json'}

  constructor() {
    super()
    //env is defined in dockerfile
    this.baseUrl = import.meta.env.VITE_INDEX_API_URL ?? 'http://localhost:3456/api/index'
    this.assetsUrl = this.baseUrl + '/asset'
    console.log('RestApi, baseUrl: ', this.baseUrl)
    this.ping()
  }

  ping(): RXObservable<any, RestApiError> {
    const cmd = new PingCmd(this)
    return cmd.run()
  }

  //--------------------------------------
  //  dir
  //--------------------------------------

  loadChildrenFiles(path: string): RXObservable<any, RestApiError> {
    const cmd = new LoadChildrenFilesCmd(this, path)
    return cmd.run()
  }

  storeFile(f: TextFile): RXObservable<any, RestApiError> {
    const cmd = new StoreFileCmd(this, f)
    return cmd.run()
  }

  removeFile(f: TextFile): RXObservable<any, RestApiError> {
    const cmd = new RemoveFileCmd(this, f)
    return cmd.run()
  }

  //--------------------------------------
  //  sendRequest
  //--------------------------------------

  async sendRequest(method: HttpMethod, path: string, body: string | null = null): Promise<[Response | null, any | null]> {
    try {
      console.log('===>', method + ':', path)
      const response = await fetch(this.baseUrl + path, {
        method,
        headers: this.headers,
        credentials: 'same-origin',
        body
      })

      console.log('<===', response.status, method, path)

      if (response.ok) {
        if (response.status === 204) {
          return [response, null]
        } else {
          try {
            const body = await response.json()
            return [response, body]
          } catch (_) {
          }
        }
      }
      return [response, null]
    } catch (e: any) {
      const msg = 'Unable to ' + method + ' resource: ' + this.baseUrl + path
      GlobalContext.self.app.$errorMsg.value = msg
      console.log(msg, '. Details:', e)
      return [null, null]
    }
  }

  async handlerError(response: Response | null): Promise<never> {
    if (response) {
      const details = (await this.getResponseDetails(response)) ?? ''
      console.log('Response status:', response.status)
      console.log('Problem details:', details)
      if (response.status === 401 || response.status === 403) {
        throw new RestApiError('notAuthorized', response.status, 'User not authorized')
      } else if (response.status === 400) {
        throw new RestApiError('clientError', response.status, details)
      } else if (response.status === 404) {
        throw new RestApiError('clientError', response.status, details)
      } else if (response.status >= 500) {
        throw new RestApiError('serverError', response.status, 'Server error: ' + details)
      } else {
        throw new RestApiError('unknownError', response.status, 'Unknown error: ' + details)
      }
    } else {
      throw new RestApiError('noConnection', NO_CONNECTION_STATUS, 'No response')
    }
  }

  async getResponseDetails(response: Response) {
    try {
      const details = await response.text()
      console.log('Details:', details)
      return details
    } catch (_) {}
    return null
  }
}
