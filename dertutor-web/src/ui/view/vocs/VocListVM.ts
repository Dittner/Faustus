import { RXObservableValue } from "flinker"

import { globalContext } from "../../../App"
import { InputBufferController } from "../../controls/Input"
import { DertutorContext } from "../../../DertutorContext"
import { ViewModel } from "../ViewModel"
import { DomainService, ILang, IVoc } from "../../../domain/DomainModel"
import { CreateVocSchema, DeleteVocSchema, RenameVocSchema } from "../../../backend/Schema"

export class VocListVM extends ViewModel {
  readonly $selectedLang = new RXObservableValue<ILang | undefined>(undefined)
  readonly $vocs = new RXObservableValue<IVoc[]>([])
  readonly $selectedVoc = new RXObservableValue<IVoc | undefined>(undefined)
  readonly $mode = new RXObservableValue<'explore' | 'create' | 'rename'>('explore')
  readonly bufferController = new InputBufferController()

  constructor(ctx: DertutorContext) {
    super('vocs', ctx)
    this.addKeybindings()
  }

  private addKeybindings() {
    this.actionsList.add('g', 'Select first vocabulary', () => this.moveCursorToTheFirst())
    this.actionsList.add('G', 'Select last vocabulary', () => this.moveCursorToTheLast())

    this.actionsList.add('<Right>', 'Select next vocabulary', () => this.moveCursor(1))
    this.actionsList.add('<Down>', 'Select next vocabulary', () => this.moveCursor(1))
    this.actionsList.add('<Left>', 'Select prev vocabulary', () => this.moveCursor(-1))
    this.actionsList.add('<Up>', 'Select prev vocabulary', () => this.moveCursor(-1))

    this.actionsList.add('n', 'New vocabulary (ADMIN)', () => this.createVoc())
    this.actionsList.add('r', 'Rename vocabulary (ADMIN)', () => this.renameVoc())
    this.actionsList.add(':d<CR>', 'Delete vocabulary (ADMIN)', () => this.deleteVoc())
    this.actionsList.add('q', 'Quit', () => this.quit())

    this.actionsList.add('<CR>', 'Go [Enter]', () => this.applySelection())
    this.actionsList.add(':id<CR>', 'Print ID of vocabulary', () => this.printID())
  }

  private moveCursor(step: number) {
    const children = this.$vocs.value

    for (let i = 0; i < children.length; i++) {
      if (this.$selectedVoc.value === children[i]) {
        if ((i + step) >= 0 && (i + step) < children.length)
          this.$selectedVoc.value = children[i + step]
        break
      }
    }
  }

  private moveCursorToTheLast() {
    const children = this.$vocs.value
    this.$selectedVoc.value = children.length > 0 ? children[children.length - 1] : undefined
  }

  private moveCursorToTheFirst() {
    const children = this.$vocs.value
    this.$selectedVoc.value = children.length > 0 ? children[0] : undefined
  }

  private applySelection() {
    if (this.$selectedLang.value && this.$selectedVoc.value) {
      this.ctx.navigator.navigateTo({ langCode: this.$selectedLang.value.code, vocCode: this.encodeName(this.$selectedVoc.value) })
      this.ctx.noteListVM.activate()
    }
  }

  private encodeName(voc:IVoc) {
    return DomainService.encodeName(voc.name)
  }

  private printID() {
    if (this.$selectedVoc.value)
      this.ctx.$msg.value = { 'level': 'info', 'text': `ID=${this.$selectedVoc.value}` }
    else
      this.ctx.$msg.value = { 'level': 'info', 'text': 'Not selected' }
  }

  private createVoc() {
    if (this.$mode.value === 'explore') {
      this.bufferController.$buffer.value = ''
      this.$mode.value = 'create'
    }
  }

  private renameVoc() {
    if (!this.$selectedVoc.value) return
    if (this.$mode.value !== 'explore') return
    this.bufferController.$buffer.value = this.$selectedVoc.value.name
    this.$mode.value = 'rename'
  }

  private quit() {
    this.ctx.navigator.navigateTo({})
    this.ctx.langListVM.activate()
  }

  override async onKeyDown(e: KeyboardEvent): Promise<void> {
    if (this.$mode.value === 'explore') {
      super.onKeyDown(e)
    } else {
      const code = this.actionsList.parser.keyToCode(e)
      if (code === '<ESC>') {
        this.$mode.value = 'explore'
      } else if (code === '<CR>') {
        this.applyInput()
      } else if (code === '<C-v>') {
        await this.bufferController.pasteFromKeyboard()
      } else {
        this.bufferController.onKeyDown(e)
      }
    }
  }

