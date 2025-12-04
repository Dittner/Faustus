import { type RXObservable, RXOperation } from 'flinker'
import { type RestApi, type RestApiError, type Runnable } from '../RestApi'

export class LoadEnRuTranslationCmd implements Runnable {
  private readonly api: RestApi
  private readonly key: string

  constructor(api: RestApi, key: string) {
    this.api = api
    this.key = key
  }

  run(): RXObservable<any, RestApiError> {
    const op = new RXOperation<any, RestApiError>()
    this.startLoading(op).catch((e: RestApiError) => {
      op.fail(e)
    })
    return op.asObservable
  }

  private async startLoading(op: RXOperation<any, RestApiError>) {
    console.log('LoadEnRuTranslationCmd:startLoading')
    const encodedKey = encodeURIComponent(this.key)
    const path = '/corpus/en_ru/search?key=' + encodedKey

    const [response, body] = await this.api.sendRequest('GET', path)
    if (response?.ok) {
      op.success(body)
    } else {
      await this.api.handlerError(response)
    }
  }
}
