import { RXObservableValue } from "flinker"

import { globalContext } from "../../../App"
import { AVAILABLE_LEVELS, DomainService, INote } from "../../../domain/DomainModel"
import { InputBufferController } from "../../controls/Input"
import { DertutorContext } from "../../../DertutorContext"
import { ViewModel } from "../ViewModel"
import { CreateNoteSchema, DeleteNoteSchema, RenameNoteSchema } from "../../../backend/Schema"
import { LocalStorage } from "../../../app/LocalStorage"
import { UrlKeys, URLNavigator } from "../../../app/URLNavigator"
import { NoteListInteractor, NoteListState } from "./NoteListInteractor"

interface FilterCache {
  searchGlobally: boolean
}

export class NoteListVM extends ViewModel {
  readonly $state = new RXObservableValue<Readonly<NoteListState>>({})

  readonly $searchBuffer = new RXObservableValue('')
  readonly $searchFocused = new RXObservableValue(false)

  readonly $mode = new RXObservableValue<'explore' | 'create' | 'rename'>('explore')
  readonly bufferController = new InputBufferController()
  readonly filterCache: LocalStorage<FilterCache>

  readonly navigator: URLNavigator
  private readonly interactor: NoteListInteractor

  constructor(ctx: DertutorContext) {
    super('notes', ctx)
    this.filterCache = new LocalStorage('filterCache')
    this.addKeybindings()
    this.interactor = new NoteListInteractor(this.ctx)
    this.navigator = globalContext.navigator
  }

  private addKeybindings() {
    this.actionsList.add('g', 'Select first note', () => this.moveCursorToTheFirst())
    this.actionsList.add('G', 'Select last note', () => this.moveCursorToTheLast())

    this.actionsList.add('<Right>', 'Select next note', () => this.moveNext())
    this.actionsList.add('<Left>', 'Select prev note', () => this.movePrev())

    this.actionsList.add('n', 'New note (ADMIN)', () => this.createNote())
    this.actionsList.add('r', 'Rename note (ADMIN)', () => this.renameNote())
    this.actionsList.add('e', 'Edit note (ADMIN)', () => this.edit())
    this.actionsList.add(':d<CR>', 'Delete note (ADMIN)', () => this.deleteNote())
    this.actionsList.add('/', 'Search', () => this.$searchFocused.value = true)

    this.actionsList.add('<Space>', 'Play audio', () => this.playAudio())
    this.actionsList.add(':id<CR>', 'Print ID of note', () => this.printID())
    this.actionsList.add('q', 'Quit', () => this.quit())
  }

  private moveNext() {
    const p = this.$state.value.page
    const n = this.$state.value.selectedNote
    if (!p || !n) return

    const index = p.items.findIndex(child => child.id === n.id)
    if (index !== -1) {
      if (index < p.items.length - 1)
        this.reloadWithNote(p.items[index + 1])
      else if (p.page < p.pages)
        this.reloadWith({ page: p.page + 1 })
    }
  }

  private movePrev() {
    const p = this.$state.value.page
    const n = this.$state.value.selectedNote
    if (!p || !n) return

    const index = p.items.findIndex(child => child.id === n.id)
    if (index !== -1) {
      if (index > 0)
        this.reloadWithNote(p.items[index - 1])
      else if (p.page > 1)
        this.reloadWith({ page: p.page - 1 })
    }
  }

  private moveCursorToTheLast() {
    const p = this.$state.value.page
    if (p && p.items.length > 0)
      this.reloadWithNote(p.items[p.items.length - 1])
  }

  private moveCursorToTheFirst() {
    const p = this.$state.value.page
    if (p && p.items.length > 0)
      this.reloadWithNote(p.items[0])
  }

  private quit() {
    this.navigator.navigateTo({ langCode: this.$state.value.lang?.code })
  }

  private edit() {
    if (this.$mode.value === 'explore') {
      this.ctx.editorVM.activate()
    } else {
      this.ctx.$msg.value = { level: 'error', text: 'Editor should be closed before starting editting another note' }
    }
  }

  private createNote() {
    if (this.$mode.value === 'explore' && this.$state.value.voc) {
      this.bufferController.$buffer.value = ''
      this.$mode.value = 'create'
    }
  }

