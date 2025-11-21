import { type RXObservable, RXOperation } from 'flinker'
import { type RestApi, type RestApiError, type Runnable } from '../RestApi'

export class LoadNotesCmd implements Runnable {
  private readonly api: RestApi
  private readonly vocId: number

  constructor(api: RestApi, vocId: number) {
    this.api = api
    this.vocId = vocId
  }

  run(): RXObservable<any[], RestApiError> {
    const op = new RXOperation<any, RestApiError>()
    this.startLoading(op).catch((e: RestApiError) => {
      op.fail(e)
    })
    return op.asObservable
  }

  private async startLoading(op: RXOperation<any[], RestApiError>) {
    console.log('LoadNotesCmd:startLoading')
    const [response, body] = await this.api.sendRequest('GET', '/vocabularies/' + this.vocId + '/notes')
    if (response?.ok) {
      op.success(body)
    } else {
      await this.api.handlerError(response)
    }
  }
}
