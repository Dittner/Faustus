import { type RXObservable, RXOperation } from 'flinker'
import { type RestApi, type RestApiError, type Runnable } from '../RestApi'

export class LoadFilesAliasCmd implements Runnable {
  private readonly api: RestApi

  constructor(api: RestApi) {
    this.api = api
  }

  run(): RXObservable<any, RestApiError> {
    const op = new RXOperation<any, RestApiError>()
    this.startLoading(op).catch((e: RestApiError) => {
      op.fail(e)
    })
    return op.asObservable
  }

  private async startLoading(op: RXOperation<any, RestApiError>) {
    console.log('LoadFilesAliasCmd:startLoading')
    const [response, body] = await this.api.sendRequest('GET', '/voc/alias')
    if (response?.ok) {
      //setTimeout(() => op.success(body), 100)
      op.success(body)
    } else {
      await this.api.handlerError(response)
    }
  }
}
