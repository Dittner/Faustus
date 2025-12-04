import { AnyRXObservable, RXObservableEntity } from 'flinker'
import { globalContext } from '../App'
import { generateUID, Path } from '../app/Utils'

/*
*
*
* DOMAIN ENTITY
*
*
* */

export class Lang extends RXObservableEntity<Lang> {
  readonly uid = generateUID()
  isDamaged = false
  id = -1
  code: string = ''
  name: string = ''
  vocabularies: Array<Vocabulary> = []
  vocabulariesLoaded = false
  data: any = {}

  private _hasChanges = false
  get hasChanges() { return this._hasChanges }
  set hasChanges(value: boolean) {
    if (value !== this._hasChanges) {
      this._hasChanges = value
      this.mutated()
    }
  }

  get path() { return '/' + this.code }

  constructor() {
    super()
  }

  deserialize(data: any) {
    try {
      this.data = data
      console.log('Lang: ' + data?.id + ', code:', data.code)

      if (data === undefined || data.id == undefined || data.code == undefined || data.name === undefined) {
        console.log('Lang:deserialize, Lang is damaged, data:', data)
        this.isDamaged = true
      }
      else {
        this.id = data.id
        this.code = data.code
        this.name = data.name
        this.isDamaged = false
      }
    } catch (e: any) {
      this.isDamaged = true
      console.log('Lang:deserialize, err:', e.message, 'data:', data)
    }
    this.hasChanges = false
    this.mutated()
  }

  private loadOp: AnyRXObservable | undefined
  loadVocabularies() {
    if (this.loadOp && !this.loadOp.isComplete) return this.loadOp

    const op = globalContext.server.loadVocabularies(this.id)
    op.pipe()
      .onReceive((data: any[]) => {
        console.log('Lang:loadVocabularies, complete, data: ', data)
        this.vocabularies = data.map(d => {
          const v = new Vocabulary(this)
          v.deserialize(d)
          return v
        }).filter(v => !v.isDamaged)
        this.vocabulariesLoaded = true
        this.mutated()
      })
      .onError(e => {
        this.vocabularies = []
      })
      .subscribe()

    this.loadOp = op
    return op
  }

  //--------------------------------------
  //  vocabularies
  //--------------------------------------
  createVoc(name: string): Vocabulary {
    const v = new Vocabulary(this)
    v.name = name
    return v
  }

  remove(voc: Vocabulary): number {
    const ind = this.vocabularies.findIndex(v => v.uid === voc.uid)
    if (ind !== -1) {
      this.vocabularies.splice(ind, 1)
      voc.dispose()
      this.hasChanges = true
      this.mutated()
      return ind
    }
    return -1
  }

  discardChanges() {
    if (this.hasChanges) {
      this.deserialize(this.data)
      this.hasChanges = false
    }
  }

  dispose() {
    super.dispose()
    this.vocabularies.forEach(b => {
      b.dispose()
    })
    this.vocabularies = []
  }
}

/*
*
*
* DOMAIN ENTITY
*
*
* */


export class Vocabulary extends RXObservableEntity<Vocabulary> {
  readonly uid = generateUID()
  isDamaged = false
  id = -1
  name = ''
  code = ''
  lang: Lang
  notes: Array<Note> = []
  notesLoaded = false
  data: any = {}

  private _hasChanges = false
  get hasChanges() { return this._hasChanges }
  set hasChanges(value: boolean) {
    if (value !== this._hasChanges) {
      this._hasChanges = value
      this.mutated()
    }
  }

  get path() { return this.lang.path + '/' + this.code }

  constructor(lang: Lang) {
    super()
    this.lang = lang
  }

  deserialize(data: any) {
    try {
      this.data = data
      console.log('Vocabulary: ' + data?.id + ', name:', data.name)

      if (data === undefined || data.id == undefined || data.name == undefined) {
        console.log('Vocabulary:deserialize, Vocabulary is damaged, data:', data)
        this.isDamaged = true
      }
      else {
        this.id = data.id
        this.name = data.name
        this.code = Path.format(data.name)
        this.isDamaged = false
      }
    } catch (e: any) {
      this.isDamaged = true
      console.log('Lang:deserialize, err:', e.message, 'data:', data)
    }
    this.hasChanges = false
    this.mutated()
  }

  private loadOp: AnyRXObservable | undefined
  loadNotes() {
    if (this.loadOp && !this.loadOp.isComplete) return this.loadOp

    const op = globalContext.server.loadNotes(this.id)
    op.pipe()
      .onReceive((data: any[]) => {
        console.log('Lang:loadNotes, complete, data: ', data)
        this.notes = data.map(d => {
          const n = new Note(this)
          n.deserialize(d)
          return n
        }).filter(n => !n.isDamaged)
        this.notesLoaded = true
        this.mutated()
      })
      .onError(e => {
        this.notes = []
      })
      .subscribe()

    this.loadOp = op
    return op
  }

