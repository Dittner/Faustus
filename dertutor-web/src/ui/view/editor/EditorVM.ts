import { RX, RXObservableValue } from "flinker"

import { IMediaFile, INote, AVAILABLE_LEVELS, ILang, IVoc, DomainService } from "../../../domain/DomainModel"
import { DerTutorContext } from "../../../DerTutorContext"
import { ViewModel } from "../ViewModel"
import { UpdateNoteSchema } from "../../../backend/Schema"
import { UrlKeys } from "../../../app/URLNavigator"
import { Interactor } from "../Interactor"
import { globalContext } from "../../../App"

export interface EditorState {
  allLangs?: ILang[]
  lang?: ILang
  voc?: IVoc
  note?: INote
}

export class FileWrapper {
  readonly file: File
  readonly $name = new RXObservableValue('')
  constructor(file: File) {
    this.file = file
    this.$name.value = file.name
  }
}

export class EditorVM extends ViewModel<EditorState> {
  readonly $state = new RXObservableValue<Readonly<EditorState>>({})
  readonly $level = new RXObservableValue<number | undefined>(undefined)
  readonly $tagId = new RXObservableValue<number | undefined>(undefined)
  readonly $audioUrl = new RXObservableValue('')
  readonly $buffer = new RXObservableValue('')
  readonly $hasChanges = new RXObservableValue(false)
  readonly $filesPendingUpload = new RXObservableValue<Array<FileWrapper>>([])
  readonly $mediaFiles = new RXObservableValue<Array<IMediaFile>>([])

  constructor(ctx: DerTutorContext) {
    const interactor = new EditorInteractor(ctx)
    super('editor', ctx, interactor)

    RX.combine(this.$buffer, this.$level, this.$tagId, this.$audioUrl).pipe()
      .skipFirst()
      .onReceive(values => {
        const buffer = values[0]
        const level = values[1] as number
        const tagId = values[2] as number | undefined
        const audioUrl = values[3]
        const note = this.$state.value.note
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

  protected override stateDidChange(state: EditorState) {
    if (!this.activate) return

    this.$state.value = state
    const note = state.note

    if (note) {
      this.$mediaFiles.value = note?.media ?? []
      this.ctx.$msg.value = { text: this.noteToString(note), level: 'info' }
      this.$buffer.value = note.text
      this.$level.value = note.level
      this.$tagId.value = note.tag_id
      this.$audioUrl.value = note.audio_url
    } else {
      this.ctx.$msg.value = { text: 'Note to edit not loaded', level: 'warning' }
      this.navigator.updateWith({ edit: undefined })
    }
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
      this.ctx.$msg.value = { text: this.noteToString(this.$state.value.note) + ', discard/save changes before quitting', level: 'warning' }
    } else {
      this.navigator.updateWith({ edit: undefined })
    }
  }

  save() {
    const note = this.$state.value.note
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

      this.server.updateNote(schema).pipe()
        .onReceive((data: any) => {
          this.$hasChanges.value = false
          this.$state.value = { ...this.$state.value, note: data }
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
    const note = this.$state.value.note
    if (note) {
      this.$buffer.value = note.text
      this.$level.value = note.level
      this.$tagId.value = note.tag_id
      this.$audioUrl.value = note.audio_url
    }
  }

  loadAudioLink() {
    const lang = this.$state.value.lang
    const note = this.$state.value.note
    if (lang && note) {
      const key = encodeURIComponent(note.name)
      const link = lang.code === 'en' ? '/corpus/en_pron/search?key=' + key : '/corpus/de_pron/search?key=' + key
      this.server.validateMp3Link(link).pipe()
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
      new Audio(this.server.baseUrl + this.$audioUrl.value).play()
  }

  loadTranslation() {
    const note = this.$state.value.note
    if (note) {
      this.server.loadEnRuTranslation(note.name).pipe()
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
    const note = this.$state.value.note
    if (!note) return

    let uploadingFiles = this.$filesPendingUpload.value.length
    this.$filesPendingUpload.value.forEach(w => {
      this.server.uploadFile(note.id, w.file, w.$name.value).pipe()
        .onReceive((data: IMediaFile | undefined) => {
          this.ctx.$msg.value = { text: this.noteToString(note), level: 'info' }
          console.log('EditorVM:uploadFile, complete, data: ', data)
          if (data) {
            this.ctx.$msg.value = { text: this.noteToString(note) + ', uploaded', level: 'info' }
            this.$state.value = { ...this.$state.value, note: { ...note, media: note.media ? [...note.media, data] : [data] } }
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
    const note = this.$state.value.note
    if (!note) return
    this.server.deleteFile({ uid: mf.uid }).pipe()
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
    const note = this.$state.value.note
    return note ? `/media/${note.id}/${mf.uid}` : ''
  }

  private noteToString(n: INote | undefined) {
    const lang = this.$state.value.lang
    const voc = lang && lang.vocs.find(v => v.id === n?.voc_id)
    return n && voc && lang ? `${lang.name} › ${voc.name} › ${n.name}(ID:${n.id})` : 'Note not found'
  }
}

class EditorInteractor extends Interactor<EditorState> {
  constructor(ctx: DerTutorContext) {
    super(ctx)
    console.log('new NoteListInteractor')
  }

  override async load(state: EditorState, keys: UrlKeys) {
    await this.loadLangs(state, keys)
    await this.chooseLang(state, keys)
    await this.chooseVoc(state, keys)
    await this.loadNote(state, keys)
  }

  async loadLangs(state: EditorState, keys: UrlKeys) {
    if (this.ctx.$allLangs.value.length === 0)
      this.ctx.$allLangs.value = await globalContext.server.loadAllLangs().asAwaitable
    state.allLangs = this.ctx.$allLangs.value
  }

  async chooseLang(state: EditorState, keys: UrlKeys) {
    state.lang = state.allLangs && state.allLangs.find(l => l.code === keys.langCode)
  }

  async chooseVoc(state: EditorState, keys: UrlKeys) {
    if (state.lang && keys.vocCode)
      state.voc = state.lang.vocs.find(v => DomainService.encodeName(v.name) === keys.vocCode)
  }

  async loadNote(state: EditorState, keys: UrlKeys) {
    if (keys.noteId)
      state.note = await globalContext.server.loadNote(keys.noteId).asAwaitable
  }
}
