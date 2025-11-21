import { type RXObservable, RXOperation } from 'flinker'
import { RestApi, type RestApiError, type Runnable } from '../RestApi'

export class PingCmd implements Runnable {
  private readonly api: RestApi

  constructor(api: RestApi) {
    this.api = api
  }

  run(): RXObservable<any, RestApiError> {
    console.log('CheckServerCmd, running...')

    const op = new RXOperation<any, RestApiError>()
    this.sendRequest(op).catch((e: RestApiError) => { op.fail(e) })
    return op.asObservable
  }

  private async sendRequest(op: RXOperation<any, RestApiError>) {
    const [response, _] = await this.api.sendRequest('GET', '')
    console.log('CheckServerCmd, isServerReady: ', response?.ok)
    this.api.$isServerAvailable.value = response?.ok ?? false

    if (response?.ok) {
      op.success('ok')
    } else {
      await this.api.handlerError(response)
    }
  }
}
