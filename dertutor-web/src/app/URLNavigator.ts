import { RXObservableValue } from "flinker"
import { globalContext } from "../App"
import { Application, BrowserLocation } from "./Application"

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
  readonly $keys = new RXObservableValue<UrlKeys>({})

  //get url(): string { return this.app.$location.value }

  constructor(app:Application) {
    app.$location.pipe()
      .onReceive(location => {
        console.log('URLNavigator: received new location')
        this.$keys.value = this.parseUrl(location)
      })
      .subscribe()
  }

  //url=/en/lexicon?page=1&note=20&level=0&tag=0
  //url=/en/search?key=some_text&page=1&note=20
  private parseUrl(location: BrowserLocation): UrlKeys {
    console.log('new url:', location.path + location.queries)
    const path = location.path .startsWith('/') ? location.path.slice(1) :location.path
    const values = path.split('/')
    const params = new URLSearchParams(location.queries)

    return {
      langCode: values.length > 0 ? values[0] || undefined : undefined,
      vocCode: values.length > 1 && values[1] !== 'search' ? values[1] || undefined : undefined,
      noteId: params.has('note') ? Number(params.get('note')) : undefined,
      level: params.has('level') ? Number(params.get('level')) : undefined,
      tagId: params.has('tag') ? Number(params.get('tag')) : undefined,
      page: params.has('page') ? Number(params.get('page')) : undefined,
      searchKey: params.get('key') ?? undefined,
    }
  }

  buildLink(keys: UrlKeys) {
    if (!keys.langCode) return '/'
    
    const isSearching = keys.searchKey && keys.searchKey.length > 1
    if (keys.vocCode === undefined && !isSearching) return `/${keys.langCode}`

    let res = `/${keys.langCode}`
    res += isSearching ? '/search?' : `/${keys.vocCode}?`
    res += keys.page !== undefined ? `page=${keys.page}` : 'page=1'
    if (keys.noteId !== undefined) res += `&note=${keys.noteId}`
    if (keys.level !== undefined) res += `&level=${keys.level}`
    if (keys.tagId !== undefined) res += `&tag=${keys.tagId}`
    if (keys.searchKey) res += `&key=${keys.searchKey}`
    return res
  }

  navigateTo(keys: UrlKeys) {
    globalContext.app.navigate(this.buildLink(keys))
  }
}