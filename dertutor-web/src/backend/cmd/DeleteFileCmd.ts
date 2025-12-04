import { type RXObservable, RXOperation } from 'flinker'
import { type RestApi, type RestApiError, type Runnable } from '../RestApi'

export class DeleteFileCmd implements Runnable {
  private readonly api: RestApi
  private readonly fileUID: string

  constructor(api: RestApi, fileUID: string) {
    this.api = api
    this.fileUID = fileUID
  }

  run(): RXObservable<any, RestApiError> {
    const op = new RXOperation<any, RestApiError>()
    this.sending(op).catch((e: RestApiError) => {
      op.fail(e)
    })
    return op.asObservable
  }

  private async sending(op: RXOperation<any, RestApiError>) {
    console.log('DeleteFileCmd:sending, fileUID=', this.fileUID)
    const [response, body] = await this.api.sendRequest('DELETE', '/media', JSON.stringify({ uid: this.fileUID }))
    if (response?.ok) {
      op.success(body)
    } else {
      await this.api.handlerError(response)
    }
  }
}
