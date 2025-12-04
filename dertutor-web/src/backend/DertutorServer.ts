import { type RXObservable } from 'flinker'
import { Note } from '../domain/DomainModel'
import { CreateNoteCmd } from './cmd/CreateNoteCmd'
import { LoadAllLangsCmd } from './cmd/LoadAllLangsCmd'
import { LoadAllMediaFilesCmd } from './cmd/LoadAllMediaFilesCmd'
import { LoadEnRuTranslationCmd } from './cmd/LoadEnRuTranslationCmd'
import { LoadNotesCmd } from './cmd/LoadNotesCmd'
import { LoadVocabulariesCmd } from './cmd/LoadVocabulariesCmd'
import { UpdateNoteCmd } from './cmd/UpdateNoteCmd'
import { UploadFileCmd } from './cmd/UploadFileCmd'
import { ValidateMp3LinkCmd } from './cmd/ValidateMp3LinkCmd'
import { RestApi, RestApiError } from './RestApi'
import { DeleteFileCmd } from './cmd/DeleteFileCmd'
import { DeleteNoteCmd } from './cmd/DeleteNoteCmd'

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
    const cmd = new LoadAllLangsCmd(this)
    return cmd.run()
  }

  //--------------------------------------
  //  vocabularies
  //--------------------------------------

  loadVocabularies(landId: number): RXObservable<any[], RestApiError> {
    const cmd = new LoadVocabulariesCmd(this, landId)
    return cmd.run()
  }

  //--------------------------------------
  //  notes
  //--------------------------------------

  loadNotes(vocId: number): RXObservable<any[], RestApiError> {
    const cmd = new LoadNotesCmd(this, vocId)
    return cmd.run()
  }

  createNote(n: Note): RXObservable<any, RestApiError> {
    const cmd = new CreateNoteCmd(this, n)
    return cmd.run()
  }

  updateNote(n: Note): RXObservable<any, RestApiError> {
    const cmd = new UpdateNoteCmd(this, n)
    return cmd.run()
  }

  deleteNote(n: Note): RXObservable<any, RestApiError> {
    const cmd = new DeleteNoteCmd(this, n)
    return cmd.run()
  }


  //--------------------------------------
  //  media
  //--------------------------------------
  validateMp3Link(link: string): RXObservable<any, RestApiError> {
    const cmd = new ValidateMp3LinkCmd(this, link)
    return cmd.run()
  }

  loadEnRuTranslation(key: string): RXObservable<any, RestApiError> {
    const cmd = new LoadEnRuTranslationCmd(this, key)
    return cmd.run()
  }

  loadAllMediaFiles(noteId: number): RXObservable<any[], RestApiError> {
    const cmd = new LoadAllMediaFilesCmd(this, noteId)
    return cmd.run()
  }

  uploadFile(noteId: number, file: File, fileName:string): RXObservable<any, RestApiError> {
    const cmd = new UploadFileCmd(this, noteId, file, fileName)
    return cmd.run()
  }

  deleteFile(fileUID:string): RXObservable<any, RestApiError> {
    const cmd = new DeleteFileCmd(this, fileUID)
    return cmd.run()
  }
}
