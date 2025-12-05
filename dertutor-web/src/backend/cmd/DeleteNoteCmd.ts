import { type RXObservable, RXOperation } from 'flinker'
import { type RestApi, type RestApiError, type Runnable } from '../RestApi'

export class DeleteNoteCmd implements Runnable {
  private readonly api: RestApi
  private readonly noteId: number

  constructor(api: RestApi, noteId: number) {
    this.api = api
    this.noteId = noteId
  }

  run(): RXObservable<any[], RestApiError> {
    const op = new RXOperation<any, RestApiError>()
    this.sending(op).catch((e: RestApiError) => {
      op.fail(e)
    })
    return op.asObservable
  }

  private async sending(op: RXOperation<any, RestApiError>) {
    console.log('DeleteNoteCmd:sending')

    const [response, body] = await this.api.sendRequest('DELETE', '/notes', JSON.stringify({ id: this.noteId }))
    if (response?.ok) {
      op.success(body)
    } else {
      await this.api.handlerError(response)
    }
  }
}
