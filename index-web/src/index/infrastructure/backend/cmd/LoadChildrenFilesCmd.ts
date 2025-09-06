import { type RestApi, type RestApiError, type Runnable } from '../RestApi'
import { type RXObservable, RXOperation } from 'flinker'

export class LoadChildrenFilesCmd implements Runnable {
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

  private async startLoading(op: RXOperation<File[], RestApiError>) {
    console.log('LoadChildrenFilesCmd:startLoading, dir link:', this.path)
    const path = this.path ? '/dir' + this.path : '/dir'
    const [response, body] = await this.api.sendRequest('GET', path)
    if (response?.ok) {
      //setTimeout(() => op.success(body), 100)
      op.success(body)
    } else {
      await this.api.handlerError(response)
    }
  }
}
