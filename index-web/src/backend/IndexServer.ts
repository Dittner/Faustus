import { type RXObservable } from 'flinker'

import { TextFile } from '../domain/DomainModel'
import { RestApi, RestApiError } from './RestApi'


export class IndexServer extends RestApi {
  readonly assetsUrl: string
  constructor() {
    //env is defined in dockerfile
    const baseUrl = import.meta.env.VITE_INDEX_API_URL ?? 'http://localhost:3456/api'
    super(baseUrl)
    
    this.assetsUrl = this.baseUrl + '/asset'
    console.log('IndexServer, baseUrl: ', this.baseUrl)
    this.ping()
  }

  //--------------------------------------
  //  file
  //--------------------------------------

  loadFilesTree(): RXObservable<any, RestApiError> {
    return this.get('/file/tree')
  }

  loadFile(path: string): RXObservable<any, RestApiError> {
    return this.get('/file' + path)
  }

  rewriteFile(f: TextFile): RXObservable<any, RestApiError> {
    return this.post('/file/rw' + f.path, f.serialize())
  }

  createFile(f: TextFile): RXObservable<any, RestApiError> {
    return this.post('/file/mk' + f.path, f.serialize())
  }

  removeFile(path: string): RXObservable<any, RestApiError> {
    return this.post('/file/rm' + path)
  }

  renameFile(fromPath: string, toPath:string): RXObservable<any, RestApiError> {
    const requestBody = { from_src: fromPath, to_src: toPath }
    return this.post('/file/rn', requestBody)
  }

  //--------------------------------------
  //  voc
  //--------------------------------------

  loadAliasVoc(): RXObservable<any, RestApiError> {
    return this.get('/voc/alias')
  }
}
