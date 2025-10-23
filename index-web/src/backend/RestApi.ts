import { type AnyRXObservable, type RXObservable, RXObservableEntity, RXObservableValue } from 'flinker'

import { TextFile } from '../domain/DomainModel'
import { LoadFileCmd } from './cmd/LoadFileCmd'
import { PingCmd } from './cmd/PingCmd'
import { RemoveFileCmd } from './cmd/RemoveFileCmd'
import { RewriteFileCmd } from './cmd/RewriteFileCmd'
import { LoadFilesAliasCmd } from './cmd/LoadFilesAliasCmd'
import { LoadFilesTreeCmd } from './cmd/LoadFilesTreeCmd'
import { CreateFileCmd } from './cmd/CreateFileCmd'
import { RenameFileCmd } from './cmd/RenameFileCmd'

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
  headers: any = { 'Content-Type': 'application/json' }

  constructor() {
    super()
    //env is defined in dockerfile
    this.baseUrl = import.meta.env.VITE_INDEX_API_URL ?? 'http://localhost:3456/api/'
    this.assetsUrl = this.baseUrl + 'asset/'
    console.log('RestApi, baseUrl: ', this.baseUrl)
    this.ping()
  }

  ping(): RXObservable<any, RestApiError> {
    const cmd = new PingCmd(this)
    return cmd.run()
  }

  //--------------------------------------
  //  file
  //--------------------------------------

  loadFilesTree(): RXObservable<any, RestApiError> {
    const cmd = new LoadFilesTreeCmd(this)
    return cmd.run()
  }

  loadFile(path: string): RXObservable<any, RestApiError> {
    const cmd = new LoadFileCmd(this, path)
    return cmd.run()
  }

  rewriteFile(f: TextFile): RXObservable<any, RestApiError> {
    const cmd = new RewriteFileCmd(this, f)
    return cmd.run()
  }

  createFile(f: TextFile): RXObservable<any, RestApiError> {
    const cmd = new CreateFileCmd(this, f)
    return cmd.run()
  }

  removeFile(path: string): RXObservable<any, RestApiError> {
    const cmd = new RemoveFileCmd(this, path)
    return cmd.run()
  }

  renameFile(fromPath: string, toPath:string): RXObservable<any, RestApiError> {
    const cmd = new RenameFileCmd(this, fromPath, toPath)
    return cmd.run()
  }

  //--------------------------------------
  //  voc
  //--------------------------------------

  loadAliasVoc(): RXObservable<any, RestApiError> {
    const cmd = new LoadFilesAliasCmd(this)
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
      const msg = 'Failed to ' + method + ' resource: ' + this.baseUrl + path
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
    } catch (_) { }
    return null
  }
}
