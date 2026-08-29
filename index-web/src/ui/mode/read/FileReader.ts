import { RX, RXObservableValue } from "flinker"
import { globalContext } from "../../../App"
import { Page, TextFile } from "../../../domain/DomainModel"
import { IndexContext } from "../../IndexContext"
import { OperatingMode } from "../OperatingMode"
import { Path } from "../../../app/Utils"
import { INote } from "../../../backend/DerTutorServer"
import { log } from "../../../app/Logger"
import { TextReplacer } from "./TextReplacer"


type SEARCH_TRANSLATION_SUPPORTED_LANG = 'en' | 'de'
export class FileReader extends OperatingMode {
  readonly $selectedFile = new RXObservableValue<TextFile | undefined>(undefined)

  readonly $editingPage = new RXObservableValue<Page | undefined>(undefined)

  readonly $isFileChanged = new RXObservableValue(false)
  readonly $showPageHeaderList = new RXObservableValue(true)

  readonly $editMode = new RXObservableValue<'file' | 'page' | 'none'>('none')
  readonly $inputBuffer = new RXObservableValue('')

  readonly $translationLanguage = new RXObservableValue<SEARCH_TRANSLATION_SUPPORTED_LANG>('en')
  readonly $translationSearchInputBuffer = new RXObservableValue('')
  readonly $translationSearchInputFocused = new RXObservableValue(false)
  readonly $translationSearchResult = new RXObservableValue<INote | undefined>(undefined)
  readonly textReplacer: TextReplacer

  constructor(ctx: IndexContext) {
    super('read', ctx)
    this.textReplacer = new TextReplacer(this.$inputBuffer)
    this.addKeybindings()
    //this.subscribeToBrowserLocation()

    this.$selectedFile.pipe()
      .skipNullable()
      .flatMap(f => f)
      .map(f => f.hasChanges)
      .onReceive(hasChanges => this.$isFileChanged.value = hasChanges)
      .subscribe()

    this.$inputBuffer.pipe()
      .debounce(500)
      .onReceive(_ => this.applyTextChanges())
      .subscribe()

    this.$selectedFile.pipe()
      .skipNullable()
      .flatMap(f => f.$selectedPage)
      .onReceive(p => {
        if (p && p.file) {
          const pageIndex = p.file.pages.findIndex(item => item === p)
          this.ctx.recentOpenedFilesManager.add(p.file.alias || p.file.name, p.file.path, pageIndex === -1 ? 0 : pageIndex)
        }
      })
      .subscribe()

    const storedLang: SEARCH_TRANSLATION_SUPPORTED_LANG = window.localStorage.getItem('searchTranslationOfLang') === 'de' ? 'de' : 'en'
    this.$translationLanguage.value = storedLang
    this.$translationLanguage.pipe()
      .skipFirst()
      .onReceive(lang => {
        window.localStorage.setItem('searchTranslationOfLang', lang)
      })
      .subscribe()
  }

  private applyTextChanges() {
    if (this.$editMode.value === 'page') {
      if (this.$editingPage.value)
        this.$editingPage.value.text = this.$inputBuffer.value
    } else if (this.$editMode.value === 'file') {
      const f = this.$selectedFile.value
      if (f && !f.hasChanges)
        f.hasChanges = f.data.text !== this.$inputBuffer.value
    }
  }

  /*
  *
  * KEYBINDINGS
  *
  */

  private addKeybindings() {
    this.actionsList.add('o', 'Show recent opened files', () => this.showRecentOpenedFiles())
    
    this.actionsList.add('g', 'Select first chapter', () => this.moveCursorToTheFirst())
    this.actionsList.add('G', 'Select last chapter', () => this.moveCursorToTheLast())

    this.actionsList.add('j', 'Select next chapter', () => this.moveCursor(1))
    this.actionsList.add('<Right>', 'Select next chapter', () => this.moveCursor(1))
    this.actionsList.add('k', 'Select prev chapter', () => this.moveCursor(-1))
    this.actionsList.add('<Left>', 'Select prev chapter', () => this.moveCursor(-1))


    this.actionsList.add('q', 'Quit', () => this.quit(false))
    this.actionsList.add(':q!<CR>', 'Quit without saving', () => this.quit(true))
    this.actionsList.add('<C-S>', 'Save changes', () => this.save())

    this.actionsList.add('m', 'Toggle menu', () => this.toggleTree())
    this.actionsList.add('f', 'Search files', () => this.searchFiles())
    this.actionsList.add('/', 'Translate word', () => this.focusTranslationSearchInput())
    this.actionsList.add('<Space>', "Play word's pronunciation", () => this.playTranslation())
    this.actionsList.add('e', 'Edit page', () => this.editPage())
    this.actionsList.add('E', 'Edit file', () => this.editFile())
    this.actionsList.add(':id<CR>', 'Print file path', () => this.ctx.$msg.value = { level: 'info', text: this.$selectedFile.value?.path ?? 'File not found' })

    this.actionsList.add('n', 'New page', () => this.createPage())
    this.actionsList.add(':d<CR>', 'Delete page', () => this.deletePage())
    this.actionsList.add(':pj<CR>', 'Move page down', () => this.movePageDown())
    this.actionsList.add(':pk<CR>', 'Move page up', () => this.movePageUp())
  }

