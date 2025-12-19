import { RXObservableValue } from "flinker"
import { globalContext } from "../App"

//url=/en/filter?voc=2&page=1&note=20&level=0&tag=0
//url=/en/search?key=text_to_search&page=1&note=20
export interface UrlKeys {
  readonly langCode?: string
  readonly vocCode?: string
  readonly noteId?: number
  readonly level?: number
  readonly tagId?: number
  readonly searchKey?: string
  readonly page?: number
}

export class URLNavigator {
  readonly $keys: RXObservableValue<UrlKeys>

  private _url = ''
  get url(): string { return this._url }
  private setUrl(value: string) {
    if (value !== this._url) {
      this._url = value
      globalContext.app.navigate(value)
    }
  }

  constructor() {
    this.$keys = new RXObservableValue(this.parseUrl())
  }

  buildUrl(value: UrlKeys) {
    const k = value
    if (!k.langCode) return '/'

    if (k.vocCode === undefined) return `/${k.langCode}`

    let res = `/${k.langCode}/${k.vocCode}/search?`
    res += k.page !== undefined ? `page=${k.page}` : '&page=1'
    if (k.noteId !== undefined) res += `&note=${k.noteId}`
    if (k.level !== undefined) res += `&level=${k.level}`
    if (k.tagId !== undefined) res += `&tag=${k.tagId}`
    if (k.searchKey) res += `&key=${k.searchKey}`
    return res
  }

  navigateTo(value: UrlKeys) {
    if (value !== this.$keys.value) {
      this.setUrl(this.buildUrl(value))
      this.$keys.value = value
    }
  }

  private parseUrl(): UrlKeys {
    let path = document.location.pathname
    if (path.startsWith('/')) path = path.slice(1)
    const values = path.split('/')
    const params = new URLSearchParams(document.location.search)

    return {
      langCode: values.length > 0 ? values[0] || undefined : undefined,
      vocCode: values.length > 1 ? values[1] || undefined : undefined,
      noteId: params.has('note') ? Number(params.get('note')) : undefined,
      level: params.has('level') ? Number(params.get('level')) : undefined,
      tagId: params.has('tag') ? Number(params.get('tag')) : undefined,
      page: params.has('page') ? Number(params.get('page')) : undefined,
      searchKey: params.get('key') ?? undefined
    }
  }
}