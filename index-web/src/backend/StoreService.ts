import { RXObservableEntity } from 'flinker'
import { GlobalContext } from '../app/GlobalContext'
import { generateUID, UID } from '../app/Utils'
import { TextFile } from '../domain/DomainModel'
import { type RestApi } from './RestApi'

export class StoreService extends RXObservableEntity<StoreService> {
  readonly uid = generateUID()
  private readonly restApi: RestApi
  private readonly pendingFilesToStore: TextFile[]

  get isStorePending(): boolean {
    return this.pendingFilesToStore.length > 0
  }

  constructor(restApi: RestApi) {
    super()
    console.log('new StoreService')
    this.restApi = restApi
    this.pendingFilesToStore = []
  }

  addToStoreQueue(f: TextFile | undefined) {
    //console.log('============== addToStoreQueue, f.uid:', f?.uid)
    if (f) {
      this.pendingFilesToStore.push(f)
      if (this.pendingFilesToStore.length === 1) {
        this.mutated()
      }
    }
  }

  store() {
    if (this.pendingFilesToStore.length > 0) {
      const hash = new Set<UID>()
      for (const f of this.pendingFilesToStore) {
        if (hash.has(f.id)) continue
        hash.add(f.id)
        this.restApi.storeFile(f).pipe()
          .onReceive(() => { f.id = f.info.id })
          .onError(e => { GlobalContext.self.app.$errorMsg.value = e.message + ', status code: ' + e.statusCode })
          .subscribe()
      }
      this.pendingFilesToStore.length = 0
      this.mutated()
    }
  }
}
