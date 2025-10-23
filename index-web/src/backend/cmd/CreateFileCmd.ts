import { type RXObservable, RXOperation } from 'flinker'
import { TextFile } from '../../domain/DomainModel'
import { type RestApi, type RestApiError, type Runnable } from '../RestApi'

export class CreateFileCmd implements Runnable {
  private readonly api: RestApi
  private readonly file: TextFile

  constructor(api: RestApi, f: TextFile) {
    this.api = api
    this.file = f
  }

  run(): RXObservable<any, RestApiError> {
    const op = new RXOperation<any, RestApiError>()
    this.store(op).catch((e: RestApiError) => { op.fail(e) })
    return op.asObservable
  }

  private async store(op: RXOperation<any, RestApiError>) {
    const file = this.file
    const data = JSON.stringify(file.serialize())
    const [response, body] = await this.api.sendRequest('POST', 'file/mk/' + file.path, data)
    if (response?.ok) {
      op.success(body)
    } else {
      await this.api.handlerError(response)
    }
  }
}
