import { type RXObservable, RXOperation } from 'flinker'
import { type RestApi, type RestApiError, type Runnable } from '../RestApi'
import { Note } from '../../domain/DomainModel'

export class RenameNoteCmd implements Runnable {
  private readonly api: RestApi
  private readonly note: Note
  private readonly newTitle: string

  constructor(api: RestApi, note: Note, newTitle:string) {
    this.api = api
    this.note = note
    this.newTitle = newTitle
  }

  run(): RXObservable<any[], RestApiError> {
    const op = new RXOperation<any, RestApiError>()
    this.sending(op).catch((e: RestApiError) => {
      op.fail(e)
    })
    return op.asObservable
  }

  private async sending(op: RXOperation<any, RestApiError>) {
    console.log('RenameNoteCmd:sending')
    const [response, body] = await this.api.sendRequest('PATCH', '/notes/' + this.note.id + '/rename', JSON.stringify({ title: this.newTitle }))
    if (response?.ok) {
      op.success(body)
    } else {
      await this.api.handlerError(response)
    }
  }
}