  private renameNote() {
    if (!this.$state.value.selectedNote) return
    if (this.$mode.value !== 'explore') return
    this.bufferController.$buffer.value = this.$state.value.selectedNote.name
    this.$mode.value = 'rename'
  }

  private deleteNote() {
    if (this.$mode.value !== 'explore') return
    const page = this.$state.value.page
    const note = this.$state.value.selectedNote
    if (!page || !note) return
    const schema = { id: note.id } as DeleteNoteSchema
    globalContext.server.deleteNote(schema).pipe()
      .onReceive(_ => {
        console.log('NoteListVM:deleteNote complete')
        this.ctx.$msg.value = { level: 'info', text: 'deleted' }

        const index = page.items.findIndex(child => child.id === note.id) ?? -1
        let nextNote: INote | undefined
        if (index > 0) {
          nextNote = page.items[index - 1]
        } else if (index === 0 && page.items.length > 1) {
          nextNote = page.items[1]
        }

        this.reloadWith({ noteId: nextNote?.id }, true)
      })
      .onError(e => {
        this.ctx.$msg.value = { level: 'error', text: e.message }
      })
      .subscribe()
  }

  playAudio() {
    if (this.$state.value.selectedNote?.audio_url)
      new Audio(globalContext.server.baseUrl + this.$state.value.selectedNote.audio_url).play()
  }


  reprLevel(level: number | undefined) {
    return level && level < AVAILABLE_LEVELS.length ? AVAILABLE_LEVELS[level] : ''
  }

  reprTag(tagId: number | undefined) {
    if (tagId)
      return this.$state.value.lang?.tags.find(t => t.id === tagId)?.name ?? ''
    else
      return ''
  }

  startSearch(key: string) {
    this.reloadWith({ page: 1, searchKey: key })
  }

  reloadWith(keys: UrlKeys, force: boolean = false) {
    if (force) this.interactor.clearCache()
    this.navigator.navigateTo({ ...this.navigator.$keys.value, ...keys })
  }

  encodeName(value: string) {
    return DomainService.encodeName(value)
  }

  reloadWithNote(n: INote) {
    const lang = this.$state.value.allLangs?.find(l => l.id === n.lang_id)
    const voc = lang && lang.vocs.find(v => v.id === n.voc_id)
    const page = this.$state.value.page
    if (lang && voc && page) {
      const keys = {
        langCode: lang.code,
        vocCode: this.encodeName(voc.name),
        page: page.page,
        noteId: n.id,
        level: this.$state.value.level,
        tagId: this.$state.value.tagId,
        searchKey: this.$state.value.searchKey,
      }

      this.navigator.navigateTo(keys)
    }
  }

  override async onKeyDown(e: KeyboardEvent): Promise<void> {
    if (this.$mode.value === 'explore') {
      super.onKeyDown(e)
    } else {
      const code = this.actionsList.parser.keyToCode(e)
      if (code === '<ESC>') {
        this.$mode.value = 'explore'
      } else if (code === '<CR>') {
        this.applyInput()
      } else if (code === '<C-v>') {
        await this.bufferController.pasteFromKeyboard()
      } else {
        this.bufferController.onKeyDown(e)
      }
    }
  }

  private applyInput() {
    if (this.$mode.value === 'create') {
      this.completeCreation()
      this.$mode.value = 'explore'
    } else if (this.$mode.value === 'rename') {
      this.completeRenaming()
      this.$mode.value = 'explore'
    }
  }

  private completeCreation() {
    const lang = this.$state.value.lang
    const voc = this.$state.value.voc
    const name = this.bufferController.$buffer.value.trim()
    if (lang && voc && name) {
      const scheme = {} as CreateNoteSchema
      scheme.lang_id = lang.id
      scheme.voc_id = voc.id
      scheme.name = name
      scheme.text = '# ' + name + '\n\n' + (lang.code === 'en' ? '## Examples\n' : '## Beispiele\n')
      scheme.level = this.navigator.$keys.value.level
      scheme.tag_id = this.navigator.$keys.value.tagId
      scheme.audio_url = ''

      console.log('Creating note, schema:', scheme)
      console.log('Creating note, json:', JSON.stringify(scheme))

      globalContext.server.createNote(scheme).pipe()
        .onReceive((n: INote | undefined) => {
          console.log('NoteListVM:applyInput, creating note, result: ', n)
          if (n)
            this.reloadWith({ page: 1, noteId: n.id }, true)
        })
        .onError(e => {
          const msg = e.message.indexOf('duplicate key') !== -1 ? 'Note already exists' : e.message
          this.ctx.$msg.value = { level: 'error', text: msg }
        })
        .subscribe()
    }
  }

