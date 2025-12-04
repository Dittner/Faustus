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
  readonly parser = new KeyParser()
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

export class KeyParser {
  readonly keyMap = new Map<string, string>()
  constructor() {
    this.map('Enter', '<CR>')
    this.map('Backspace', '<BS>')
    this.map('Delete', '<DEL>')
    this.map('Escape', '<ESC>')
    this.map(' ', '<Space>')
    this.map('ArrowUp', '<Up>')
    this.map('ArrowDown', '<Down>')
    this.map('ArrowLeft', '<Left>')
    this.map('ArrowRight', '<Right>')
  }

  map(k: string, v: string) {
    this.keyMap.set(k, v)
  }

  keyToCode(e: KeyboardEvent) {
    const key = this.keyMap.get(e.key) ?? e.key
    return e.ctrlKey || e.metaKey ? '<C-' + key + '>' : key
  }
}