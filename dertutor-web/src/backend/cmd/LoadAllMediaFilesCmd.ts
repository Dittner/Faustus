import { type RXObservable, RXOperation } from 'flinker'
import { type RestApi, type RestApiError, type Runnable } from '../RestApi'

export class LoadAllMediaFilesCmd implements Runnable {
  private readonly api: RestApi
  private readonly noteId: number

  constructor(api: RestApi, noteId: number) {
    this.api = api
    this.noteId = noteId
  }

  run(): RXObservable<any[], RestApiError> {
    const op = new RXOperation<any[], RestApiError>()
    this.startLoading(op).catch((e: RestApiError) => {
      op.fail(e)
    })
    return op.asObservable
  }

  private async startLoading(op: RXOperation<any[], RestApiError>) {
    console.log('LoadAllMediaFilesCmd:startLoading')
    const [response, body] = await this.api.sendRequest('GET', '/notes/' + this.noteId + '/media')
    if (response?.ok) {
      op.success(body)
    } else {
      await this.api.handlerError(response)
    }
  }
}
