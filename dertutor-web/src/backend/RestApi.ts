import { type AnyRXObservable, type RXObservable, RXObservableValue, RXOperation } from 'flinker'

import { PingCmd } from './cmd/PingCmd'

export type HttpMethod = 'HEAD' | 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
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

export class RestApiCmd implements Runnable {
  private readonly api: RestApi
  private readonly method: HttpMethod
  private readonly path: string
  private readonly body: any
  private readonly headers: any

  constructor(api: RestApi, method: HttpMethod, path: string, body: any = undefined, headers:any = undefined) {
    this.api = api
    this.method = method
    this.path = path
    this.body = body
    this.headers = headers
  }

  run(): RXOperation<any, RestApiError> {
    const op = new RXOperation<any, RestApiError>()
    this.startLoading(op).catch((e: RestApiError) => {
      op.fail(e)
    })
    return op
  }

  private async startLoading(op: RXOperation<any, RestApiError>) {
    console.log('RestApiCmd:startLoading')
    const [response, body] = await this.api.sendRequest(this.method, this.path, this.body && JSON.stringify(this.body), this.headers)
    if (response?.ok) {
      op.success(body)
    } else {
      await this.api.handlerError(response)
    }
  }
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

  //--------------------------------------
  //  methods
  //--------------------------------------

  ping(): RXObservable<any, RestApiError> {
    const cmd = new PingCmd(this)
    return cmd.run()
  }

  head(path: string): RXOperation<any, RestApiError> {
    const cmd = new RestApiCmd(this, 'HEAD', path)
    return cmd.run()
  }

  get(path: string): RXOperation<any, RestApiError> {
    const cmd = new RestApiCmd(this, 'GET', path)
    return cmd.run()
  }

  post(path: string, schema: any, headers:any = undefined): RXOperation<any, RestApiError> {
    const cmd = new RestApiCmd(this, 'POST', path, schema, headers)
    return cmd.run()
  }

  patch(path: string, schema: any): RXOperation<any, RestApiError> {
    const cmd = new RestApiCmd(this, 'PATCH', path, schema)
    return cmd.run()
  }

  put(path: string, schema: any): RXOperation<any, RestApiError> {
    const cmd = new RestApiCmd(this, 'PUT', path, schema)
    return cmd.run()
  }

  delete(path: string, schema: any): RXOperation<any, RestApiError> {
    const cmd = new RestApiCmd(this, 'DELETE', path, schema)
    return cmd.run()
  }

  //--------------------------------------
  //  sendRequest
  //--------------------------------------

  async sendRequest(method: HttpMethod, path: string, body: string | FormData | null = null, headers: any | null = null): Promise<[Response | null, any | null]> {
    try {
      const url = path.indexOf('http') === 0 ? path : this.baseUrl + path
      console.log('===>', method + ':', url)
      const response = await fetch(url, {
        method,
        headers: headers ?? this.headers,
        //credentials: 'same-origin',
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
      const url = path.indexOf('http') === 0 ? path : this.baseUrl + path
      const msg = 'Failed to ' + method + ' resource: ' + url
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
        throw new RestApiError('clientError', response.status, details || 'Not found')
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