  override escPressed() {
    super.escPressed()
    this.clearTranslationSearchResults()
  }

  showRecentOpenedFiles() {
    this.ctx.recentOpenedFilesManager.showFilesList()
  }

  focusTranslationSearchInput() {
    const selectedText = window.getSelection()?.toString() ?? ''
    if (selectedText) this.$translationSearchInputBuffer.value = selectedText
    this.$translationSearchInputFocused.value = true
  }

  clearTranslationSearchResults() {
    this.$translationSearchInputBuffer.value = ''
    this.$translationSearchInputFocused.value = false
    this.$translationSearchResult.value = undefined
  }

  playTranslation() {
    const url = this.$translationSearchResult.value?.audio_url ?? ''
    if (url)
      new Audio(globalContext.derTutorServer.baseUrl + url).play()
  }

  private moveCursor(step: number) {
    const f = this.$selectedFile.value
    if (!f || f.pages.length === 0) return

    const selectedPage = f.$selectedPage.value ?? (f.pages.length > 0 ? f.pages[0] : undefined)
    for (let i = 0; i < f.pages.length; i++) {
      if (selectedPage === f.pages[i]) {
        if ((i + step) >= 0 && (i + step) < f.pages.length) {
          f.$selectedPage.value = f.pages[i + step]
          this.scrollToSelectedChapter()
        }
        return
      }
    }

    f.$selectedPage.value = f.pages.length > 0 ? f.pages[0] : undefined
    this.scrollToSelectedChapter()
  }

  moveCursorUnder(p: Page) {
    const f = this.$selectedFile.value
    if (!f || f.pages.length === 0) return

    for (let i = 0; i < f.pages.length; i++) {
      if (f.pages[i] === p) {
        f.$selectedPage.value = p
        this.scrollToSelectedChapter()
        break
      }
    }
  }

  private moveCursorToTheFirst() {
    const f = this.$selectedFile.value
    if (f && f.pages.length > 0) {
      f.$selectedPage.value = f.pages[0]
      this.scrollToSelectedChapter()
    }
  }

  private moveCursorToTheLast() {
    const f = this.$selectedFile.value
    if (f && f.pages.length > 0) {
      f.$selectedPage.value = f.pages[f.pages.length - 1]
      this.scrollToSelectedChapter()
    }
  }

  private scrollToSelectedChapter() {
    const f = this.$selectedFile.value
    if (f) {
      const p = f.$selectedPage.value

      if (p) {
        RX.delayedComplete(50).pipe().onComplete(() => {
          const index = p.file.pages.findIndex(item => item === p)
          if (index !== -1) {
            const element = document.getElementById('#' + index)
            if (element) {
              const elementPos = Math.round(element.getBoundingClientRect().top + document.documentElement.scrollTop)
              log('scrollToSelectedChapter:  window.scrollTo', index)
              window.scrollTo(0, elementPos - globalContext.app.$layout.value.navBarHeight)
            } else {
              log('ScrollToSelectedChapter: Selected page html element not found, perhaps it is not mounted yet')
            }
          } else {
            window.scrollTo(0, 0)
          }
        }).subscribe()
      }
    }
  }

  private quit(discardChanges: boolean) {
    const f = this.$selectedFile.value
    if (!f) {
      this.ctx.explorer.activate()
      return
    }

    if (f.hasChanges) {
      if (discardChanges) {
        f.discardChanges()
        globalContext.app.navigate(Path.parentPathOf(f.path))
        this.ctx.explorer.activate()
      }
      else {
        this.ctx.$msg.value = { text: 'Save the file or discard changes before quitting', level: 'warning' }
      }
    } else {
      globalContext.app.navigate(Path.parentPathOf(f.path))
      this.ctx.explorer.activate()
    }
  }

