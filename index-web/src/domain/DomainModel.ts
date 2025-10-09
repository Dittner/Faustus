import { RXObservable, RXObservableEntity } from 'flinker'
import RootInfo from '../../resources/RootInfo.txt?raw'
import { globalContext } from '../App'
import { GlobalContext } from '../app/GlobalContext'
import { IndexContext } from '../app/IndexContext'
import { generateUID, sortByKeys } from '../app/Utils'
import { RestApiError } from '../backend/RestApi'

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

export const INFO_KEY_ID = 'ID'
export const INFO_KEY_NAME = 'NAME'
export const INFO_KEY_COVER = 'COVER'
export const INFO_KEY_YEAR = 'YEAR'
export const INFO_KEY_PHOTO = 'PHOTO'
export const INFO_KEY_ABOUT = 'ABOUT'
export const INFO_KEY_MARKDOWN = 'MARKDOWN'
export const INFO_IS_AUTHOR = 'IS_AUTHOR'
export const INFO_AUTHOR = 'AUTHOR'
export const INFO_FONT_SIZE = 'FONTSIZE'
export const INFO_AUTHOR_BIRTH_YEAR = 'BIRTH_YEAR'
export const INFO_AUTHOR_DEATH_YEAR = 'DEATH_YEAR'

export class TextFile extends RXObservableEntity<TextFile> {
  readonly uid = generateUID()
  id = ''
  info: InfoPage
  isDamaged = false
  isDirectory = false

  parent: TextFile | undefined = undefined

  get name(): string { return this.info.name }
  get isAuthor(): boolean { return this.info.author !== undefined }
  get link(): string { return this.parent ? this.parent.link + '/' + this.id : '/' + this.id }

  constructor() {
    super()
    this.info = new InfoPage(this, '')
    this._pages = []
  }

  deserialize(data: any) {
    try {
      console.log('File: ' + data?.path + ', isDir:', data.isDirectory)
      if (data.text && data.isDirectory !== undefined) {
        this.isDamaged = false
        this.isDirectory = data.isDirectory
        const sepIndex = data.text.indexOf(INFO_KEY_MARKDOWN)
        const infoText = sepIndex === -1 ? data.text : data.text.substring(0, sepIndex).replace(/[\n| ]+$/, '')
        this.info.deserialize(infoText)
        this.id = this.info.id
        const markdown = sepIndex === -1 ? '' : data.text.substring(sepIndex + INFO_KEY_MARKDOWN.length + 1)
        this._pages = markdown ? markdown.split('\n\n\n').map((text: string) => new Page(this, text)) : []
      } else {
        console.log('File:deserialize, file is damaged, data:', data)
        this.isDamaged = true
      }
    } catch (e: any) {
      console.log('File:deserialize, err:', e.message, 'data:', data)
    }
  }

  serialize(): any {
    let text = this.info.serialize()
    if (this.pages.length > 0) {
      text += '\n\n' + INFO_KEY_MARKDOWN + '\n'
      text += this.pages.map(p => p.serialize()).filter(p => p !== '').join('\n\n\n')
    }
    return { id: this.info.id, text }
  }

  static compare = (a: TextFile, b: TextFile) => {
    if (a.info.year > b.info.year) return -1
    if (a.info.year < b.info.year) return 1
    return 0
  }

  //--------------------------------------
  //  showRawText
  //--------------------------------------
  private _showRawText: boolean = false
  get showRawText(): boolean { return this._showRawText }
  set showRawText(value: boolean) {
    if (this._showRawText !== value) {
      this._showRawText = value
      this.mutated()
    }
  }

  //--------------------------------------
  //  isEditing
  //--------------------------------------
  private _isEditing: boolean = false
  get isEditing(): boolean { return this._isEditing }
  set isEditing(value: boolean) {
    if (this._isEditing !== value) {
      this._isEditing = value
      this.mutated()
    }
  }

