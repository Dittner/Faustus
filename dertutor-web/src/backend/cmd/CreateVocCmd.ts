import { type RXObservable, RXOperation } from 'flinker'
import { type RestApi, type RestApiError, type Runnable } from '../RestApi'
import { Vocabulary } from '../../domain/DomainModel'

export class CreateVocCmd implements Runnable {
  private readonly api: RestApi
  private readonly voc: Vocabulary

  constructor(api: RestApi, voc: Vocabulary) {
    this.api = api
    this.voc = voc
  }

  run(): RXObservable<any[], RestApiError> {
    const op = new RXOperation<any, RestApiError>()
    this.sending(op).catch((e: RestApiError) => {
      op.fail(e)
    })
    return op.asObservable
  }

  private async sending(op: RXOperation<any, RestApiError>) {
    console.log('CreateVocCmd:sending')
    const langCreateModel = this.voc.serialize()
    const [response, body] = await this.api.sendRequest('POST', '/vocabularies', JSON.stringify(langCreateModel))
    if (response?.ok) {
      op.success(body)
    } else {
      await this.api.handlerError(response)
    }
  }
}
