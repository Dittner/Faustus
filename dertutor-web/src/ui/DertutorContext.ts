import { RXObservableValue } from 'flinker'
import { globalContext } from '../App'
import { Path } from '../app/Utils'
import { Lang, Note, Vocabulary } from '../domain/DomainModel'
import { ActionsManager } from './actions/ActionsManager'

export interface Message {
  readonly level: 'warning' | 'error' | 'info'
  readonly text: string
}

export class DertutorContext {
  readonly $allLangs = new RXObservableValue<Array<Lang>>([])
  readonly $selectedLang = new RXObservableValue<Lang | undefined>(undefined)
  readonly $selectedVoc = new RXObservableValue<Vocabulary | undefined>(undefined)
  readonly $selectedNote = new RXObservableValue<Note | undefined>(undefined)
  readonly $focusedItem = new RXObservableValue<Lang | Vocabulary | Note | undefined>(undefined)
  readonly $msg = new RXObservableValue<Message | undefined>(undefined)
  readonly $exploreState = new RXObservableValue<'lang' | 'voc' | 'note'>('lang')

  static self: DertutorContext
  readonly actionsManager: ActionsManager

  static init() {
    if (DertutorContext.self === undefined) {
      DertutorContext.self = new DertutorContext()
    }
    return DertutorContext.self
  }

  private constructor() {
    console.log('new DertutorContext')
    globalContext.app.$location.pipe()
      .onReceive(_ => {
        this.parseLocation()
      }).subscribe()

    this.actionsManager = new ActionsManager(this)

    this.loadAllLangs()
  }

  private loadAllLangs() {
    console.log('DertutorContext:loadAllLangs')
    this.$msg.value = { text: 'Loading...', level: 'info' }
    globalContext.server.loadAllLangs().pipe()
      .onReceive((data: any[]) => {
        this.$msg.value = undefined
        console.log('DertutorContext:loadAllLangs, complete, data: ', data)
        this.$allLangs.value = data.map(d => {
          const l = new Lang()
          l.deserialize(d)
          return l
        }).filter(l => !l.isDamaged)
        this.parseLocation()
      })
      .onError(e => {
        this.$msg.value = { text: e.message, level: 'error' }
      })
      .subscribe()
  }

  private loadVocabularies(l: Lang) {
    console.log('DertutorContext:loadVocabularies')
    this.$msg.value = { text: 'Loading...', level: 'info' }
    l.loadVocabularies().pipe()
      .onReceive(_ => {
        this.$msg.value = undefined
        this.parseLocation()
      })
      .onError(e => {
        this.$msg.value = { text: e.message, level: 'error' }
      })
      .subscribe()
  }

  private loadNotes(v: Vocabulary) {
    console.log('DertutorContext:loadNotes')
    this.$msg.value = { text: 'Loading...', level: 'info' }
    v.loadNotes().pipe()
      .onReceive(_ => {
        this.$msg.value = undefined
        this.parseLocation()
      })
      .onError(e => {
        this.$msg.value = { text: e.message, level: 'error' }
      })
      .subscribe()
  }

  private parseLocation() {
    const keys = Path.parseAdressBar()
    let selectedLang: Lang | undefined
    let selectedVoc: Vocabulary | undefined
    let selectedNote: Note | undefined

    for (const lang of this.$allLangs.value)
      if (lang.code === keys.langCode) {
        selectedLang = lang
        break
      }

    if (selectedLang) {
      if (selectedLang.vocabulariesLoaded) {
        if (keys.vocName) {
          for (const v of selectedLang.vocabularies)
            if (v.name === keys.vocName) {
              selectedVoc = v
              break
            }
        } else {
          this.$selectedVoc.value = selectedLang.vocabularies.length > 0 ? selectedLang.vocabularies[0] : undefined
        }
      } else {
        this.loadVocabularies(selectedLang)
      }
    }

    if (selectedVoc) {
      if (selectedVoc.notesLoaded) {
        if (keys.noteId !== -1) {
          for (const n of selectedVoc.notes)
            if (n.id === keys.noteId) {
              selectedNote = n
              break
            }
        } else {
          this.$selectedNote.value = selectedVoc.notes.length > 0 ? selectedVoc.notes[0] : undefined
        }
      } else {
        this.loadNotes(selectedVoc)
      }
    }

    this.$selectedLang.value = selectedLang
    this.$selectedVoc.value = selectedVoc
    this.$selectedNote.value = selectedNote


    this.$exploreState.value = selectedVoc !== undefined ? 'note' : selectedLang !== undefined ? 'voc' : 'lang'

    if (selectedLang && selectedVoc && selectedNote) {
      this.$focusedItem.value = selectedNote
    } else if (selectedLang && selectedVoc) {
      this.$focusedItem.value = selectedVoc.notes.length > 0 ? selectedVoc.notes[0] : undefined
    } else if (selectedLang) {
      this.$focusedItem.value = selectedLang.vocabularies.length > 0 ? selectedLang.vocabularies[0] : undefined
    } else if (this.$allLangs.value && this.$allLangs.value.length > 0) {
      this.$focusedItem.value = this.$allLangs.value[0]
    } else {
      this.$focusedItem.value = undefined
    }
  }

  navigate(to: string) {
    globalContext.app.navigate(to)
  }
}

