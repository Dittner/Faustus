import { log, logWarn } from "./Logger"

export enum StoreState {
  IDLE = 'IDLE',
  PENDING = 'PENDING',
  WRITING = 'WRITING',
}

export class KeyValueStore {
  readonly id: string
  private _data: any
  private name: string

  private _isEmpty: boolean = true
  get isEmpty(): boolean { return this._isEmpty }


  constructor(id: string) {
    this.id = id
    this.name = `${id}-KeyValueStore`
    log('new ' + this.name)

    this._data = Object.create(null)
    this.init()
  }

  private init() {
    try {
      const json = window.localStorage.getItem(this.id)
      if (json) {
        const fileContent = JSON.parse(json)
        this._isEmpty = json === '{}'
        this._data = fileContent
      } else {
        log(this.name + ', no stored data')
      }
    } catch (e) {
      logWarn(this.name + ' ' + e)
    }
  }

  has(key: string): boolean {
    return this._data[key] !== undefined
  }

  read(key: string): any | undefined {
    return this._data[key]
  }

  readAll(): any[] {
    return Object.values(this._data)
  }

  write(key: string, value: any, overwrite = false) {
    if (overwrite || value !== this._data[key]) {
      this._data[key] = value
      this._isEmpty = false
      this.delayWriteToDisc()
    }
  }

  remove(key: string): any {
    if (this.has(key)) {
      this._data[key] = undefined
      this.delayWriteToDisc()
    }
  }

  clear() {
    this._data = Object.create(null)
    this._isEmpty = true
    this.delayWriteToDisc()
  }

  //
  // pending writing
  //
  private status = StoreState.IDLE
  private hasChanges = false
  private delayWriteToDisc() {
    if (this.status === StoreState.IDLE) {
      this.status = StoreState.PENDING
      setTimeout(() => {
        this.writeToBrowserStore()
      }, 10)
    } else if (this.status === StoreState.WRITING) {
      this.hasChanges = true
    }
  }

  private writeToBrowserStore() {
    if (this.status === StoreState.PENDING) {
      this.status = StoreState.WRITING
      const json = JSON.stringify(this._data)
      window.localStorage.setItem(this.id, json)
      this._isEmpty = json === '{}'
      log(`${this.name}::writeToDisc, successfully, isEmpty:`, this._isEmpty)
      this.status = StoreState.IDLE
      if (this.hasChanges) {
        this.hasChanges = false
        this.delayWriteToDisc()
      }
    }
  }
}
