import { RXObservableValue } from "flinker"
import { IndexContext } from "../IndexContext"
import { Action, ActionsList, parseKeyToCode } from "./Action"
import { themeManager } from "../theme/ThemeManager"
import { log } from "../../app/Logger"

export type OperatingModeID = 'connect' | 'explore' | 'read' | 'search'
export interface OperatingMode {
  readonly id: OperatingModeID
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
  readonly $showActions = new RXObservableValue(false)
  readonly actionsList = new ActionsList()
  lastExecutedAction: Action | undefined = undefined

  constructor(id: OperatingModeID, ctx: IndexContext) {
    this.id = id
    this.ctx = ctx
    this.actionsList.add('?', 'Show list of actions', () => this.$showActions.value = true)
    this.actionsList.add('<ESC>', 'Hide list of actions', () => this.$showActions.value = false)
    this.actionsList.add('T', 'Switch theme', () => themeManager.switchTheme())
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
    this.ctx.$msg.value = { text: '', level: 'info' }
    this.lastExecutedAction = undefined
  }

  private cmdBuffer = ''
  private defMsg:any = undefined
  onKeyDown(e: KeyboardEvent): void {
    if (!this.isActive || this.actionsList.actions.length === 0 || e.key === 'Shift') return
    //log('key:', e.key, ', code:', e.code, ', keycode:', e.keyCode)
    const code = parseKeyToCode(e)

    this.cmdBuffer += code

    const a = this.actionsList.find(this.cmdBuffer)
    if (a) {
      if (this.cmdBuffer !== '.')
        this.lastExecutedAction = a
      this.cmdBuffer = ''
      this.defMsg = { text: this.lastExecutedAction?.cmd ?? '', level: 'info' }
      this.ctx.$msg.value = this.defMsg
      a.handler()
      e.preventDefault()
    } else if (this.actionsList.some(this.cmdBuffer)) {
      e.preventDefault()
      this.ctx.$msg.value = { text: this.cmdBuffer, level: 'info' }
    } else {
      this.cmdBuffer = ''
      this.ctx.$msg.value = this.defMsg
    }
  }
}
