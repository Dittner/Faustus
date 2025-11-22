import { RXObservableValue } from "flinker"

import { Path } from "../../../app/Utils"
import { Note, Vocabulary } from "../../../domain/DomainModel"
import { InputBufferController } from "../../controls/Input"
import { DertutorContext } from "../../DertutorContext"
import { ViewModel } from "../ViewModel"

const PATH_ALLOWED_SYMBOLS: Set<string> = new Set('_0123456789/abcdefghijklmnopqrstuvwxyz'.split(''))

export class NoteListVM extends ViewModel {
  readonly $notes = new RXObservableValue<Array<Note>>([])
  readonly $mode = new RXObservableValue<'explore' | 'create' | 'rename'>('explore')
  readonly bufferController = new InputBufferController(PATH_ALLOWED_SYMBOLS)

  constructor(ctx: DertutorContext) {
    super('notes', ctx)
    this.addKeybindings()
  }

  private addKeybindings() {
    this.actionsList.add('g', 'Select first note', () => this.moveCursorToTheFirst())
    this.actionsList.add('G', 'Select last note', () => this.moveCursorToTheLast())

    this.actionsList.add('j', 'Select next note', () => this.moveCursor(1))
    this.actionsList.add('k', 'Select prev note', () => this.moveCursor(-1))

    this.actionsList.add('<Right>', 'Select next note', () => this.moveCursor(1))
    this.actionsList.add('<Left>', 'Select prev note', () => this.moveCursor(-1))

    this.actionsList.add('q', 'Quit', () => this.quit())

    //this.actionsList.add(':n<CR>', 'New file', () => this.newFile())
    //this.actionsList.add(':d<CR>', 'Delete file', () => this.deleteFile())
    //this.actionsList.add(':r<CR>', 'Rename file', () => this.renameFile())
    //this.actionsList.add('/', 'Search file', () => this.searchFile())
  }

  private moveCursor(step: number) {
    const children = this.ctx.$selectedVoc.value?.notes ?? []

    for (let i = 0; i < children.length; i++) {
      if (this.ctx.$selectedNote.value === children[i]) {
        if ((i + step) >= 0 && (i + step) < children.length)
          this.ctx.$selectedNote.value = children[i + step]
        break
      }
    }

    if (this.ctx.$selectedNote.value)
      this.ctx.navigate(this.ctx.$selectedNote.value.path)
  }

  private moveCursorToTheLast() {
    const children = this.ctx.$selectedVoc.value?.notes ?? []
    this.ctx.$selectedNote.value = children.length > 0 ? children[children.length - 1] : undefined
    if (this.ctx.$selectedNote.value)
      this.ctx.navigate(this.ctx.$selectedNote.value.path)
  }

  private moveCursorToTheFirst() {
    const children = this.ctx.$selectedVoc.value?.notes ?? []
    this.ctx.$selectedNote.value = children.length > 0 ? children[0] : undefined
    if (this.ctx.$selectedNote.value)
      this.ctx.navigate(this.ctx.$selectedNote.value.path)
  }


  private quit() {
    const keys = Path.parseAdressBar()
    if (keys.langCode && keys.vocCode) {
      this.ctx.navigate('/' + keys.langCode)
      this.ctx.vocListVM.activate()
      this.ctx.$selectedNote.value = undefined
    }
  }

  onKeyDown(e: KeyboardEvent): void {
    if (this.$mode.value === 'explore') {
      super.onKeyDown(e)
    } else {
      const code = this.actionsList.parser.keyToCode(e)
      if (code === '<ESC>') {
        this.$mode.value = 'explore'
      } else if (code === '<CR>') {
        //this.applyInput()
      } else {
        this.bufferController.onKeyDown(e)
      }
    }
  }

  /*
  *
  * ACTIVATE
  *
  */

  override activate(): void {
    super.activate()
    if (this.ctx.$selectedVoc.value) {
      if (this.ctx.$selectedVoc.value.notesLoaded) {
        this.$notes.value = this.ctx.$selectedVoc.value.notes
        this.parseLocation(this.ctx.$selectedVoc.value)
      }
      else {
        this.loadNotes(this.ctx.$selectedVoc.value)
      }
    } else {
      this.ctx.vocListVM.activate()
    }
  }

  private loadNotes(v: Vocabulary) {
    console.log('DertutorContext:loadNotes')
    this.ctx.$msg.value = { text: 'Loading...', level: 'info' }
    v.loadNotes().pipe()
      .onReceive(_ => {
        this.ctx.$msg.value = undefined
        this.$notes.value = v.notes
        this.parseLocation(v)
      })
      .onError(e => {
        this.ctx.$msg.value = { text: e.message, level: 'error' }
      })
      .subscribe()
  }


  private parseLocation(v: Vocabulary) {
    const keys = Path.parseAdressBar()
    let selectedNote: Note | undefined

    for (const n of v.notes)
      if (n.id === keys.noteId) {
        selectedNote = n
        break
      }

    if (selectedNote) {
      this.ctx.$selectedNote.value = selectedNote
    } else {
      this.ctx.$selectedNote.value = v.notes.length > 0 ? v.notes[0] : undefined
    }
  }
}