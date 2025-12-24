import { RXObservableValue } from "flinker"
import { DerTutorContext } from "../../DerTutorContext"
import { Action, ActionsList } from "../actions/Action"
import { themeManager } from "../theme/ThemeManager"
import { UrlKeys, URLNavigator } from "../../app/URLNavigator"
import { globalContext } from "../../App"
import { DertutorServer } from "../../backend/DertutorServer"
import { Interactor } from "./Interactor"

export type ViewModelID = 'connection' | 'vocs' | 'notes' | 'editor'
export interface IViewModel {
  readonly id: ViewModelID
  readonly $showActions: RXObservableValue<boolean>
  readonly $cmd: RXObservableValue<string>
  readonly actionsList: ActionsList
  lastExecutedAction: Action | undefined
  onKeyDown(e: KeyboardEvent): void
  urlDidChange(keys: UrlKeys): void
}

export class ViewModel<ViewModelState> implements IViewModel {
  readonly id: ViewModelID
  readonly ctx: DerTutorContext
  readonly navigator: URLNavigator
  readonly interactor: Interactor<ViewModelState>
  readonly server: DertutorServer

  readonly $showActions = new RXObservableValue(false)
  readonly $cmd = new RXObservableValue('')
  readonly actionsList = new ActionsList()
  lastExecutedAction: Action | undefined = undefined

  constructor(id: ViewModelID, ctx: DerTutorContext, interactor: Interactor<ViewModelState>) {
    this.id = id
    this.ctx = ctx
    this.navigator = globalContext.navigator
    this.server = globalContext.server

    this.interactor = interactor
    interactor.$state.pipe()
      .skipFirst()
      .onReceive(s => this.stateDidChange(s))

    this.ctx.$activeVM.pipe().onReceive(vm => {
      if (vm?.id === id) this.activate()
      else if (this.isActive) this.deactivate()
    })

    this.addDefaultKeybindings()
  }

  get isActive(): boolean {
    return this.ctx.$activeVM.value?.id == this.id
  }

  protected activate(): void {
    console.log(`VM <${this.id}> is activated`)
    this.interactor.clearCache()
  }

  protected deactivate(): void {
    this.$cmd.value = ''
    this.lastExecutedAction = undefined
  }

  urlDidChange(keys: UrlKeys): void {
    this.interactor.run(keys)
  }

  protected stateDidChange(state: ViewModelState) { }

  addDefaultKeybindings(): void {
    this.actionsList.add('?', 'Show list of actions', () => this.$showActions.value = true)
    this.actionsList.add('<ESC>', 'Hide actions/Clear messages', () => {
      this.$showActions.value = false
      this.ctx.$msg.value = undefined
    })
    this.actionsList.add('T', 'Switch theme', () => {
      themeManager.switchTheme()
      this.ctx.$msg.value = { 'level': 'info', 'text': themeManager.$theme.value.id + ' theme' }
    })
    this.actionsList.add('.', 'Repeat last action', () => this.lastExecutedAction?.handler())
  }

  private cmdBuffer = ''
  async onKeyDown(e: KeyboardEvent): Promise<void> {
    if (!this.isActive || this.actionsList.actions.length === 0 || e.key === 'Shift') return
    //console.log('key:', e.key, ', code:', e.code, ', keycode:', e.keyCode)
    const code = this.actionsList.parser.keyToCode(e)

    this.cmdBuffer += code

    const a = this.actionsList.find(this.cmdBuffer)
    if (a) {
      if (this.cmdBuffer !== '.')
        this.lastExecutedAction = a
      this.cmdBuffer = ''
      this.$cmd.value = this.lastExecutedAction?.cmd ?? ''
      a.handler()
      e.preventDefault()
    } else if (this.actionsList.some(this.cmdBuffer)) {
      e.preventDefault()
      this.$cmd.value = this.cmdBuffer
    } else {
      this.cmdBuffer = ''
    }
  }
}
