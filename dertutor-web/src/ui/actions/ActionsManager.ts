import { RXObservableValue } from "flinker"
import { Path } from "../../app/Utils"
import { InputBufferController } from "../controls/Input"
import { DertutorContext } from "../DertutorContext"
import { themeManager } from "../theme/ThemeManager"
import { Action, ActionsList } from "./Action"

const PATH_ALLOWED_SYMBOLS: Set<string> = new Set('_0123456789/abcdefghijklmnopqrstuvwxyz'.split(''))

export class ActionsManager {
  readonly $mode = new RXObservableValue<'explore' | 'create' | 'rename'>('explore')
  readonly bufferController = new InputBufferController(PATH_ALLOWED_SYMBOLS)

  readonly ctx: DertutorContext
  readonly $showActions = new RXObservableValue(false)
  readonly actionsList = new ActionsList()
  lastExecutedAction: Action | undefined = undefined

  constructor(ctx: DertutorContext) {
    this.ctx = ctx
    this.addKeybindings()
    document.addEventListener('keydown', this.onKeyDown.bind(this))
  }

  private addKeybindings() {
    this.actionsList.add('?', 'Help', () => this.$showActions.value = true)
    this.actionsList.add('<ESC>', 'Hide/Cancel', () => this.$showActions.value = false)
    this.actionsList.add('T', 'Switch theme', () => themeManager.switchTheme())
    this.actionsList.add('.', 'Repeat last action', () => this.lastExecutedAction?.handler())

    this.actionsList.add('g', 'Select first item', () => this.moveCursorToTheFirst())
    this.actionsList.add('G', 'Select last item', () => this.moveCursorToTheLast())

    this.actionsList.add('j', 'Select next item', () => this.moveCursor(1))
    this.actionsList.add('k', 'Select prev item', () => this.moveCursor(-1))

    this.actionsList.add('q', 'Quit', () => this.quit())

    this.actionsList.add('<CR>', 'Navigate to the selected item', () => this.applySelection())

    // this.actionsList.add('h', 'Navigate back', () => this.moveCursorBack())
    // this.actionsList.add('l', 'Navigate forward', () => this.moveCursorIntoDir())

    // this.actionsList.add('<Down>', 'Select next file', () => this.moveCursor(1))
    // this.actionsList.add('<Up>', 'Select prev file', () => this.moveCursor(-1))
    // this.actionsList.add('<Left>', 'Navigate back', () => this.moveCursorBack())
    // this.actionsList.add('<Right>', 'Navigate forward', () => this.moveCursorIntoDir())


    //this.actionsList.add(':n<CR>', 'New file', () => this.newFile())
    //this.actionsList.add(':d<CR>', 'Delete file', () => this.deleteFile())
    //this.actionsList.add(':r<CR>', 'Rename file', () => this.renameFile())
    //this.actionsList.add('/', 'Search file', () => this.searchFile())
  }

  private moveCursor(step: number) {
    const getNextItem = (step: number, children: Array<any>, focusedItem: any | undefined): any => {
      if (children.length === 0) return

      for (let i = 0; i < children.length; i++) {
        if (focusedItem === children[i]) {
          if ((i + step) >= 0 && (i + step) < children.length)
            return children[i + step]
          return focusedItem
        }
      }
      return children[0]
    }

    if (this.ctx.$exploreState.value === 'lang') {
      this.ctx.$focusedItem.value = getNextItem(step, this.ctx.$allLangs.value, this.ctx.$focusedItem.value)
    } else if (this.ctx.$exploreState.value === 'voc' && this.ctx.$selectedLang.value) {
      this.ctx.$focusedItem.value = getNextItem(step, this.ctx.$selectedLang.value.vocabularies, this.ctx.$focusedItem.value)
    } else if (this.ctx.$exploreState.value === 'note' && this.ctx.$selectedVoc.value) {
      this.ctx.$focusedItem.value = getNextItem(step, this.ctx.$selectedVoc.value.notes, this.ctx.$focusedItem.value)
    }
  }

  private moveCursorToTheLast() {
    if (this.ctx.$exploreState.value === 'lang') {
      const count = this.ctx.$allLangs.value.length
      this.ctx.$focusedItem.value = count > 0 ? this.ctx.$allLangs.value[count - 1] : undefined
    } else if (this.ctx.$exploreState.value === 'voc' && this.ctx.$selectedLang.value) {
      const count = this.ctx.$selectedLang.value.vocabularies.length
      this.ctx.$focusedItem.value = count > 0 ? this.ctx.$selectedLang.value.vocabularies[count - 1] : undefined
    } else if (this.ctx.$exploreState.value === 'note' && this.ctx.$selectedVoc.value) {
      const count = this.ctx.$selectedVoc.value.notes.length
      this.ctx.$focusedItem.value = count > 0 ? this.ctx.$selectedVoc.value.notes[count - 1] : undefined
    }
  }

  private moveCursorToTheFirst() {
    if (this.ctx.$exploreState.value === 'lang') {
      this.ctx.$focusedItem.value = this.ctx.$allLangs.value.length > 0 ? this.ctx.$allLangs.value[0] : undefined
    } else if (this.ctx.$exploreState.value === 'voc' && this.ctx.$selectedLang.value) {
      this.ctx.$focusedItem.value = this.ctx.$selectedLang.value.vocabularies.length > 0 ? this.ctx.$selectedLang.value.vocabularies[0] : undefined
    } else if (this.ctx.$exploreState.value === 'note' && this.ctx.$selectedVoc.value) {
      this.ctx.$focusedItem.value = this.ctx.$selectedVoc.value.notes.length > 0 ? this.ctx.$selectedVoc.value.notes[0] : undefined
    }
  }

  private applySelection() {
    if (this.ctx.$focusedItem.value) {
      this.ctx.navigate('/' + this.ctx.$focusedItem.value.path)
    }
  }

  private quit() {
    const keys = Path.parseAdressBar()
    if (keys.noteId !== -1) this.ctx.navigate('/' + keys.langCode + '/' + keys.vocName)
    else if (keys.vocName) this.ctx.navigate('/' + keys.langCode)
    else if (keys.langCode) this.ctx.navigate('/')
  }


  private cmdBuffer = ''
  private defMsg: any = undefined
  onKeyDown(e: KeyboardEvent): void {
    if (this.$mode.value !== 'explore') {
      const code = this.actionsList.parser.keyToCode(e)
      if (code === '<ESC>') {
        this.$mode.value = 'explore'
      } else if (code === '<CR>') {
        //this.applyInput()
      } else {
        this.bufferController.onKeyDown(e)
      }
      return
    }

    if (this.actionsList.actions.length === 0 || e.key === 'Shift') return
    console.log('key:', e.key, ', code:', e.code, ', keycode:', e.keyCode)
    const code = this.actionsList.parser.keyToCode(e)

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