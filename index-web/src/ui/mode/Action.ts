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