export class LocalStorage<T extends Record<string, any>> {
  readonly id: string
  private _data: T | undefined
  get data(): T | undefined { return this._data }

  constructor(id: string) {
    this.id = id
    const storedItem = localStorage.getItem(id);
    this._data = storedItem ? JSON.parse(storedItem) : undefined
  }

  read(key: string, value: any) {
  }
  store(d: T) {
    this._data = d
    localStorage.setItem(this.id, JSON.stringify(d))
  }

  clear() {
    this._data = undefined
    localStorage.removeItem(this.id)
  }
}