  //--------------------------------------
  //  filesLoaded
  //--------------------------------------
  private _filesLoaded: boolean = false
  get filesLoaded(): boolean { return this._filesLoaded }
  set filesLoaded(value: boolean) {
    if (this._filesLoaded !== value) {
      this._filesLoaded = value
      this.mutated()
    }
  }

  //--------------------------------------
  //  children
  //--------------------------------------
  private _children: TextFile[] = []
  get children(): TextFile[] { return this._children }
  set children(value: TextFile[]) {
    if (this._children !== value) {
      this._children = value.sort(sortByKeys(['isDirectory', 'isAuthor', 'name'], [false, true]))
      this._children.forEach(f => f.parent = this)
      this.parent?.mutated()
      this.mutated()
    }
  }

  //--------------------------------------
  //  pages
  //--------------------------------------
  private _pages: Page[]
  get pages(): Page[] { return this._pages }

  //--------------------------------------
  //  isLoading
  //--------------------------------------
  private _isLoading: boolean = false
  get isLoading(): boolean { return this._isLoading }
  set isLoading(value: boolean) {
    if (this._isLoading !== value) {
      this._isLoading = value
      this.mutated()
    }
  }

  private op: RXObservable<any[], RestApiError> | undefined
  loadChildrenFiles(): RXObservable<any[], RestApiError> {
    if (this.op && !this.op.isComplete) return this.op
    const op = globalContext.restApi.loadChildrenFiles(this.link)
    this.op = op
    this.isLoading = true

    op.pipe()
      .onReceive((files: any) => {
        console.log('File:loadChildrenFiles:onReceive, files count:', files.length)

        this.children = files.map((data: any) => {
          const f = new TextFile()
          f.deserialize(data)
          return f
        })
          .filter((f: TextFile) => !f.isDamaged)

        this.filesLoaded = true
        this.isLoading = false
      })
      .onComplete(() => {
        this.filesLoaded = true
        this.isLoading = false
      })
      .subscribe()

    return op
  }

  createAndAddFile(): TextFile | undefined {
    if (!this.isDirectory) return undefined

    const id = generateUID()
    let text = INFO_KEY_ID + '\n' + id + '\n\n'
    text += INFO_KEY_NAME + '\n' + id + '\n\n'
    text += INFO_KEY_YEAR + '\n' + (new Date()).getFullYear() + '\n\n'
    text += INFO_KEY_ABOUT + '\n' + 'Description'

    const res = new TextFile()
    res.deserialize({ 'isDirectory': false, text })
    this.addFile(res)
    const rx = globalContext.restApi.storeFile(res)
    rx.pipe()
      .onError((e: any) => {
        this.removeFile(res)
        GlobalContext.self.app.$errorMsg.value = e.message
      })
      .subscribe()
    return res
  }

  createAndAddDirectory(): TextFile | undefined {
    if (!this.isDirectory) return undefined

    const id = generateUID()
    let text = INFO_KEY_ID + '\n' + id + '\n\n'
    text += INFO_KEY_NAME + '\n' + id + '\n\n'
    text += INFO_IS_AUTHOR + '\nfalse\n\n'
    text += INFO_AUTHOR_BIRTH_YEAR + '\n1900\n\n'
    text += INFO_AUTHOR_DEATH_YEAR + '\n2000\n\n'
    text += INFO_KEY_PHOTO + '\n/' + IndexContext.self.root.id + '/ID/img/photo.png\n\n'
    text += INFO_KEY_ABOUT + '\nAbout'

    const res = new TextFile()
    res._filesLoaded = true
    res.deserialize({ 'isDirectory': true, text })
    this.addFile(res)
    const rx = globalContext.restApi.storeFile(res)
    rx.pipe()
      .onError((e: any) => {
        this.removeFile(res)
        GlobalContext.self.app.$errorMsg.value = e.message
      })
      .subscribe()
    return res
  }

  removeFile(f: TextFile) {
    const ind = this.children.indexOf(f)
    if (ind !== -1) {
      this.children.splice(ind, 1)
      this.mutated()
    }
  }

