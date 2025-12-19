import { RXObservableValue } from "flinker"

import { globalContext } from "../../../App"
import { AVAILABLE_LEVELS, DomainService, ILang, INote, IPage, IVoc } from "../../../domain/DomainModel"
import { InputBufferController } from "../../controls/Input"
import { DertutorContext } from "../../../DertutorContext"
import { ViewModel } from "../ViewModel"
import { CreateNoteSchema, DeleteNoteSchema, GetPageOfNotesSchema, RenameNoteSchema } from "../../../backend/Schema"


export class NoteListVM extends ViewModel {
  readonly $selectedLang = new RXObservableValue<ILang | undefined>(undefined)
  readonly $selectedVoc = new RXObservableValue<IVoc | undefined>(undefined)
  readonly $selectedNote = new RXObservableValue<INote | undefined>(undefined)
  readonly $page = new RXObservableValue<IPage | undefined>(undefined)
  readonly $level = new RXObservableValue<number | undefined>(undefined)
  readonly $tagId = new RXObservableValue<number | undefined>(undefined)
  readonly $searchKey = new RXObservableValue('')
  readonly $searchBuffer = new RXObservableValue('')
  readonly $searchGlobally = new RXObservableValue(false)

  readonly $mode = new RXObservableValue<'explore' | 'create' | 'rename'>('explore')
  readonly bufferController = new InputBufferController()

  constructor(ctx: DertutorContext) {
    super('notes', ctx)
    this.$level.pipe().skipFirst().onReceive(_ => this.reloadPage(1, 'auto'))
    this.$tagId.pipe().skipFirst().onReceive(_ => this.reloadPage(1, 'auto'))
    this.$searchKey.pipe().skipFirst().onReceive(_ => this.reloadPage(1, 'auto'))
    this.$searchGlobally.pipe().skipFirst().onReceive(_ => this.$searchKey.value && this.reloadPage(1, 'auto'))
    this.addKeybindings()
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

    this.actionsList.add('<Space>', 'Play audio', () => this.playAudio())
    this.actionsList.add(':id<CR>', 'Print ID of note', () => this.printID())
    this.actionsList.add('q', 'Quit', () => this.quit())
  }

  private moveNext() {
    const p = this.$page.value
    const n = this.$selectedNote.value
    if (!p || !n) return

    const children = p.items
    const index = children.findIndex(child => child.id === n.id)
    if (index !== -1) {
      if (index < children.length - 1)
        this.selectNote(children[index + 1])
      else if (p.page < p.pages)
        this.reloadPage(p.page + 1, 'first')
    }
  }

  private movePrev() {
    const p = this.$page.value
    const n = this.$selectedNote.value
    if (!p || !n) return

    const children = p.items
    const index = children.findIndex(child => child.id === n.id)
    if (index !== -1) {
      if (index > 0)
        this.selectNote(children[index - 1])
      else if (p.page > 1)
        this.reloadPage(p.page - 1, 'last')
    }
  }

  private moveCursorToTheLast() {
    const children = this.$page.value?.items ?? []
    this.selectNote(children.length > 0 ? children[children.length - 1] : undefined)
  }

  private moveCursorToTheFirst() {
    const children = this.$page.value?.items ?? []
    this.selectNote(children.length > 0 ? children[0] : undefined)
  }

  private quit() {
    this.$page.value = undefined
    this.ctx.navigator.navigateTo({ langCode: this.$selectedLang.value?.code })
    this.ctx.vocListVM.activate()
  }

  private edit() {
    if (this.$mode.value === 'explore') {
      this.ctx.editorVM.activate()
    } else {
      this.ctx.$msg.value = { level: 'error', text: 'Editor should be closed before starting editting another note' }
    }
  }

  private createNote() {
    if (this.$mode.value === 'explore') {
      this.bufferController.$buffer.value = ''
      this.$mode.value = 'create'
    }
  }

  private renameNote() {
    if (!this.$selectedNote.value) return
    if (this.$mode.value !== 'explore') return
    this.bufferController.$buffer.value = this.$selectedNote.value.name
    this.$mode.value = 'rename'
  }

  private deleteNote() {
    if (this.$mode.value !== 'explore') return
    const note = this.$selectedNote.value
    if (!note) return
    const schema = { id: note.id } as DeleteNoteSchema
    globalContext.server.deleteNote(schema).pipe()
      .onReceive(_ => {
        console.log('NoteListVM:deleteNote complete')
        this.ctx.$msg.value = { level: 'info', text: 'deleted' }
        this.moveNext()
        if (this.$selectedNote.value === note)
          this.movePrev()
        if (this.$selectedNote.value === note)
          this.selectNote(undefined)

        this.reloadPage(this.$page.value?.page ?? 1)
      })
      .onError(e => {
        this.ctx.$msg.value = { level: 'error', text: e.message }
      })
      .subscribe()
  }

  playAudio() {
    if (this.$selectedNote.value?.audio_url)
      new Audio(globalContext.server.baseUrl + this.$selectedNote.value?.audio_url).play()
  }


  reprLevel(level: number) {
    return level < AVAILABLE_LEVELS.length ? AVAILABLE_LEVELS[level] : ''
  }

  reprTag(tagId: number | undefined) {
    if (tagId)
      return this.$selectedLang.value?.tags.find(t => t.id === tagId)?.name ?? ''
    else
      return ''
  }