  private completeRenaming() {
    const page = this.$state.value.page
    const note = this.$state.value.selectedNote
    if (page && note) {
      const newName = this.bufferController.$buffer.value.trim()
      if (!newName) {
        this.ctx.$msg.value = { level: 'info', text: 'Empty name' }
        return
      }
      else if (newName === note.name) {
        this.ctx.$msg.value = { level: 'info', text: 'No changes' }
        return
      }

      const scheme = {} as RenameNoteSchema
      scheme.id = note.id
      scheme.name = newName

      globalContext.server.renameNote(scheme).pipe()
        .onReceive((note: INote | undefined) => {
          console.log('NoteListVM:completeRenaming, res: ', note)
          if (note) {
            this.ctx.$msg.value = { level: 'info', text: 'renamed' }

            const ind = page.items.findIndex(n => n.id === note.id)
            if (ind !== -1 && page) {
              this.reloadWith({}, true)
            }
          } else {
            this.ctx.$msg.value = { level: 'warning', text: 'Renamed note is failed' }
          }
        })
        .onError(e => {
          const msg = e.message.indexOf('duplicate key') ? 'Note already exists' : e.message
          this.ctx.$msg.value = { level: 'error', text: msg }
        })
        .subscribe()
    }
  }

  private printID() {
    const n = this.$state.value.selectedNote
    if (n)
      this.ctx.$msg.value = { 'level': 'info', 'text': `ID=${n.id}` }
    else
      this.ctx.$msg.value = { 'level': 'info', 'text': 'Not selected' }
  }

  /*
  *
  * ACTIVATE
  *
  */

  private unsubscribe: (() => void) | undefined
  private isLoading = false
  private reloadWithKeys: UrlKeys | undefined
  override activate(): void {
    super.activate()
    this.ctx.$msg.value = undefined
    this.interactor.clearCache()

    this.unsubscribe = globalContext.navigator.$keys.pipe()
      .onReceive(keys => {
        if (!keys.langCode) {
          this.ctx.langListVM.activate()
        } else if (!keys.vocCode && (!keys.searchKey || keys.searchKey.length <= 1)) {
          this.ctx.vocListVM.activate()
        } else {
          this.runInteracting(keys)
        }
      })
      .subscribe()
  }

  override deactivate(): void {
    super.deactivate()
    this.unsubscribe?.()
  }

  private reloadCycleDepth = 0
  private async runInteracting(keys: UrlKeys) {
    if (this.isLoading) {
      this.reloadWithKeys = keys
      return
    }

    try {
      this.reloadWithKeys = undefined
      this.isLoading = true

      const state = await this.interactor.run(keys)

      this.isLoading = false
      if (this.reloadWithKeys) {
        this.reloadCycleDepth++
        if (this.reloadCycleDepth > 10) {
          this.ctx.$msg.value = { text: 'Infinite loop of reloadind pages', level: 'warning' }
          return
        }
        this.runInteracting(this.reloadWithKeys)
        return
      }

      this.$state.value = state
      this.$searchBuffer.value = state.searchKey ?? ''

      this.selecteDefaultNote(state)
      window.scrollTo(0, 0)

    } catch (e: any) {
      this.ctx.$msg.value = { level: 'error', text: e.message }
    }
  }

  private prevState: NoteListState = {}
  private selecteDefaultNote(state: NoteListState) {
    const note = state.selectedNote
    const page = state.page

    if (page && note) {
      const index = page.items.findIndex(child => child.id === note.id)
      this.ctx.$msg.value = { 'text': index != -1 ? `${index + 1 + (page.page - 1) * page.size}:${page.total}` : '', 'level': 'info' }
    } else if (page && page.items.length > 0) {
      let note: INote | undefined
      if (this.prevState.page && this.prevState.page.page < page.page)
        note = page.items[0]
      else if (this.prevState.page && this.prevState.page.page > page.page)
        note = page.items[page.items.length - 1]
      else
        note = page.items[0]

      this.prevState = state
      this.reloadWithNote(note)
    }
  }
}