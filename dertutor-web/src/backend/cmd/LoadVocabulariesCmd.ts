import { type RXObservable, RXOperation } from 'flinker'
import { type RestApi, type RestApiError, type Runnable } from '../RestApi'

export class LoadVocabulariesCmd implements Runnable {
  private readonly api: RestApi
  private readonly landId: number

  constructor(api: RestApi, landId: number) {
    this.api = api
    this.landId = landId
  }

  run(): RXObservable<any[], RestApiError> {
    const op = new RXOperation<any, RestApiError>()
    this.startLoading(op).catch((e: RestApiError) => {
      op.fail(e)
    })
    return op.asObservable
  }

  private async startLoading(op: RXOperation<any[], RestApiError>) {
    console.log('LoadVocabulariesCmd:startLoading')
    const [response, body] = await this.api.sendRequest('GET', '/languages/' + this.landId + '/vocabularies')
    if (response?.ok) {
      op.success(body)
    } else {
      await this.api.handlerError(response)
    }
  }
}
