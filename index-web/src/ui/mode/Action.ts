import { RXObservableValue } from "flinker"
import { IndexContext } from "../IndexContext"
import { themeManager } from "../theme/ThemeManager"

export class Action {
  readonly desc: string
  readonly cmd: string
  readonly handler: () => void
  constructor(cmd: string, desc: string, handler: () => void) {
    this.cmd = cmd
    this.desc = desc
    this.handler = handler
  }
}

export class ActionsList {
  readonly actions: Array<Action> = [] // description, keyCode, handler
  constructor() { }

  add(code: string, desc: string, handler: () => void) {
    this.actions.push(new Action(code, desc, handler))
  }

  find(cmd: string): Action | undefined {
    return this.actions.find(a => a.cmd === cmd)
  }

  some(action: string): boolean {
    return this.actions.some(a => a.cmd.indexOf(action) === 0)
  }

  clear() {
    this.actions.length = 0
  }
}

const keyMap = (key: string) => {
  switch (key) {
    case ('Enter'): return '<CR>'
    case ('Backspace'): return '<BS>'
    case ('Delete'): return '<DEL>'
    case ('Escape'): return '<ESC>'
    case (' '): return '<Space>'
    case ('ArrowUp'): return '<Up>'
    case ('ArrowDown'): return '<Down>'
    case ('ArrowLeft'): return '<Left>'
    case ('ArrowRight'): return '<Right>'
    default: return key
  }
}

export const parseKeyToCode = (e: KeyboardEvent) => {
  const key = keyMap(e.key)
  return e.ctrlKey || e.metaKey ? '<C-' + key + '>' : key
}

export class ActionController {
  readonly ctx: IndexContext
  readonly $showActions = new RXObservableValue(false)
  readonly actionsList = new ActionsList()
  lastExecutedAction: Action | undefined = undefined

  constructor(ctx: IndexContext) {
    this.ctx = ctx
    this.actionsList.add('?', 'Show list of actions', () => this.$showActions.value = true)
    this.actionsList.add('<ESC>', 'Hide windows', () => this.escPressed())
    this.actionsList.add('t', 'Switch theme', () => themeManager.switchTheme())
    this.actionsList.add('.', 'Repeat last action', () => this.lastExecutedAction?.handler())
  }

  private cmdBuffer = ''
  private defMsg: any = undefined
  onKeyDown(e: KeyboardEvent): void {
    if (this.actionsList.actions.length === 0 || e.key === 'Shift') return
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

  escPressed() {
    this.$showActions.value = false
  }
}