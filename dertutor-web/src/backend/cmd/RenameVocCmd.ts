import { type RXObservable, RXOperation } from 'flinker'
import { type RestApi, type RestApiError, type Runnable } from '../RestApi'

export class RenameVocCmd implements Runnable {
  private readonly api: RestApi
  private readonly vocId: number
  private readonly newName: string

  constructor(api: RestApi, vocId: number, newName:string) {
    this.api = api
    this.vocId = vocId
    this.newName = newName
  }

  run(): RXObservable<any[], RestApiError> {
    const op = new RXOperation<any, RestApiError>()
    this.sending(op).catch((e: RestApiError) => {
      op.fail(e)
    })
    return op.asObservable
  }

  private async sending(op: RXOperation<any, RestApiError>) {
    console.log('RenameVocCmd:sending')
    const renameVocModel = {name: this.newName}
    const [response, body] = await this.api.sendRequest('PATCH', '/vocabularies/' + this.vocId + '/rename', JSON.stringify(renameVocModel))
    if (response?.ok) {
      op.success(body)
    } else {
      await this.api.handlerError(response)
    }
  }
}
