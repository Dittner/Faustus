import { type RXObservable } from 'flinker'
import { RestApi, RestApiError } from './RestApi'
import { CreateNoteSchema, CreateVocSchema, DeleteMedialFileSchema, DeleteNoteSchema, DeleteVocSchema, GetPageOfNotesSchema, RenameNoteSchema, RenameVocSchema, UpdateNoteSchema } from './Schema'
import { Path } from '../app/Utils'

export class DertutorServer extends RestApi {
  constructor() {
    //env is defined in dockerfile
    const baseUrl = import.meta.env.VITE_DERTUTOR_API_URL ?? 'http://localhost:3456/api'
    super(baseUrl)

    this.ping()
  }

  //--------------------------------------
  //  langs
  //--------------------------------------

  loadAllLangs(): RXObservable<any[], RestApiError> {
    return this.get('/langs/full')
  }

  //--------------------------------------
  //  vocs
  //--------------------------------------

  createVoc(schema: CreateVocSchema): RXObservable<any, RestApiError> {
    return this.post('/vocs', schema)
  }

  renameVoc(schema: RenameVocSchema): RXObservable<any, RestApiError> {
    return this.patch('/vocs/rename', schema)
  }

  deleteVoc(schema: DeleteVocSchema): RXObservable<any, RestApiError> {
    return this.delete('/vocs', schema)
  }

  //--------------------------------------
  //  notes
  //--------------------------------------

  loadNotes(scheme: GetPageOfNotesSchema): RXObservable<any, RestApiError> {
    const queryParams = Path.querify(scheme)
    return this.get('/notes/search?' + queryParams)
  }

  loadNote(noteId: number): RXObservable<any, RestApiError> {
    return this.get('/notes?note_id=' + noteId)
  }

  createNote(scheme: CreateNoteSchema): RXObservable<any, RestApiError> {
    return this.post('/notes', scheme)
  }

  updateNote(scheme: UpdateNoteSchema): RXObservable<any, RestApiError> {
    return this.put('/notes', scheme)
  }

  renameNote(scheme: RenameNoteSchema): RXObservable<any, RestApiError> {
    return this.patch('/notes/rename', scheme)
  }

  deleteNote(scheme: DeleteNoteSchema): RXObservable<any, RestApiError> {
    return this.delete('/notes', scheme)
  }

  //--------------------------------------
  //  media
  //--------------------------------------
  validateMp3Link(link: string): RXObservable<any, RestApiError> {
    return this.head(link)
  }

  loadEnRuTranslation(key: string): RXObservable<any, RestApiError> {
    const encodedKey = encodeURIComponent(key)
    const path = '/corpus/en_ru/search?key=' + encodedKey
    return this.get(path)
  }

  uploadFile(noteId: number, file: File, fileName: string): RXObservable<any, RestApiError> {
    console.log('UploadFileCmd:startLoading, f=', file)
    const formData = new FormData();
    formData.append('file', file, fileName)

    //DO NOT USE THESE HEADERS: { 'Content-Type': 'multipart/form-data' }
    //let browser to add 'Content-Type': 'multipart/form-data; boundary=----WebKitFormBou...' 
    const headers = {}
    return this.post('/media/uploadfile/' + noteId, formData, headers)
  }

  deleteFile(schema: DeleteMedialFileSchema): RXObservable<any, RestApiError> {
    return this.delete('/media', schema)
  }
}