  addFile(f: TextFile) {
    if (this.isDirectory) {
      this.children.push(f)
      f.parent = this
      this.mutated()
    }
  }

  createPage(atIndex: number = 0): Page {
    const p = new Page(this, '')
    if (atIndex === 0) {
      this.pages.unshift(p)
    } else if (atIndex >= this._pages.length) {
      this.pages.push(p)
    } else {
      this._pages = [...this._pages.slice(0, atIndex), p, ...this._pages.slice(atIndex)]
    }
    this.mutated()
    this.store()
    return p
  }

  movePageUp(page: Page): boolean {
    if (page === this.info) return false
    const pageInd = this.pages.findIndex(p => p.uid === page.uid)
    if (pageInd !== -1 && pageInd !== 0) {
      this.pages[pageInd] = this.pages[pageInd - 1]
      this.pages[pageInd - 1] = page
      this.mutated()
      this.store()
      return true
    }
    return false
  }

  movePageDown(page: Page): boolean {
    if (page === this.info) return false
    const pageInd = this.pages.findIndex(p => p.uid === page.uid)
    if (pageInd !== -1 && pageInd < this.pages.length - 1) {
      this.pages[pageInd] = this.pages[pageInd + 1]
      this.pages[pageInd + 1] = page
      this.mutated()
      this.store()
      return true
    }
    return false
  }

  remove(page: Page): boolean {
    if (page === this.info) return false
    const pageInd = this.pages.findIndex(p => p.uid === page.uid)
    if (pageInd !== -1) {
      this.pages.splice(pageInd, 1)
      page.dispose()
      this.mutated()
      this.store()
      return true
    }
    return false
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

  private store() {
    IndexContext.self.storeService.addToStoreQueue(this)
  }

  dispose() {
    super.dispose()
    this.pages.forEach(b => {
      b.dispose()
    })
    this._pages = []
  }
}

export class RootTextFile extends TextFile {
  constructor() {
    super()
    //this.filesLoaded = true
    this.deserialize({ 'isDirectory': true, text: RootInfo, path: '' })
  }
}

/*
*
*
* DOMAIN ENTITY
*
*
* */

export class Page extends RXObservableEntity<Page> implements Serializable {
  readonly uid = generateUID()
  readonly file: TextFile

  constructor(file: TextFile, text: string) {
    super()
    this.file = file
    this._text = text
  }

  //--------------------------------------
  //  movable
  //--------------------------------------
  protected _movable = true
  get movable(): boolean { return this._movable }

  //--------------------------------------
  //  removable
  //--------------------------------------
  protected _removable = true
  get removable(): boolean { return this._removable }

  //--------------------------------------
  //  text
  //--------------------------------------
  protected _text: string = ''
  get text(): string { return this._text }
  set text(value: string) {
    if (this._text !== value) {
      this._text = value
      this.textDidChange()
      this.mutated()
      IndexContext.self.storeService.addToStoreQueue(this.file)
    }
  }

  //--------------------------------------
  //  isSelected
  //--------------------------------------
  private _isSelected: boolean = false
  get isSelected(): boolean { return this._isSelected }
  set isSelected(value: boolean) {
    if (this._isSelected !== value) {
      this._isSelected = value
      this.mutated()
    }
  }

  protected textDidChange() { }

  serialize(): string {
    return this._text
  }

  dispose() {
    super.dispose()
  }
}

/*
*
*
* DOMAIN ENTITY
*
*
* */

export class InfoPage extends Page {
  constructor(file: TextFile, text: string) {
    super(file, text)
    this.deserialize(text)
    this._movable = false
    this._removable = false
  }

  protected override textDidChange() {
    this.deserialize(this.text)
  }

  //--------------------------------------
  //  id
  //--------------------------------------
  private _id: string = ''
  get id(): string { return this._id }

  //--------------------------------------
  //  name
  //--------------------------------------
  private _name: string = ''
  get name(): string { return this._name }

