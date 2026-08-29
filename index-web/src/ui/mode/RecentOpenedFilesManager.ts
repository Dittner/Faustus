import { RXObservableValue, RXSubject } from "flinker"
import { IndexContext } from "../IndexContext"
import { log } from "../../app/Logger"
import { globalContext } from "../../App"
import { ActionController } from "./Action"

export interface RecentOpenedFile {
  name: string
  path: string
  pageIndex: number
}

export class RecentOpenedFilesManager extends ActionController {
  readonly $isOpened = new RXObservableValue(false)

  readonly storeKey = 'recentOpenedFiles'
  readonly $files = new RXSubject<RecentOpenedFile[], never>([])
  readonly $selectedFile = new RXObservableValue<RecentOpenedFile | undefined>(undefined)

  constructor(ctx: IndexContext) {
    super(ctx)
    log('new RecentOpenedFilesManager')
    this.$files.send(ctx.localStore.has(this.storeKey) ? ctx.localStore.read(this.storeKey) : [])
    if (this.$files.value.length > 0)
      this.$selectedFile.value = this.$files.value[0]

    this.addKeybindings()
  }

  add(fileName: string, filePath: string, pageIndex: number) {
    const fileInd = this.$files.value.findIndex(f => f.path === filePath)
    if (fileInd !== -1) {
      this.$files.value.splice(fileInd, 1)
    }
    const newFile = { name: fileName, path: filePath, pageIndex: pageIndex }
    this.$files.value.unshift(newFile)
    this.$selectedFile.value = newFile
    if (this.$files.value.length > 5)
      this.$files.send(this.$files.value.slice(0, 5))
    else
      this.$files.resend()
    this.ctx.localStore.write(this.storeKey, this.$files.value, true)
  }

  /*
  *
  * KEYBINDINGS
  *
  */

  private addKeybindings() {
    this.actionsList.add('g', 'Select first file', () => this.moveCursorToTheFirst())
    this.actionsList.add('G', 'Select last file', () => this.moveCursorToTheLast())

    this.actionsList.add('j', 'Select next file', () => this.moveCursor(1))
    this.actionsList.add('<Down>', 'Select next file', () => this.moveCursor(1))
    this.actionsList.add('k', 'Select prev file', () => this.moveCursor(-1))
    this.actionsList.add('<Up>', 'Select prev file', () => this.moveCursor(-1))

    this.actionsList.add('q', 'Quit', () => this.quit())
    this.actionsList.add('<CR>', 'Open file', () => this.openFile())
  }

  override escPressed() {
    super.escPressed()
    this.quit()
  }

  private moveCursor(step: number) {
    const selectedFile = this.$selectedFile.value
    const files = this.$files.value
    if (!selectedFile) return
    for (let i = 0; i < files.length; i++) {
      if (selectedFile.path === files[i].path) {
        if ((i + step) >= 0 && (i + step) < files.length) {
          this.$selectedFile.value = files[i + step]
        }
        return
      }
    }
    this.$selectedFile.value = files.length > 0 ? files[0] : undefined
  }

  private moveCursorToTheFirst() {
    const f = this.$selectedFile.value
    if (f && this.$files.value.length > 0) {
      this.$selectedFile.value = this.$files.value[0]
    }
  }

  private moveCursorToTheLast() {
    const f = this.$selectedFile.value
    if (f && this.$files.value.length > 0) {
      this.$selectedFile.value = this.$files.value[this.$files.value.length - 1]
    }
  }

  showFilesList() {
    if (this.$isOpened.value) return
    this.$isOpened.value = true
    this.$selectedFile.value = this.$files.value.length > 0 ? this.$files.value[0] : undefined
    this.ctx.$actionControllerStack.push(this)
  }

  private quit() {
    if (!this.$isOpened.value) return
    this.$isOpened.value = false
    this.ctx.$actionControllerStack.pop()
  }

  private openFile() {
    if (this.$selectedFile.value) {
      globalContext.app.navigate(this.$selectedFile.value.path)
      this.quit()
      this.ctx.reader.activate()
    }
  }
}