  private save() {
    const file = this.$selectedFile.value
    if (!file) {
      this.ctx.$msg.value = { text: 'File not found', level: 'warning' }
      return
    }

    if (file.hasChanges) {
      globalContext.indexServer.rewriteFile(file).pipe()
        .onReceive((data: any) => {
          this.ctx.$msg.value = { text: file.path + ', written', level: 'info' }
          file.data = data
          file.hasChanges = false
          log('Recieved data:', data)
        })
        .onError(e => {
          this.ctx.$msg.value = { text: e.message, level: 'error' }
        })
        .subscribe()

    } else {
      this.ctx.$msg.value = { text: 'File has no changes', level: 'info' }
    }
  }

  private toggleTree() {
    this.$showPageHeaderList.value = !this.$showPageHeaderList.value
  }

  private searchFiles() {
    this.ctx.searcher.activate()
  }

  searchTranslation(word: string) {
    if (word.length < 2) {
      this.ctx.$msg.value = { text: 'Search text is too short', level: 'warning' }
      return
    }

    this.$translationSearchInputBuffer.value = word

    log('NoteListVM.quickSearch by name:', word)

    globalContext.derTutorServer.searchTranslation(word, this.$translationLanguage.value).pipe()
      .onReceive(notes => {
        log('NoteListVM.quickSearch result:', notes)
        if (notes.length > 0) {
          this.$translationSearchResult.value = notes[0]
        } else {
          this.ctx.$msg.value = { text: `"${word}" not found` }
          this.$translationSearchResult.value = undefined
        }
      })
      .onError(e => {
        this.ctx.$msg.value = { level: 'error', text: e.message }
        this.$translationSearchResult.value = undefined
      })
  }

  private editPage() {
    if (this.$editMode.value !== 'none') {
      this.ctx.$msg.value = { level: 'error', text: 'Editor should be closed before starting editting another page' }
      return
    }

    const selectedFile = this.$selectedFile.value
    const selectedPage = selectedFile && selectedFile.$selectedPage.value
    if (selectedPage) {
      this.$inputBuffer.value = selectedPage.text
      this.$editingPage.value = selectedPage
      this.$editMode.value = 'page'
    } else {
      this.ctx.$msg.value = { level: 'warning', text: 'Page not selected' }
    }
  }

  private editFile() {
    const file = this.$selectedFile.value
    if (file && file.data.text) {
      this.$inputBuffer.value = file.serialize().text
      this.$editMode.value = 'file'
    }
  }

  override onKeyDown(e: KeyboardEvent): void {
    if (this.$editMode.value !== 'none') {
      if (e.key === 'Escape') {
        this.finishEditing()
      }
      //Ctrl + Shift + S
      else if (e.ctrlKey && e.shiftKey && e.keyCode === 83) {
        e.preventDefault()
        e.stopPropagation()
        this.applyTextChanges()
        this.save()
      }
    } else {
      super.onKeyDown(e)
    }
  }

  private finishEditing() {
    if (this.$editMode.value !== 'none') {
      const p = this.$editingPage.value
      const f = this.$selectedFile.value
      if (p && this.$editMode.value === 'page')
        p.text = this.$inputBuffer.value
      else if (f && this.$editMode.value === 'file' && f.data.text !== this.$inputBuffer.value) {
        const textBefore = f.data.text
        f.deserialize({ path: f.path, is_dir: f.isDirectory, text: this.$inputBuffer.value })
        f.hasChanges = true
        f.data.text = textBefore
        this.moveCursorToTheFirst()
      }
      this.$editingPage.value = undefined
      this.$editMode.value = 'none'
    }
  }

  private createPage() {
    if (this.$editMode.value !== 'none') {
      this.ctx.$msg.value = { level: 'error', text: 'Editor should be closed before creating new page' }
      return
    }

    const selectedFile = this.$selectedFile.value
    if (selectedFile) {
      const selectedPage = selectedFile.$selectedPage.value
      if (selectedPage) {
        const curPageIndex = selectedFile.pages.findIndex(p => p.uid === selectedPage.uid)
        selectedFile.$selectedPage.value = (selectedFile.createPage(curPageIndex + 1))
      } else {
        selectedFile.$selectedPage.value = selectedFile.createPage(selectedFile.pages.length)
        window.scroll(0, document.documentElement.scrollHeight)
      }
    } else {
      this.ctx.$msg.value = { level: 'warning', text: 'File not found' }
    }
  }

