import { type AnyRXObservable, type RXObservable, RXObservableValue } from 'flinker'

import { PingCmd } from './cmd/PingCmd'

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE'
export type RestApiErrorCategory = 'noConnection' | 'notAuthorized' | 'serverError' | 'clientError' | 'unknownError' | 'aborted'
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

export class RestApi {
  readonly baseUrl: string

  readonly $isServerAvailable = new RXObservableValue(false)
  headers: any = { 'Content-Type': 'application/json' }

  constructor(baseUrl: string,) {
    this.baseUrl = baseUrl
    console.log('RestApi, baseUrl: ', this.baseUrl)
    this.ping()
  }

  ping(): RXObservable<any, RestApiError> {
    const cmd = new PingCmd(this)
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
