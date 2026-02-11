import { RXOperation } from 'flinker'

import { RestApi, RestApiError } from './RestApi'
import { Path } from '../app/Utils'
import { log } from '../app/Logger'

export interface SearchNoteByNameSchema {
  lang_id: number
  name: string
  voc_id?: number
}

export interface INote {
  readonly id: number
  readonly name: string
  readonly text: string
  readonly level: number | undefined
  readonly lang_id: number
  readonly voc_id: number
  readonly audio_url: string
  readonly tag_id: number | undefined
}

export class DetTutorServer extends RestApi {
  constructor() {
    //env is defined in dockerfile
    const baseUrl = import.meta.env.VITE_DERTUTOR_API_URL ?? 'VITE_DERTUTOR_API_URL not Found'
    super(baseUrl)

    log('DetTutorServer, baseUrl: ', this.baseUrl)
    this.ping()
  }

  //--------------------------------------
  //  note
  //--------------------------------------

  searchTranslation(word: string, lang: 'de' | 'en'): RXOperation<INote[], RestApiError> {
    const scheme = { lang_id: lang === 'de' ? 1 : 2, voc_id: lang === 'de' ? 1 : 2, name: word }
    const queryParams = Path.querify(scheme)
    return this.get('/notes/search_by_name?' + queryParams)
  }

}