  private deletePage() {
    if (this.$editMode.value !== 'none') {
      this.ctx.$msg.value = { level: 'error', text: 'Editor should be closed before deleting new page' }
      return
    }

    const selectedFile = this.$selectedFile.value
    if (selectedFile) {
      const selectedPage = selectedFile.$selectedPage.value
      if (selectedPage) {
        const index = selectedFile.remove(selectedPage)
        if (index !== -1) {
          selectedFile.$selectedPage.value = index < selectedFile.pages.length ? selectedFile.pages[index] : selectedFile.pages.length > 0 ? selectedFile.pages[selectedFile.pages.length - 1] : undefined
        }
      } else {
        this.ctx.$msg.value = { level: 'warning', text: 'Page not selected' }
      }
    } else {
      this.ctx.$msg.value = { level: 'warning', text: 'File not found' }
    }
  }

  private movePageDown() {
    if (this.$editMode.value !== 'none') {
      this.ctx.$msg.value = { level: 'error', text: 'Editor should be closed before moving page' }
      return
    }

    const selectedFile = this.$selectedFile.value
    if (selectedFile) {
      const selectedPage = selectedFile.$selectedPage.value
      if (selectedPage) {
        selectedFile.movePageDown(selectedPage)
      } else {
        this.ctx.$msg.value = { level: 'warning', text: 'Page not selected' }
      }
    } else {
      this.ctx.$msg.value = { level: 'warning', text: 'File not found' }
    }
  }

  private movePageUp() {
    if (this.$editMode.value !== 'none') {
      this.ctx.$msg.value = { level: 'error', text: 'Editor should be closed before moving page' }
      return
    }

    const selectedFile = this.$selectedFile.value
    if (selectedFile) {
      const selectedPage = selectedFile.$selectedPage.value
      if (selectedPage) {
        selectedFile.movePageUp(selectedPage)
      } else {
        this.ctx.$msg.value = { level: 'warning', text: 'Page not selected' }
      }
    } else {
      this.ctx.$msg.value = { level: 'warning', text: 'File not found' }
    }
  }

  /*
  *
  * BROWSER
  *
  */

  // private subscribeToBrowserLocation() {
  //   globalContext.app.$location.pipe()
  //     .onReceive(_ => {
  //       this.parseBrowserLocation()
  //     })
  //     .subscribe()
  // }

  private scrollWindowTo(pos: number) {
    setTimeout(function () {
      window.scrollTo(0, pos)
    }, 50);
  }

  private cache: Record<string, TextFile> = {}
  private parseBrowserLocation() {
    if (!this.isActive) return

    log('FileViewMode:parseBrowserLocation, pathname:', document.location.pathname)
    // document.location.pathname === directoryId/fileId#hash
    let path = document.location.pathname.split('#')[0]
    //if (path.startsWith('/')) path = path.slice(1)
    log('Reader.parseBrowserLocation, path:', path)
    //const selectedChapter = document.location.hash //#hash
    if (this.cache[path]) {
      this.$selectedFile.value = this.cache[path]
      this.scrollWindowTo(this.$selectedFile.value.scrollPos)
      log('FileViewMode:parseBrowserLocation, file got from cache, scrollPos:', this.$selectedFile.value.scrollPos)
      //this.scrollToSelectedChapter()
    } else if (!path.endsWith('/')) {
      this.ctx.$msg.value = { text: 'Loading...', level: 'info' }
      log('Loading file...:', path)
      globalContext.indexServer.loadFile(path).pipe()
        .onReceive((data: any) => {
          this.ctx.$msg.value = undefined
          const f = new TextFile()
          f.deserialize(data)
          if (f.isDamaged) {
            this.ctx.$msg.value = { text: 'Files is damaged', level: 'error' }
          } else {
            const recentFile = this.ctx.recentOpenedFilesManager.$files.value.find(recentFile => recentFile.path === f.path)
            this.$selectedFile.value = f
            this.cache[path] = f
            if (recentFile) {
              const filePageIndex = recentFile.pageIndex
              this.moveCursor(filePageIndex)

            } else {
              this.moveCursorToTheFirst()
            }
          }
        })
        .onError(e => {
          this.ctx.$msg.value = { text: e.message, level: 'error' }
        })
        .subscribe()
    } else {
      this.$selectedFile.value = undefined
    }
  }

  override activate(): void {
    super.activate()
    this.parseBrowserLocation()
  }

  override deactivate(): void {
    super.deactivate()
    if (this.$selectedFile.value) {
      this.$selectedFile.value.scrollPos = window.scrollY
      log('Store scroll pos:', window.scrollY)
    }
  }

  // pageListDidRender(): void {
  //   log('FileReader:didPageListRender')
  //   RX.delayedComplete(10).pipe()
  //     .onComplete(() => {
  //       this.scrollToSelectedChapter()
  //     }).subscribe()
  // }
}