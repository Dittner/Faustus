import { type RXObservable, RXOperation } from 'flinker'
import { type RestApi, type RestApiError, type Runnable } from '../RestApi'

export class UploadFileCmd implements Runnable {
  private readonly api: RestApi
  private readonly noteId: number
  private readonly file: File
  private readonly fileName: string

  constructor(api: RestApi, noteId: number, file: File, fileName:string) {
    this.api = api
    this.noteId = noteId
    this.file = file
    this.fileName = fileName
  }

  run(): RXObservable<any, RestApiError> {
    const op = new RXOperation<any, RestApiError>()
    this.sending(op).catch((e: RestApiError) => {
      op.fail(e)
    })
    return op.asObservable
  }

  private async sending(op: RXOperation<any, RestApiError>) {
    // this.file instanceof Blob === true
    console.log('UploadFileCmd:startLoading, f=', this.file)
    const formData = new FormData();
    formData.append('file', this.file, this.fileName)


    //const headers = { 'Content-Type': 'multipart/form-data' }
    const headers = {} // let browser to add 'Content-Type': 'multipart/form-data; boundary=----WebKitFormBou...' 
    const [response, body] = await this.api.sendRequest('POST', '/media/uploadfile/' + this.noteId, formData, headers)
    if (response?.ok) {
      op.success(body)
    } else {
      await this.api.handlerError(response)
    }
  }
}
