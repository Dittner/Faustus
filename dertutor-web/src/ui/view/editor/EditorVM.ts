import { RX, RXObservableValue } from "flinker"

import { globalContext } from "../../../App"
import { MediaFile, Note } from "../../../domain/DomainModel"
import { DertutorContext } from "../../DertutorContext"
import { ViewModel } from "../ViewModel"

export class FileWrapper {
  readonly file: File
  readonly $name = new RXObservableValue('')
  constructor(file: File) {
    this.file = file
    this.$name.value = file.name
  }
}

export class EditorVM extends ViewModel {
  readonly $editingNote = new RXObservableValue<Note | undefined>(undefined)
  readonly $level = new RXObservableValue(0)
  readonly $audioUrl = new RXObservableValue('')
  readonly $buffer = new RXObservableValue('')
  readonly $hasChanges = new RXObservableValue(false)
  readonly $filesPendingUpload = new RXObservableValue<Array<FileWrapper>>([])
  readonly $mediaFiles = new RXObservableValue<Array<MediaFile>>([])

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
          this.ctx.$msg.value = { text: 'written', level: 'info' }
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

  loadTranslation() {
    const note = this.$editingNote.value
    if (note) {
      globalContext.server.loadEnRuTranslation(note.title).pipe()
        .onReceive(data => {
          let res = '## ' + data.key + '\n'
          res += data.description
          if (Array.isArray(data.examples)) {
            res += '\n\nExamples:'
            data.examples.forEach((e: any) => {
              res += '\n' + e.en + '\n'
              res += e.ru + '\n'
            })
          }
          this.$buffer.value = res
          this.ctx.$msg.value = undefined
        })
        .onError(e => {
          this.$audioUrl.value = ''
          this.ctx.$msg.value = { text: e.message, level: 'warning' }
        })
        .subscribe()
    }
  }

  addResource(file: File) {
    this.$filesPendingUpload.value = [...this.$filesPendingUpload.value, new FileWrapper(file)]
  }

  uploadAll() {
    if (!this.$editingNote.value) return
    const note = this.$editingNote.value
    let uploadingFiles = this.$filesPendingUpload.value.length
    this.$filesPendingUpload.value.forEach(w => {
      globalContext.server.uploadFile(note.id, w.file, w.$name.value).pipe()
        .onReceive((data: any[]) => {
          this.ctx.$msg.value = undefined
          console.log('EditorVM:uploadFile, complete, data: ', data)
          const mf = new MediaFile()
          mf.deserialize(data)
          if (mf.isDamaged) {
            this.ctx.$msg.value = { text: 'Mediaresource is uploaded, but received damaged result', level: 'error' }
          } else {
            this.ctx.$msg.value = { text: 'uploaded', level: 'info' }
            note.mediaFiles.push(mf)
            this.$mediaFiles.value = [...this.$mediaFiles.value]
          }
        })
        .onError(e => {
          this.ctx.$msg.value = { text: e.message, level: 'error' }
        })
        .onComplete(() => {
          uploadingFiles--
          if (uploadingFiles === 0) this.$filesPendingUpload.value = []
        })
        .subscribe()
    })
  }

  deletePendingUploadFile(w: FileWrapper) {
    const index = this.$filesPendingUpload.value.indexOf(w)
    if (index !== -1) {
      this.$filesPendingUpload.value.splice(index, 1)
      this.$filesPendingUpload.value = [...this.$filesPendingUpload.value]
    }
  }

  deleteMediaFile(mf: MediaFile) {
    if (!this.$editingNote.value) return
    const note = this.$editingNote.value
    globalContext.server.deleteFile(mf.uid).pipe()
      .onReceive((data: any[]) => {
        this.ctx.$msg.value = { text: 'deleted', level: 'info' }
        console.log('EditorVM:deleteMediaFile, complete, data: ', data)
        const index = note.mediaFiles.indexOf(mf)
        if(index !== -1) {
          note.mediaFiles.splice(index, 1)
          this.$mediaFiles.value = [...note.mediaFiles]
        }
      })
      .onError(e => {
        this.ctx.$msg.value = { text: e.message, level: 'error' }
      })
      .subscribe()
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
      if (this.ctx.$selectedNote.value.mediaLoaded) this.$mediaFiles.value = this.ctx.$selectedNote.value.mediaFiles
      else this.loadMediaFiles(this.ctx.$selectedNote.value)
    } else {
      this.ctx.vocListVM.activate()
    }
  }

  private loadMediaFiles(n: Note) {
    console.log('EditorVM:loadMediaFiles')
    this.ctx.$msg.value = { text: 'Loading media...', level: 'info' }
    n.loadMediaFiles().pipe()
      .onReceive(_ => {
        this.$mediaFiles.value = n.mediaFiles
        this.ctx.$msg.value = { text: 'Ready', level: 'info' }
      })
      .onError(e => {
        this.$mediaFiles.value = []
        this.ctx.$msg.value = { text: e.message, level: 'error' }
      })
      .subscribe()
  }
}