import { RX, RXObservableValue } from "flinker"

import { globalContext } from "../../../App"
import { IMediaFile, INote, ILang, AVAILABLE_LEVELS } from "../../../domain/DomainModel"
import { DertutorContext } from "../../../DertutorContext"
import { ViewModel } from "../ViewModel"
import { UpdateNoteSchema } from "../../../backend/Schema"

export class FileWrapper {
  readonly file: File
  readonly $name = new RXObservableValue('')
  constructor(file: File) {
    this.file = file
    this.$name.value = file.name
  }
}

export class EditorVM extends ViewModel {
  readonly $selectedLang = new RXObservableValue<ILang | undefined>(undefined)
  readonly $editingNote = new RXObservableValue<INote | undefined>(undefined)
  readonly $level = new RXObservableValue(0)
  readonly $tagId = new RXObservableValue<number | undefined>(undefined)
  readonly $audioUrl = new RXObservableValue('')
  readonly $buffer = new RXObservableValue('')
  readonly $hasChanges = new RXObservableValue(false)
  readonly $filesPendingUpload = new RXObservableValue<Array<FileWrapper>>([])
  readonly $mediaFiles = new RXObservableValue<Array<IMediaFile>>([])

  constructor(ctx: DertutorContext) {
    super('editor', ctx)
    RX.combine(this.$buffer, this.$level, this.$tagId, this.$audioUrl).pipe()
      .skipFirst()
      .onReceive(values => {
        const buffer = values[0]
        const level = values[1] as number
        const tagId = values[2] as number | undefined
        const audioUrl = values[3]
        const note = this.$editingNote.value
        if (note) {
          this.$hasChanges.value = buffer !== note.text ||
            level !== note.level ||
            tagId !== note.tag_id ||
            audioUrl !== note.audio_url
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
      this.ctx.$msg.value = { text: this.noteToString(this.$editingNote.value) + ', discard/save changes before quitting', level: 'warning' }
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
      const schema = {} as UpdateNoteSchema
      schema.id = note.id
      schema.voc_id = note.voc_id
      schema.name = note.name
      schema.text = this.$buffer.value
      schema.level = this.$level.value
      schema.tag_id = this.$tagId.value
      schema.audio_url = this.$audioUrl.value

      this.$hasChanges.value = false

      globalContext.server.updateNote(schema).pipe()
        .onReceive((data: any) => {
          this.ctx.$msg.value = { text: this.noteToString(note) + ', written', level: 'info' }
        })
        .onError(e => {
          this.ctx.$msg.value = { text: this.noteToString(note) + ', ' + e.message, level: 'error' }
        })
        .subscribe()

    } else {
      this.ctx.$msg.value = { text: this.noteToString(note) + ', no changes', level: 'info' }
    }
  }

  discardChanges() {
    const note = this.$editingNote.value
    if (note) {
      this.$buffer.value = note.text
      this.$level.value = note.level
      this.$tagId.value = note.tag_id
      this.$audioUrl.value = note.audio_url
    }
  }

  loadAudioLink() {
    const lang = this.$selectedLang.value
    const note = this.$editingNote.value
    if (lang && note) {
      const key = encodeURIComponent(note.name)
      const link = lang.code === 'en' ? '/corpus/en_pron/search?key=' + key : '/corpus/de_pron/search?key=' + key
      globalContext.server.validateMp3Link(link).pipe()
        .onReceive(_ => {
          this.$audioUrl.value = link
          this.ctx.$msg.value = { text: this.noteToString(note) + ', audio_url:' + link, level: 'info' }
        })
        .onError(e => {
          this.$audioUrl.value = ''
          this.ctx.$msg.value = { text: this.noteToString(note) + ', ' + e.message, level: 'warning' }
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
      globalContext.server.loadEnRuTranslation(note.name).pipe()
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
          this.ctx.$msg.value = { text: this.noteToString(note), level: 'info' }
        })
        .onError(e => {
          this.$audioUrl.value = ''
          this.ctx.$msg.value = { text: this.noteToString(note) + ', ' + e.message, level: 'warning' }
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
        .onReceive((data: IMediaFile | undefined) => {
          this.ctx.$msg.value = { text: this.noteToString(note), level: 'info' }
          console.log('EditorVM:uploadFile, complete, data: ', data)
          if (data) {
            this.ctx.$msg.value = { text: this.noteToString(note) + ', uploaded', level: 'info' }
            this.$editingNote.value = { ...note, media: note.media ? [...note.media, data] : [data] }
            this.$mediaFiles.value = [...this.$mediaFiles.value]
          } else {
            this.ctx.$msg.value = { text: this.noteToString(note) + ', mediaresource is uploaded, but received damaged result', level: 'error' }
          }
        })
        .onError(e => {
          this.ctx.$msg.value = { text: this.noteToString(note) + ', ' + e.message, level: 'error' }
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

  deleteMediaFile(mf: IMediaFile) {
    const note = this.$editingNote.value
    if (!note) return
    globalContext.server.deleteFile({ uid: mf.uid }).pipe()
      .onReceive((data: any[]) => {
        this.ctx.$msg.value = { text: this.noteToString(note) + ', deleted', level: 'info' }
        console.log('EditorVM:deleteMediaFile, complete, data: ', data)
        const index = note.media?.indexOf(mf)
        if (index && index !== -1) {
          note.media && note.media.splice(index, 1)
          this.$mediaFiles.value = note.media ? [...note.media] : []
        }
      })
      .onError(e => {
        this.ctx.$msg.value = { text: this.noteToString(note) + ', ' + e.message, level: 'error' }
      })
      .subscribe()
  }

  reprLevel(level: number) {
    return level < AVAILABLE_LEVELS.length ? AVAILABLE_LEVELS[level] : ''
  }

  getMediaFileLink(mf: IMediaFile) {
    const note = this.$editingNote.value
    return note ? `/media/${note.id}/${mf.uid}` : ''
  }

  /*
  *
  * ACTIVATE
  *
  */

  override activate(): void {
    super.activate()
    const k = this.ctx.navigator.$keys.value
    this.$selectedLang.value = k.langCode ? this.ctx.$allLangs.value.find(l => l.code === k.langCode) : undefined
    if (k.noteId && this.$selectedLang.value) {
      this.loadNote(k.noteId)
    } else {
      this.ctx.noteListVM.activate()
    }
  }

  private loadNote(id: number) {
    globalContext.server.loadNote(id).pipe()
      .onReceive((note: INote | undefined) => {
        this.$editingNote.value = note
        this.$mediaFiles.value = note?.media ?? []
        this.ctx.$msg.value = { text: this.noteToString(note), level: 'info' }
        if (note) {
          this.$editingNote.value = note
          this.$buffer.value = note.text
          this.$level.value = note.level
          this.$tagId.value = note.tag_id
          this.$audioUrl.value = note.audio_url
        } else {
          this.ctx.noteListVM.activate()
        }
      }).onError(e => {
        this.$mediaFiles.value = []
        this.ctx.$msg.value = { text: e.message, level: 'error' }
      })
  }

  private noteToString(n: INote | undefined) {
    const lang = this.$selectedLang.value
    const voc = this.$selectedLang.value?.vocs.find(v => v.id === n?.voc_id)
    return n && voc && lang ? `${lang.name} › ${voc.name} › ${n.name}(ID:${n.id})` : 'Note not found'
  }
}