  //--------------------------------------
  //  year
  //--------------------------------------
  private _year: string = ''
  get year(): string { return this._year }

  //--------------------------------------
  //  fontSize
  //--------------------------------------
  private _fontSize: string = ''
  get fontSize(): string { return this._fontSize }

  //--------------------------------------
  //  about
  //--------------------------------------
  private _about: string = ''
  get about(): string { return this._about }

  //--------------------------------------
  //  photo
  //--------------------------------------
  private _photo: string = ''
  get photo(): string { return this._photo }

  //--------------------------------------
  //  cover
  //--------------------------------------
  private _cover: string = ''
  get cover(): string { return this._cover }

  //--------------------------------------
  //  textAuthor
  //--------------------------------------
  private _textAuthor: string = ''
  get textAuthor(): string { return this._textAuthor }

  //--------------------------------------
  //  author
  //--------------------------------------
  private _author: Author | undefined = undefined
  get author(): Author | undefined { return this._author }

  deserialize(text: string) {
    const keyValues = text.replace(/\n{3,}/g, '\n\n').split('\n\n')
    this._text = text
    let isAuthor = false
    let authorBirthYear = ''
    let authorDeathYear = ''

    const aboutIndex = text.indexOf(INFO_KEY_ABOUT + '\n')
    this._about = aboutIndex === -1 ? '' : text.substring(aboutIndex + INFO_KEY_ABOUT.length + 1)


    for (let i = 0; i < keyValues.length; i++) {
      const keyValue = keyValues[i]
      const sepIndex = keyValue.indexOf('\n')
      const key = sepIndex === -1 ? keyValue : keyValue.substring(0, sepIndex)
      const value = sepIndex === -1 ? '' : keyValue.substring(sepIndex + 1)

      if (!key) continue

      if (key === INFO_KEY_ID) {
        this._id = value
      } else if (key === INFO_KEY_NAME) {
        this._name = value
      } else if (key === INFO_IS_AUTHOR) {
        isAuthor = value.toLowerCase() === 'true'
      } else if (key === INFO_AUTHOR) {
        this._textAuthor = value
      } else if (key === INFO_FONT_SIZE) {
        this._fontSize = value
      } else if (key === INFO_AUTHOR_BIRTH_YEAR) {
        authorBirthYear = value
      } else if (key === INFO_AUTHOR_DEATH_YEAR) {
        authorDeathYear = value
      } else if (key === INFO_KEY_COVER) {
        this._cover = value
      } else if (key === INFO_KEY_YEAR) {
        this._year = value
      } else if (key === INFO_KEY_PHOTO) {
        this._photo = value
      } else if (key === INFO_KEY_ABOUT) {
        break
      } else {
        console.warn('InfoPage:deserialize, unknown tag:', key, ', keyValues:')
        console.warn(keyValues)
      }
    }

    this._author = isAuthor ? new Author(this.name, authorBirthYear, authorDeathYear) : undefined

    if (this._name === '') this._name = 'Title'
  }
}

export class Author {
  readonly birthYear: string
  readonly deathYear: string
  readonly fullName: string
  readonly shortName: string

  constructor(name: string, birthYear: string, deathYear: string) {
    this.fullName = name
    const [surName, ...rest] = name.split(' ')
    this.shortName = rest.length > 0 ? surName + ' ' + rest.map(v => v.charAt(0).toLocaleUpperCase() + '.').join('') : surName
    this.birthYear = birthYear
    this.deathYear = deathYear

    const nameParts = name.split(' ') ?? []
    this._surname = nameParts.length > 0 ? nameParts[0] : ''
    this._firstname = name.substring(this._surname.length) ?? ''
    this._years = '(' + (birthYear ?? '') + (deathYear ? '-' + deathYear : '') + ')'
  }

  private _surname = ''
  get surname() { return this._surname }

  private _firstname = ''
  get firstname() { return this._firstname }

  private _years = ''
  get years() { return this._years }
}
