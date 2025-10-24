import { RXObservableEntity } from 'flinker'
import { generateUID, Path } from '../app/Utils'

interface Serializable {
  serialize: () => string
}

/*
*
*
* DOMAIN ENTITY
*
*
* */


export const FILE_SECTION_ALIAS = '[ALIAS]'
export const FILE_SECTION_AUTHOR = '[AUTHOR]'
export const FILE_SECTION_PUBLISHED = '[PUBLISHED]'
export const FILE_SECTION_BODY = '[BODY]'
export const FILE_SECTION_BIRTH_YEAR = '[BIRTH_YEAR]'
export const FILE_SECTION_DEATH_YEAR = '[DEATH_YEAR]'

export class TextFile extends RXObservableEntity<TextFile> {
  readonly uid = generateUID()
  isDamaged = false
  isDirectory = false
  path: string = ''
  name: string = ''
  alias: string = ''
  birthYear: string = ''
  deathYear: string = ''
  author: string = ''
  published: string = ''
  scrollPos = 0
  data: any = { text: '' }

  private _hasChanges = false
  get hasChanges() { return this._hasChanges }
  set hasChanges(value: boolean) {
    if (value !== this._hasChanges) {
      this._hasChanges = value
      this.mutated()
    }
  }

  constructor() {
    super()
    this._pages = []
  }

  deserialize(data: any) {
    try {
      this.data = data
      console.log('File: ' + data?.path + ', isDir:', data.is_dir)

      if (data === undefined || data.path == undefined || data.is_dir == undefined) {
        console.log('File:deserialize, file is damaged, data:', data)
        this.isDamaged = true
      }
      else {
        this.path = data.path
        this.name = Path.stem(data.path)
        this.isDirectory = data.is_dir

        if (data.text) {
          const sepIndex = data.text.indexOf(FILE_SECTION_BODY)
          const headers = sepIndex === -1 ? data.text : data.text.substring(0, sepIndex).replace(/[\n| ]+$/, '')
          const body = sepIndex === -1 ? '' : data.text.substring(sepIndex + FILE_SECTION_BODY.length + 1)

          this.parseHeaders(headers)

          this._pages = body ? body.split('\n\n\n').map((text: string) => new Page(this, text)) : []
          this.isDamaged = false
        }
      }
    } catch (e: any) {
      this.isDamaged = true
      console.log('File:deserialize, err:', e.message, 'data:', data)
    }
    this.hasChanges = false
    this.mutated()
  }

  private parseHeaders(text: string) {
    const keyValues = text.replace(/\n{3,}/g, '\n\n').split('\n\n')

    for (let i = 0; i < keyValues.length; i++) {
      const keyValue = keyValues[i]
      const sepIndex = keyValue.indexOf('\n')
      const key = sepIndex === -1 ? keyValue : keyValue.substring(0, sepIndex)
      const value = sepIndex === -1 ? '' : keyValue.substring(sepIndex + 1)

      if (!key) continue

      if (key === FILE_SECTION_ALIAS) {
        this.alias = value
      } else if (key === FILE_SECTION_AUTHOR) {
        this.author = value
      } else if (key === FILE_SECTION_PUBLISHED) {
        this.published = value
      } else if (key === FILE_SECTION_BIRTH_YEAR) {
        this.birthYear = value
      } else if (key === FILE_SECTION_DEATH_YEAR) {
        this.deathYear = value
      } else {
        console.warn('TextFile:deserialize:parseHeaders, unknown tag:', key, ', keyValues:')
        console.warn(keyValues)
      }
    }
  }

  serialize(): any {
    if (this.isDirectory) return { is_dir: true, text: '', alias: this.path }

    let text = ''

    if (this.alias)
      text += FILE_SECTION_ALIAS + '\n' + this.alias + '\n\n'

    if (this.birthYear)
      text += FILE_SECTION_BIRTH_YEAR + '\n' + this.birthYear + '\n\n'

    if (this.deathYear)
      text += FILE_SECTION_DEATH_YEAR + '\n' + this.deathYear + '\n\n'

    if (this.author)
      text += FILE_SECTION_AUTHOR + '\n' + this.author + '\n\n'

    if (this.published)
      text += FILE_SECTION_PUBLISHED + '\n' + this.published + '\n\n'

    if (this.pages.length > 0) {
      text += FILE_SECTION_BODY + '\n'
      text += this.pages.map(p => p.serialize()).filter(p => p !== '').join('\n\n\n')
    }
    return { is_dir: false, text, alias: this.alias }
  }

