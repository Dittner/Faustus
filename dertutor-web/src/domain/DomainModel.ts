import { AnyRXObservable, RXObservableEntity } from 'flinker'
import { generateUID } from '../app/Utils'
import { globalContext } from '../App'

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

  get path() { return this.code }

  constructor() {
    super()
  }

  deserialize(data: any) {
    try {
      this.data = data
      console.log('Lang: ' + data?.id + ', code:', data.code)

      if (data === undefined || data.id == undefined || data.code == undefined) {
        console.log('Lang:deserialize, Lang is damaged, data:', data)
        this.isDamaged = true
      }
      else {
        this.id = data.id
        this.code = data.code
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

  get path() { return this.lang.path + '/' + this.name }

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
        console.log('Lang:loadVocabularies, complete, data: ', data)
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
  createNote(value1: string, value2: string, value3: string, examples: string, options: any): Note {
    const res = new Note(this)
    res.value1 = value1
    res.value2 = value2
    res.value3 = value3
    res.examples = examples
    res.options = options
    return res
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

export class Note {
  isDamaged = false
  id = -1
  value1 = ''
  value2 = ''
  value3 = ''
  examples = ''
  options: any = {}
  audioId = -1
  vocabulary: Vocabulary

  data: any = {}


  get path() { return this.vocabulary.path + '/' + this.id }

  constructor(voc: Vocabulary) {
    this.vocabulary = voc
  }

  deserialize(data: any) {
    try {
      this.data = data
      console.log('Note: ' + data?.id + ', value1:', data.value1)

      if (data === undefined || data.id == undefined || data.vocabulary_id == undefined || data.value1 == undefined || data.value2 == undefined || data.value3 == undefined) {
        console.log('Note:deserialize, Note is damaged, data:', data)
        this.isDamaged = true
      }
      else {
        this.id = data.id
        this.value1 = data.value1
        this.value2 = data.value2
        this.value3 = data.value3
        this.examples = data.examples ?? ''
        this.options = data.options ?? {}
        this.audioId = data.audioId ?? -1
        this.isDamaged = false
      }
    } catch (e: any) {
      this.isDamaged = true
      console.log('Note:deserialize, err:', e.message, 'data:', data)
    }
  }
}

