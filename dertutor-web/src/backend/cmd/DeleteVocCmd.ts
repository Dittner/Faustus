import { type RXObservable, RXOperation } from 'flinker'
import { type RestApi, type RestApiError, type Runnable } from '../RestApi'

export class DeleteVocCmd implements Runnable {
  private readonly api: RestApi
  private readonly vocId: number

  constructor(api: RestApi, vocId: number) {
    this.api = api
    this.vocId = vocId
  }

  run(): RXObservable<any[], RestApiError> {
    const op = new RXOperation<any, RestApiError>()
    this.sending(op).catch((e: RestApiError) => {
      op.fail(e)
    })
    return op.asObservable
  }

  private async sending(op: RXOperation<any, RestApiError>) {
    console.log('DeleteVocCmd:sending')

    const [response, body] = await this.api.sendRequest('DELETE', '/vocabularies', JSON.stringify({ id: this.vocId }))
    if (response?.ok) {
      op.success(body)
    } else {
      await this.api.handlerError(response)
    }
  }
}