  //--------------------------------------
  //  vocabularies
  //--------------------------------------
  createNote(title: string): Note {
    const res = new Note(this)
    res.title = title
    res.text = '# ' + title + '\n\n' + (this.lang.code === 'en' ? '## Examples\n' : '## Beispiele\n')
    return res
  }

  add(note: Note) {
    if (!note.isDamaged) {
      this.notes.push(note)
      this.hasChanges = true
      this.mutated()
    }
  }

  remove(note: Note): number {
    const ind = this.notes.findIndex(n => n.id === note.id)
    if (ind !== -1) {
      this.notes.splice(ind, 1)
      this.hasChanges = true
      this.mutated()
      return ind
    }
    return -1
  }

  discardChanges() {
    if (this.hasChanges) {
      this.deserialize(this.data)
      this.hasChanges = false
    }
  }

  dispose() {
    super.dispose()
    this.notes = []
  }
}


/*
*
*
* DOMAIN ENTITY
*
*
* */

export const noteLevels = ['', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2']
export class Note {
  isDamaged = false
  id = -1
  title = ''
  text = ''
  level = 0
  audioUrl = ''
  vocabulary: Vocabulary
  mediaFiles: Array<MediaFile> = []
  mediaLoaded = false
  data: any = {}


  get path() { return this.vocabulary.path + '/' + this.id }
  get levelStr() { return this.level < noteLevels.length ? noteLevels[this.level] : '' }

  get hasChanges() {
    if (this.data.text !== this.text) return true
    if (this.data.title !== this.title) return true
    if (this.data.audio_url !== this.audioUrl) return true
    if (this.data.level !== this.level) return true
    return false
  }

  constructor(voc: Vocabulary) {
    this.vocabulary = voc
  }

  deserialize(data: any) {
    try {
      this.data = data
      console.log('Note: ' + data?.id + ', title:', data.title)

      if (data === undefined || data.id === undefined || data.title === undefined || data.text === undefined || data.audio_url === undefined || data.level === undefined) {
        console.log('Note:deserialize, Note is damaged, data:', data)
        this.isDamaged = true
      }
      else {
        this.id = data.id
        this.title = data.title
        this.text = data.text
        this.level = data.level
        this.audioUrl = data.audio_url
        this.isDamaged = false
      }
    } catch (e: any) {
      this.isDamaged = true
      console.log('Note:deserialize, err:', e.message, 'data:', data)
    }
  }

  serialize(): any {
    return {
      title: this.title,
      text: this.text,
      level: this.level,
      vocabulary_id: this.vocabulary.id,
      audio_url: this.audioUrl
    }
  }

  play() {
    if (this.audioUrl)
      new Audio(globalContext.server.baseUrl + this.audioUrl).play()
  }

  private loadOp: AnyRXObservable | undefined
  loadMediaFiles() {
    if (this.loadOp && !this.loadOp.isComplete) return this.loadOp

    const op = globalContext.server.loadAllMediaFiles(this.id)
    op.pipe()
      .onReceive((data: any[]) => {
        console.log('MediaFile:loadMediaFiles, complete, data: ', data)
        this.mediaFiles = data.map(d => {
          const n = new MediaFile()
          n.deserialize(d)
          return n
        }).filter(n => !n.isDamaged)
        this.mediaLoaded = true
      })
      .onError(e => {
        this.mediaFiles = []
        this.mediaLoaded = false
      })
      .subscribe()

    this.loadOp = op
    return op
  }
}

/*
*
*
* DOMAIN ENTITY
*
*
* */

export class MediaFile {
  isDamaged = false
  uid = ''
  name = ''
  mediaType = ''
  noteId = -1

  data: any = {}

  get url() { return '/media/' + this.noteId + '/' + this.uid }


  deserialize(data: any) {
    try {
      this.data = data
      console.log(`MediaFile: {data?.uid}`)

      if (data === undefined || data.uid === undefined || data.note_id === undefined || data.name === undefined || data.media_type === undefined) {
        console.log(`MediaFile:deserialize, MediaFile is damaged, data: {data}`)
        this.isDamaged = true
      }
      else {
        this.uid = data.uid
        this.noteId = data.note_id
        this.mediaType = data.media_type
        this.name = data.name
        this.isDamaged = false
      }
    } catch (e: any) {
      this.isDamaged = true
      console.log(`MediaFile:deserialize, err: {e.message}, data: {data}`)
    }
  }
}
