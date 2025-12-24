import { RXObservableValue } from 'flinker'
import { ServerConnectionVM } from './ui/view/connect/ServerConnectionVM'
import { NoteListVM } from './ui/view/note/NoteListVM'
import { IViewModel } from './ui/view/ViewModel'
import { VocListVM } from './ui/view/vocs/VocListVM'
import { EditorVM } from './ui/view/editor/EditorVM'
import { ILang } from './domain/DomainModel'
import { globalContext } from './App'

export interface Message {
  readonly level?: 'warning' | 'error' | 'info'
  readonly text: string
}

export class DerTutorContext {
  static readonly PAGE_SIZE = 20
  readonly $activeVM = new RXObservableValue<IViewModel | undefined>(undefined)

  readonly connectionVM: ServerConnectionVM
  readonly vocListVM: VocListVM
  readonly noteListVM: NoteListVM
  readonly editorVM: EditorVM

  readonly $allLangs = new RXObservableValue<ILang[]>([])
  readonly $msg = new RXObservableValue<Message | undefined>(undefined)
  readonly router: DerTutorRouter

  static self: DerTutorContext

  static init() {
    if (DerTutorContext.self === undefined)
      DerTutorContext.self = new DerTutorContext()
    return DerTutorContext.self
  }

  private constructor() {
    console.log('new DertutorContext')
    this.connectionVM = new ServerConnectionVM(this)
    this.vocListVM = new VocListVM(this)
    this.noteListVM = new NoteListVM(this)
    this.editorVM = new EditorVM(this)

    this.router = new DerTutorRouter(this)

    document.addEventListener('keydown', this.onKeyDown.bind(this))
  }

  onKeyDown(e: KeyboardEvent): void {
    if (document.activeElement?.tagName !== 'INPUT')
      this.$activeVM.value?.onKeyDown(e)
  }
}

export class DerTutorRouter {
  constructor(ctx: DerTutorContext) {
    globalContext.navigator.$keys.pipe()
      .onReceive(keys => {
        if (!globalContext.server.$isServerAvailable.value)
          ctx.$activeVM.value = ctx.connectionVM
        else if (keys.noteId && keys.edit)
          ctx.$activeVM.value = ctx.editorVM
        else if (keys.langCode && (keys.vocCode || (keys.searchKey && keys.searchKey.length > 1)))
          ctx.$activeVM.value = ctx.noteListVM
        else
          ctx.$activeVM.value = ctx.vocListVM

        ctx.$activeVM.value.urlDidChange(keys)
      })
      .subscribe()
  }
}