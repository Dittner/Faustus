import { RX, RXObservableValue } from "flinker"

import { globalContext } from "../../../App"
import { Note } from "../../../domain/DomainModel"
import { DertutorContext } from "../../DertutorContext"
import { ViewModel } from "../ViewModel"

export class EditorVM extends ViewModel {
  readonly $editingNote = new RXObservableValue<Note | undefined>(undefined)
  readonly $level = new RXObservableValue(0)
  readonly $audioUrl = new RXObservableValue('')
  readonly $buffer = new RXObservableValue('')
  readonly $hasChanges = new RXObservableValue(false)

  constructor(ctx: DertutorContext) {
    super('editor', ctx)
    RX.combine(this.$buffer, this.$level, this.$audioUrl).pipe()
      .skipFirst()
      .onReceive(values => {
        const buffer = values[0]
        const level = values[1]
        const audioUrl = values[2]
        const note = this.$editingNote.value
        if (note) {
          this.$hasChanges.value = buffer !== note.text || level !== note.level || audioUrl !== note.audioUrl
        } else {
          this.$hasChanges.value = false
        }
      })
      .subscribe()
  }


  override async onKeyDown(e: KeyboardEvent): Promise<void> {
    if (this.isActive) {
      if (e.key === 'Escape') {
        this.quit()
      }
      //Ctrl + Shift + S
      else if (e.ctrlKey && e.shiftKey && e.keyCode === 83) {
        e.preventDefault()
        e.stopPropagation()
        this.save()
      }
    }
  }


  quit() {
    if (this.$hasChanges.value) {
      this.ctx.$msg.value = { text: 'Discard/Save changes before quitting', level: 'warning' }
    } else {
      this.ctx.noteListVM.activate()
    }
  }

  save() {
    const note = this.$editingNote.value
    if (!note) {
      this.ctx.$msg.value = { text: 'Note not found', level: 'warning' }
      return
    }

    if (this.$hasChanges.value) {
      note.text = this.$buffer.value
      note.level = this.$level.value
      note.audioUrl = this.$audioUrl.value
      this.$hasChanges.value = false

      globalContext.server.updateNote(note).pipe()
        .onReceive((data: any) => {
          this.ctx.$msg.value = { text: 'NOTES.ID:' + note.id + ', written', level: 'info' }
          note.deserialize(data)
        })
        .onError(e => {
          this.ctx.$msg.value = { text: e.message, level: 'error' }
        })
        .subscribe()

    } else {
      this.ctx.$msg.value = { text: 'Note has no changes', level: 'info' }
    }
  }

  discardChanges() {
    if (this.$editingNote.value) {
      this.$buffer.value = this.$editingNote.value.text
      this.$level.value = this.$editingNote.value.level
      this.$audioUrl.value = this.$editingNote.value.audioUrl
    }
  }

  getAudioLink() {
    const note = this.$editingNote.value
    if (note) {
      const key = encodeURIComponent(note.title)
      const link = note.vocabulary.lang.code === 'en' ? '/corpus/en_pron/search?key=' + key : '/corpus/de_pron/search?key=' + key
      globalContext.server.validateMp3Link(link).pipe()
        .onReceive(_ => {
          this.$audioUrl.value = link
          this.ctx.$msg.value = { text: 'audio_url:' + link, level: 'info' }
        })
        .onError(e => {
          this.$audioUrl.value = ''
          this.ctx.$msg.value = { text: e.message, level: 'warning' }
        })
        .subscribe()
    }
  }

  playAudio() {
    if (this.$audioUrl.value)
      new Audio(globalContext.server.baseUrl + this.$audioUrl.value).play()
  }

  addResource() {
  }


  /*
  *
  * ACTIVATE
  *
  */

  override activate(): void {
    super.activate()
    if (this.ctx.$selectedNote.value) {
      this.$editingNote.value = this.ctx.$selectedNote.value
      this.$buffer.value = this.$editingNote.value.text
      this.$level.value = this.$editingNote.value.level
      this.$audioUrl.value = this.$editingNote.value.audioUrl
      //this.loadResources()
    } else {
      this.ctx.vocListVM.activate()
    }
  }

  // private loadResources(n:Note) {
  //   console.log('EditorVM:loadResources')
  //   this.ctx.$msg.value = { text: 'Loading...', level: 'info' }
  //   n.loadResources().pipe()
  //     .onReceive((data: any[]) => {
  //       this.ctx.$msg.value = undefined
  //       console.log('DertutorContext:loadAllLangs, complete, data: ', data)
  //       this.$allLangs.value = data.map(d => {
  //         const l = new Lang()
  //         l.deserialize(d)
  //         return l
  //       }).filter(l => !l.isDamaged)
  //     })
  //     .onError(e => {
  //       this.ctx.$msg.value = { text: e.message, level: 'error' }
  //     })
  //     .subscribe()
  // }
}