  //--------------------------------------
  //  pages
  //--------------------------------------
  private _pages: Page[]
  get pages(): Page[] { return this._pages }

  static createFile(path: string): TextFile {
    if (path.endsWith('/')) {
      console.log('TextFile:createFile. path=', path)
      const res = new TextFile()
      res.deserialize({ path, 'is_dir': true })
      return res
    } else {
      let text = ''
      text += FILE_SECTION_BIRTH_YEAR + '\n1900' + '\n\n'
      text += FILE_SECTION_DEATH_YEAR + '\n1999' + '\n\n'
      text += FILE_SECTION_AUTHOR + '\n' + 'Author A.' + '\n\n'
      text += FILE_SECTION_PUBLISHED + '\n' + (new Date()).getFullYear() + '\n\n'
      text += FILE_SECTION_BODY + '\n'

      const res = new TextFile()
      res.deserialize({ path, 'is_dir': false, text })
      return res
    }
  }

  createPage(atIndex: number = 0): Page {
    const p = new Page(this, '$## New page')
    if (atIndex === 0) {
      this.pages.unshift(p)
    } else if (atIndex >= this._pages.length) {
      this.pages.push(p)
    } else {
      this._pages = [...this._pages.slice(0, atIndex), p, ...this._pages.slice(atIndex)]
    }
    this.hasChanges = true
    this.mutated()
    return p
  }

  movePageUp(page: Page): boolean {
    const pageInd = this.pages.findIndex(p => p.uid === page.uid)
    if (pageInd !== -1 && pageInd !== 0) {
      this.pages[pageInd] = this.pages[pageInd - 1]
      this.pages[pageInd - 1] = page
      this.hasChanges = true
      this.mutated()
      return true
    }
    return false
  }

  movePageDown(page: Page): boolean {
    const pageInd = this.pages.findIndex(p => p.uid === page.uid)
    if (pageInd !== -1 && pageInd < this.pages.length - 1) {
      this.pages[pageInd] = this.pages[pageInd + 1]
      this.pages[pageInd + 1] = page
      this.hasChanges = true
      this.mutated()
      return true
    }
    return false
  }

  remove(page: Page): number {
    const pageInd = this.pages.findIndex(p => p.uid === page.uid)
    if (pageInd !== -1) {
      this.pages.splice(pageInd, 1)
      page.dispose()
      this.hasChanges = true
      this.mutated()
      return pageInd
    }
    return -1
  }

  replaceWith(substr: string, replaceValue: string) {
    if (!substr) return

    this.pages.forEach(p => {
      let res = p.text

      res = res.replace(new RegExp(substr, "g"), replaceValue)
      res = res.replace(/\\n/g, '\n')
      p.text = res
    })
  }

  discardChanges() {
    if (this.hasChanges) {
      this.deserialize(this.data)
      this.hasChanges = false
    }
  }

  dispose() {
    super.dispose()
    this.pages.forEach(b => {
      b.dispose()
    })
    this._pages = []
  }
}

/*
*
*
* DOMAIN ENTITY
*
*
* */

const PAGE_TILE_REG = /^\$?(#+) (.*)/
export class Page extends RXObservableEntity<Page> implements Serializable {
  readonly uid = generateUID()
  readonly file: TextFile

  constructor(file: TextFile, text: string) {
    super()
    this.file = file
    this._text = text
    this.textDidChange()
  }

  //--------------------------------------
  //  header
  //--------------------------------------
  private _header: string = ''
  get header(): string { return this._header }

  //--------------------------------------
  //  headerLevel
  //--------------------------------------
  private _headerLevel = 0
  get headerLevel(): number { return this._headerLevel }

  //--------------------------------------
  //  text
  //--------------------------------------
  private _text: string = ''
  get text(): string { return this._text }
  set text(value: string) {
    if (this._text !== value) {
      this._text = value
      this.textDidChange()
      this.mutated()
      this.file.hasChanges = true
    }
  }

  private textDidChange() {
    let level = -1
    const matchRes = this._text.match(PAGE_TILE_REG)
    if (matchRes) {
      level = matchRes[1].length - 1 //count of #-symbols
      this._headerLevel = level
      this._header = matchRes[2]
    } else {
      const line = this.readLine(this._text)
      this._headerLevel = level
      this._header = line.length > 30 ? line.slice(0, 30) + '...' : line
    }
  }

  private readLine(from: string): string {
    const ind = from.indexOf('\n')
    return ind !== -1 ? from.slice(0, ind) : from
  }

  serialize(): string {
    return this._text
  }

  dispose() {
    super.dispose()
  }
}
