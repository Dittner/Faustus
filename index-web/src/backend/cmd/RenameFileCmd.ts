import { type RXObservable, RXOperation } from 'flinker'
import { type RestApi, type RestApiError, type Runnable } from '../RestApi'

export class RenameFileCmd implements Runnable {
  private readonly api: RestApi
  private readonly fromPath: string
  private readonly toPath: string

  constructor(api: RestApi, fromPath: string, toPath: string) {
    this.api = api
    this.fromPath = fromPath
    this.toPath = toPath
  }

  run(): RXObservable<any, RestApiError> {
    const op = new RXOperation<any, RestApiError>()
    this.rename(op).catch((e: RestApiError) => { op.fail(e) })
    return op.asObservable
  }

  private async rename(op: RXOperation<any, RestApiError>) {
    const requestBody = { from_src: this.fromPath, to_src: this.toPath }
    const [response, body] = await this.api.sendRequest('POST', '/file/rn', JSON.stringify(requestBody))
    if (response?.ok) {
      op.success(body)
    } else {
      await this.api.handlerError(response)
    }
  }
}