  getNoteLink(n: INote) {
    return this.ctx.navigator.buildUrl(this.getNoteLinkKeys(n))
  }

  getPageLink(p: number) {
    return this.ctx.navigator.buildUrl({
      langCode: this.$selectedLang.value?.code,
      vocCode: this.encodeName(this.$selectedVoc.value),
      page: p,
      level: this.$level.value,
      tagId: this.$tagId.value,
    })
  }

  encodeName(voc: IVoc | undefined) {
    return voc && DomainService.encodeName(voc.name)
  }

  private getNoteLinkKeys(n: INote | undefined) {
    return {
      langCode: this.$selectedLang.value?.code,
      vocCode: this.encodeName(this.$selectedVoc.value),
      page: this.$page.value?.page,
      noteId: n?.id,
      level: this.$level.value,
      tagId: this.$tagId.value,
      searchKey: this.$searchKey.value,
      searchGlobally: this.$searchGlobally.value,
    }
  }

  selectNote(n: INote | undefined) {
    this.$selectedNote.value = n
    this.ctx.navigator.navigateTo(this.getNoteLinkKeys(n))
    window.scrollTo(0, 0)
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
    const lang = this.$selectedLang.value
    const voc = this.$selectedVoc.value
    const name = this.bufferController.$buffer.value.trim()
    if (lang && voc && name) {
      const scheme = {} as CreateNoteSchema
      scheme.lang_id = lang.id
      scheme.voc_id = voc.id
      scheme.name = name
      scheme.text = '# ' + name + '\n\n' + (lang.code === 'en' ? '## Examples\n' : '## Beispiele\n')
      scheme.level = this.ctx.navigator.$keys.value.level ?? 0
      scheme.tag_id = this.ctx.navigator.$keys.value.tagId
      scheme.audio_url = ''

      console.log('Creating note, schema:', scheme)
      console.log('Creating note, json:', JSON.stringify(scheme))

      globalContext.server.createNote(scheme).pipe()
        .onReceive((n: INote | undefined) => {
          console.log('NoteListVM:applyInput, creating note, result: ', n)
          if (n) {
            this.selectNote(n)
            this.ctx.editorVM.activate()
          }
        })
        .onError(e => {
          const msg = e.message.indexOf('duplicate key') !== -1 ? 'Note already exists' : e.message
          this.ctx.$msg.value = { level: 'error', text: msg }
        })
        .subscribe()
    }
  }

  private completeRenaming() {
    const page = this.$page.value
    const note = this.$selectedNote.value
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
              page.items[ind] = { ...note, name: newName } as INote
              this.$page.value = { ...page }
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
    const n = this.$selectedNote.value
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

  override activate(): void {
    this.ctx.$msg.value = undefined
    const k = this.ctx.navigator.$keys.value
    const lang = k.langCode ? this.ctx.$allLangs.value.find(l => l.code === k.langCode) : undefined
    const voc = lang && k.vocCode ? lang.vocs.find(v => DomainService.encodeName(v.name) === k.vocCode) : undefined

    if (this.$selectedVoc.value !== voc)
      this.$page.value = undefined

    this.$selectedLang.value = lang
    this.$selectedVoc.value = voc
    this.$level.value = k.level
    this.$tagId.value = k.tagId
    this.$searchKey.value = k.searchKey ?? ''
    this.$searchBuffer.value = k.searchKey ?? ''

    super.activate()

    if (lang) {
      this.reloadPage(k.page ?? 1)
    } else {
      this.ctx.langListVM.activate()
    }
  }

  reloadPage(pageIndex: number, selectNote: 'auto' | 'first' | 'last' = 'auto') {
    if (!this.isActive) return
    const lang = this.$selectedLang.value
    const voc = this.$selectedVoc.value
    if (!lang || !voc) {
      this.ctx.vocListVM.activate()
      return
    }

    const scheme = {} as GetPageOfNotesSchema
    scheme.lang_id = lang.id
    scheme.page = pageIndex
    scheme.size = DertutorContext.PAGE_SIZE
    scheme.voc_id = this.$searchKey.value && this.$searchGlobally.value ? undefined : voc.id
    scheme.key = this.$searchKey.value.length > 1 ? this.$searchKey.value : undefined
    scheme.level = this.$level.value
    scheme.tag_id = this.$tagId.value

    console.log('NoteListVN.reloadPage, page:', pageIndex)
    globalContext.server.loadNotes(scheme).pipe()
      .onReceive((p: IPage) => {
        console.log('NoteListVM:reloadPage, res:', p)
        console.log('NoteListVM:reloadPage, keys:', this.ctx.navigator.$keys.value)
        this.$page.value = p
        const noteId = this.ctx.navigator.$keys.value.noteId
        const note = p.items.find(n => n.id === noteId)
        if (selectNote === 'auto' && note)
          this.selectNote(note)
        else if (selectNote !== 'last' && p.items.length > 0)
          this.selectNote(p.items[0])
        else if (selectNote === 'last' && p.items.length > 0)
          this.selectNote(p.items[p.items.length - 1])
        else
          this.selectNote(undefined)
      })
      .onError(e => {
        this.ctx.$msg.value = { level: 'error', text: e.message }
      })
      .subscribe()
  }
}