  private applyInput() {
    if (this.$mode.value === 'create') {
      this.completeCreation()
      this.$mode.value = 'explore'
    } else if (this.$mode.value === 'rename') {
      this.completeRenaming()
      this.$mode.value = 'explore'
    }
  }

  private completeCreation() {
    const lang = this.$selectedLang.value
    const name = this.bufferController.$buffer.value.trim()
    if (lang && name) {
      const schema = {} as CreateVocSchema
      schema.lang_id = lang.id
      schema.name = name
      
      globalContext.server.createVoc(schema).pipe()
        .onReceive((data: IVoc) => {
          console.log('VocListVM:applyInput, creating voc, result: ', data)
          if (data) {
            lang.vocs.splice(0, 0, data)
            this.$vocs.value = [...lang.vocs]
            this.$selectedVoc.value = data
          } else {
            this.ctx.$msg.value = { level: 'warning', text: 'Created vocabulary is demaged' }
          }
        })
        .onError(e => {
          const msg = e.message.indexOf('duplicate key') ? 'Vocabulary already exists' : e.message
          this.ctx.$msg.value = { level: 'error', text: msg }
        })
        .subscribe()
    }
  }

  private completeRenaming() {
    const lang = this.$selectedLang.value
    const voc = this.$selectedVoc.value

    if (lang && voc) {
      const newName = this.bufferController.$buffer.value.trim()
      if (!newName) {
        this.ctx.$msg.value = { level: 'warning', text: 'Empty name' }
        return
      } else if (newName === voc.name) {
        this.ctx.$msg.value = { level: 'info', text: 'No changes' }
        return
      }

      const schema = { id: voc.id, name: newName } as RenameVocSchema
      globalContext.server.renameVoc(schema).pipe()
        .onReceive((data: IVoc) => {
          console.log('VocListVM:applyInput, renaming voc, result: ', data)
          if (data) {
            this.ctx.$msg.value = { level: 'info', text: 'renamed' }
            const ind = lang.vocs.findIndex(v => v.id === voc.id)
            if (ind !== -1)
              lang.vocs[ind] = { id: voc.id, lang_id: lang.id, name: newName } as IVoc
            this.$vocs.value = [...lang.vocs]
          } else {
            this.ctx.$msg.value = { level: 'info', text: 'Renamed vocabulary is demaged' }
          }
        })
        .onError(e => {
          const msg = e.message.indexOf('duplicate key') ? 'Note already exists' : e.message
          this.ctx.$msg.value = { level: 'error', text: msg }
        })
        .subscribe()
    }
  }

  private deleteVoc() {
    if (this.$mode.value !== 'explore') return
    const lang = this.$selectedLang.value
    const voc = this.$selectedVoc.value
    if (lang && voc) {
      const schema = { id: voc.id } as DeleteVocSchema
      globalContext.server.deleteVoc(schema).pipe()
        .onReceive(_ => {
          console.log('VocListVM:deleteNote complete')
          this.ctx.$msg.value = { level: 'info', text: 'deleted' }
          this.moveCursor(1)
          if (this.$selectedVoc.value === voc)
            this.moveCursor(-1)

          const ind = lang.vocs.findIndex(v => v.id === voc.id)
          if (ind !== -1)
            lang.vocs.splice(ind, 1)
          this.$vocs.value = [...lang.vocs]
        })
        .onError(e => {
          this.ctx.$msg.value = { level: 'error', text: e.message }
        })
        .subscribe()
    }
  }

  /*
  *
  * ACTIVATE
  *
  */

  override activate(): void {
    super.activate()
    const k = this.ctx.navigator.$keys.value
    const lang = k.langCode ? this.ctx.$allLangs.value.find(l => l.code === k.langCode) : undefined
    this.$selectedLang.value = lang
    if (lang) {
      this.$vocs.value = lang.vocs
      this.selectFromUrl()
    } else {
      this.ctx.langListVM.activate()
    }
  }

  private selectFromUrl() {
    const k = this.ctx.navigator.$keys.value
    if (k.vocCode) {
      this.$selectedVoc.value = this.$vocs.value.find(v => this.encodeName(v) === k.vocCode)
      this.ctx.noteListVM.activate()
    } else {
      this.$selectedVoc.value = this.$vocs.value.length > 0 ? this.$vocs.value[0] : undefined
    }
  }
}