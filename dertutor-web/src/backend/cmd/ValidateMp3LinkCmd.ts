import { type RXObservable, RXOperation } from 'flinker'
import { type RestApi, type RestApiError, type Runnable } from '../RestApi'

export class ValidateMp3LinkCmd implements Runnable {
  private readonly api: RestApi
  private readonly link: string

  constructor(api: RestApi, link: string) {
    this.api = api
    this.link = link
  }

  run(): RXObservable<any, RestApiError> {
    const op = new RXOperation<any, RestApiError>()
    this.startLoading(op).catch((e: RestApiError) => {
      op.fail(e)
    })
    return op.asObservable
  }

  private async startLoading(op: RXOperation<any, RestApiError>) {
    console.log('ValidateMp3LinkCmd:startLoading')

    const [response, body] = await this.api.sendRequest('HEAD', this.link)
    if (response?.ok) {
      op.success(body)
    } else {
      await this.api.handlerError(response)
    }
  }
}
