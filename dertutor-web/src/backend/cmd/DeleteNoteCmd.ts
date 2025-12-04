import { type RXObservable, RXOperation } from 'flinker'
import { type RestApi, type RestApiError, type Runnable } from '../RestApi'
import { Note } from '../../domain/DomainModel'

export class DeleteNoteCmd implements Runnable {
  private readonly api: RestApi
  private readonly note: Note

  constructor(api: RestApi, note: Note) {
    this.api = api
    this.note = note
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

    const [response, body] = await this.api.sendRequest('DELETE', '/notes', JSON.stringify({ id: this.note.id }))
    if (response?.ok) {
      op.success(body)
    } else {
      await this.api.handlerError(response)
    }
  }
}
