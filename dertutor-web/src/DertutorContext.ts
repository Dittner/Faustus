import { RXObservableValue } from 'flinker'
import { ServerConnectionVM } from './ui/view/connect/ServerConnectionVM'
import { LangListVM } from './ui/view/lang/LangListVM'
import { NoteListVM } from './ui/view/note/NoteListVM'
import { IViewModel } from './ui/view/ViewModel'
import { VocListVM } from './ui/view/vocs/VocListVM'
import { EditorVM } from './ui/view/editor/EditorVM'
import { ILang } from './domain/DomainModel'
import { URLNavigator } from './app/URLNavigator'

export interface Message {
  readonly level: 'warning' | 'error' | 'info'
  readonly text: string
}

export class DertutorContext {
  static readonly PAGE_SIZE = 20
  readonly $activeVM: RXObservableValue<IViewModel>
  readonly connectionVM: ServerConnectionVM
  readonly langListVM: LangListVM
  readonly vocListVM: VocListVM
  readonly noteListVM: NoteListVM
  readonly editorVM: EditorVM

  readonly $allLangs = new RXObservableValue<ILang[]>([])
  readonly $msg = new RXObservableValue<Message | undefined>(undefined)

  readonly navigator: URLNavigator
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
    this.editorVM = new EditorVM(this)

    this.$activeVM = new RXObservableValue(this.connectionVM)
    this.connectionVM.activate()

    this.navigator = new URLNavigator()
    document.addEventListener('keydown', this.onKeyDown.bind(this))
  }

  onKeyDown(e: KeyboardEvent): void {
    if (document.activeElement?.tagName !== 'INPUT')
      this.$activeVM.value.onKeyDown(e)
  }
}

