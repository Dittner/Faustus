import { RXObservableValue } from 'flinker'
import { globalContext } from '../App'
import { Lang, Note, Vocabulary } from '../domain/DomainModel'
import { ServerConnectionVM } from './view/connect/ServerConnectionVM'
import { LangListVM } from './view/lang/LangListVM'
import { NoteListVM } from './view/note/NoteListVM'
import { IViewModel } from './view/ViewModel'
import { VocListVM } from './view/vocs/VocListVM'

export interface Message {
  readonly level: 'warning' | 'error' | 'info'
  readonly text: string
}

export class DertutorContext {
  readonly $activeVM: RXObservableValue<IViewModel>
  readonly connectionVM: ServerConnectionVM
  readonly langListVM: LangListVM
  readonly vocListVM: VocListVM
  readonly noteListVM: NoteListVM

  readonly $selectedLang = new RXObservableValue<Lang | undefined>(undefined)
  readonly $selectedVoc = new RXObservableValue<Vocabulary | undefined>(undefined)
  readonly $selectedNote = new RXObservableValue<Note | undefined>(undefined)
  readonly $msg = new RXObservableValue<Message | undefined>(undefined)

  static self: DertutorContext

  static init() {
    if (DertutorContext.self === undefined) {
      DertutorContext.self = new DertutorContext()
    }
    return DertutorContext.self
  }

  private constructor() {
    console.log('new DertutorContext')
    this.connectionVM = new ServerConnectionVM(this)
    this.langListVM = new LangListVM(this)
    this.vocListVM = new VocListVM(this)
    this.noteListVM = new NoteListVM(this)

    this.$activeVM = new RXObservableValue(this.connectionVM)
    this.connectionVM.activate()

    document.addEventListener('keydown', this.onKeyDown.bind(this))
  }

  onKeyDown(e: KeyboardEvent): void {
    this.$activeVM.value.onKeyDown(e)
  }

  navigate(to: string) {
    console.log('Navigate to:', to)
    globalContext.app.navigate(to)
  }
}

