import { type RXObservable, RXOperation } from 'flinker'
import { type RestApi, type RestApiError, type Runnable } from '../RestApi'

export class RemoveFileCmd implements Runnable {
  private readonly api: RestApi
  private readonly path: string

  constructor(api: RestApi, path: string) {
    this.api = api
    this.path = path
  }

  run(): RXObservable<any, RestApiError> {
    const op = new RXOperation<any, RestApiError>()
    this.remove(op).catch((e: RestApiError) => { op.fail(e) })
    return op.asObservable
  }

  private async remove(op: RXOperation<any, RestApiError>) {
    const [response, body] = await this.api.sendRequest('POST', '/file/rm' + this.path)
    if (response?.ok) {
      op.success(body)
    } else {
      await this.api.handlerError(response)
    }
  }
}
