import { type RXObservable, RXOperation } from 'flinker'
import { type RestApi, type RestApiError, type Runnable } from '../RestApi'

export class LoadFileCmd implements Runnable {
  private readonly api: RestApi
  private readonly path: string

  constructor(api: RestApi, path: string) {
    this.api = api
    this.path = path
  }

  run(): RXObservable<any, RestApiError> {
    const op = new RXOperation<any, RestApiError>()
    this.startLoading(op).catch((e: RestApiError) => {
      op.fail(e)
    })
    return op.asObservable
  }

  private async startLoading(op: RXOperation<any, RestApiError>) {
    console.log('LoadFileCmd:startLoading, path:', this.path)
    const path = 'file/' + this.path
    const [response, body] = await this.api.sendRequest('GET', path)
    if (response?.ok) {
      //setTimeout(() => op.success(body), 100)
      op.success(body)
    } else {
      await this.api.handlerError(response)
    }
  }
}
