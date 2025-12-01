import { type RXObservable } from 'flinker'

import { TextFile } from '../domain/DomainModel'
import { LoadFileCmd } from './cmd/LoadFileCmd'
import { RemoveFileCmd } from './cmd/RemoveFileCmd'
import { RewriteFileCmd } from './cmd/RewriteFileCmd'
import { LoadFilesAliasCmd } from './cmd/LoadFilesAliasCmd'
import { LoadFilesTreeCmd } from './cmd/LoadFilesTreeCmd'
import { CreateFileCmd } from './cmd/CreateFileCmd'
import { RenameFileCmd } from './cmd/RenameFileCmd'
import { RestApi, RestApiError } from './RestApi'


export class IndexServer extends RestApi {
  readonly assetsUrl: string
  constructor() {
    //env is defined in dockerfile
    const baseUrl = import.meta.env.VITE_INDEX_API_URL ?? 'http://localhost:3456/api'
    super(baseUrl)
    
    this.assetsUrl = this.baseUrl + 'asset/'
    console.log('IndexServer, baseUrl: ', this.baseUrl)
    this.ping()
  }

  //--------------------------------------
  //  file
  //--------------------------------------

  loadFilesTree(): RXObservable<any, RestApiError> {
    const cmd = new LoadFilesTreeCmd(this)
    return cmd.run()
  }

  loadFile(path: string): RXObservable<any, RestApiError> {
    const cmd = new LoadFileCmd(this, path)
    return cmd.run()
  }

  rewriteFile(f: TextFile): RXObservable<any, RestApiError> {
    const cmd = new RewriteFileCmd(this, f)
    return cmd.run()
  }

  createFile(f: TextFile): RXObservable<any, RestApiError> {
    const cmd = new CreateFileCmd(this, f)
    return cmd.run()
  }

  removeFile(path: string): RXObservable<any, RestApiError> {
    const cmd = new RemoveFileCmd(this, path)
    return cmd.run()
  }

  renameFile(fromPath: string, toPath:string): RXObservable<any, RestApiError> {
    const cmd = new RenameFileCmd(this, fromPath, toPath)
    return cmd.run()
  }

  //--------------------------------------
  //  voc
  //--------------------------------------

  loadAliasVoc(): RXObservable<any, RestApiError> {
    const cmd = new LoadFilesAliasCmd(this)
    return cmd.run()
  }
}
