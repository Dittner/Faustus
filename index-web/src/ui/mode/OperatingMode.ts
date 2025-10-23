import { RXObservableValue } from "flinker"
import { IndexContext } from "../IndexContext"
import { Action, ActionsList } from "./Action"

export type OperatingModeID = 'connect' | 'explore' | 'read' | 'search'
export interface OperatingMode {
  readonly id: OperatingModeID
  readonly $cmdBuffer: RXObservableValue<string>
  readonly $showActions: RXObservableValue<boolean>
  readonly actionsList: ActionsList
  lastExecutedAction: Action | undefined
  activate(): void
  deactivate(): void
  onKeyDown(e: KeyboardEvent): void
}

export class OperatingModeClass implements OperatingMode {
  readonly id: OperatingModeID
  readonly ctx: IndexContext
  readonly $cmdBuffer = new RXObservableValue('')
  readonly $showActions = new RXObservableValue(false)
  readonly actionsList = new ActionsList()
  lastExecutedAction: Action | undefined = undefined

  constructor(id: OperatingModeID, ctx: IndexContext) {
    this.id = id
    this.ctx = ctx
    this.actionsList.add(':?<CR>', 'Show list of actions', () => this.$showActions.value = true)
    this.actionsList.add('<ESC>', 'Hide list of actions/any messages', () => {
      this.$showActions.value = false
      this.ctx.$msg.value = undefined
    })
    this.actionsList.add('.', 'Repeat last action', () => this.lastExecutedAction?.handler())
  }

  get isActive(): boolean {
    return this.ctx.$mode.value.id == this.id
  }

  activate(): void {
    this.ctx.$mode.value.deactivate()
    this.ctx.$mode.value = this
  }

  deactivate(): void {
    this.ctx.$msg.value = undefined
    this.$cmdBuffer.value = ''
    this.lastExecutedAction = undefined
  }

  onKeyDown(e: KeyboardEvent): void {
    if (!this.isActive || this.actionsList.actions.length === 0 || e.key === 'Shift') return
    console.log('key:', e.key, ', code:', e.code, ', keycode:', e.keyCode)
    const code = this.actionsList.parser.keyToCode(e)

    this.$cmdBuffer.value += code
    const a = this.actionsList.find(this.$cmdBuffer.value)
    if (a) {
      a.handler()
      if (this.$cmdBuffer.value !== '.')
        this.lastExecutedAction = a
      this.$cmdBuffer.value = ''
      e.preventDefault()
    } else if (!this.actionsList.some(this.$cmdBuffer.value)) {
      this.$cmdBuffer.value = ''
    } else {
      e.preventDefault()
    }
  }
}
