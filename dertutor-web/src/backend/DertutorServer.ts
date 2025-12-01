import { type RXObservable } from 'flinker'
import { LoadAllLangsCmd } from './cmd/LoadAllLangsCmd'
import { RestApi, RestApiError } from './RestApi'
import { LoadVocabulariesCmd } from './cmd/LoadVocabulariesCmd'
import { LoadNotesCmd } from './cmd/LoadNotesCmd'
import { Note } from '../domain/DomainModel'
import { UpdateNoteCmd } from './cmd/UpdateNoteCmd'
import { ValidateMp3LinkCmd } from './cmd/ValidateMp3LinkCmd'
import { CreateNoteCmd } from './cmd/CreateNoteCmd'

export class DertutorServer extends RestApi {
  readonly resourceUrl: string
  constructor() {
    //env is defined in dockerfile
    const baseUrl = import.meta.env.VITE_DERTUTOR_API_URL ?? 'http://localhost:3456/api'
    super(baseUrl)

    this.resourceUrl = this.baseUrl + '/resource'
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

  //--------------------------------------
  //  resources
  //--------------------------------------
  validateMp3Link(link: string): RXObservable<any, RestApiError> {
    const cmd = new ValidateMp3LinkCmd(this, link)
    return cmd.run()
  }
}
