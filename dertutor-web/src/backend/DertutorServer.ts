import { type RXObservable } from 'flinker'
import { LoadAllLangsCmd } from './cmd/LoadAllLangsCmd'
import { RestApi, RestApiError } from './RestApi'
import { LoadVocabulariesCmd } from './cmd/LoadVocabulariesCmd'
import { LoadNotesCmd } from './cmd/LoadNotesCmd'

export class DertutorServer extends RestApi {
  readonly assetsUrl: string
  constructor() {
    //env is defined in dockerfile
    const baseUrl = import.meta.env.VITE_DERTUTOR_API_URL ?? 'http://localhost:3456/api'
    super(baseUrl)

    this.assetsUrl = this.baseUrl + '/asset'
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

}
