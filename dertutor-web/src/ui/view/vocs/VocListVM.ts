import { RXObservableValue } from "flinker"

import { InputBufferController } from "../../controls/Input"
import { DerTutorContext } from "../../../DerTutorContext"
import { ViewModel } from "../ViewModel"
import { DomainService, ILang, IVoc } from "../../../domain/DomainModel"
import { CreateVocSchema, DeleteVocSchema, RenameVocSchema } from "../../../backend/Schema"
import { UrlKeys } from "../../../app/URLNavigator"
import { globalContext } from "../../../App"
import { Interactor } from "../Interactor"

export interface VocListState {
  allLangs?: ILang[]
  lang?: ILang
  voc?: IVoc
}

export class VocListVM extends ViewModel<VocListState> {
  readonly $selectedLang = new RXObservableValue<ILang | undefined>(undefined)
  readonly $vocs = new RXObservableValue<IVoc[]>([])
  readonly $selectedVoc = new RXObservableValue<IVoc | undefined>(undefined)
  readonly $mode = new RXObservableValue<'explore' | 'create' | 'rename'>('explore')
  readonly bufferController = new InputBufferController()

  constructor(ctx: DerTutorContext) {
    const interactor = new VocListInteractor(ctx)
    super('vocs', ctx, interactor)
    this.addKeybindings()
    this.$selectedVoc.pipe().onReceive(_ => this.showSelectedVocIndex())
  }

  protected override stateDidChange(state: VocListState) {
    if (!this.activate) return

    this.$selectedLang.value = state.lang
    this.$selectedVoc.value = state.voc
    this.$vocs.value = state.lang?.vocs ?? []

    if (!state.lang) {
      this.navigator.navigateTo({})
    }
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

  applySelection() {
    if (this.$selectedLang.value && this.$selectedVoc.value) {
      this.navigator.navigateTo({ langCode: this.$selectedLang.value.code, vocCode: this.encodeName(this.$selectedVoc.value) })
    }
  }

  private encodeName(voc: IVoc) {
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
    this.navigator.navigateTo({})
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

      this.server.createVoc(schema).pipe()
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
      this.server.renameVoc(schema).pipe()
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
      this.server.deleteVoc(schema).pipe()
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

  private showSelectedVocIndex() {
    const lang = this.$selectedLang.value
    const voc = this.$selectedVoc.value
    if (lang && voc) {
      const index = lang.vocs.findIndex(child => child.id === voc.id)
      this.ctx.$msg.value = { 'text': index != -1 ? `${index + 1}:${lang.vocs.length}` : '', 'level': 'info' }
    }
  }
}


class VocListInteractor extends Interactor<VocListState> {
  constructor(ctx: DerTutorContext) {
    super(ctx)
    console.log('new VocListInteractor')
  }

  override async load(state: VocListState, keys: UrlKeys) {
    await this.loadLangs(state, keys)
    await this.chooseLang(state, keys)
    await this.chooseVoc(state, keys)
  }

  private async loadLangs(state: VocListState, keys: UrlKeys) {
    if (this.ctx.$allLangs.value.length === 0)
      this.ctx.$allLangs.value = await globalContext.server.loadAllLangs().asAwaitable
    state.allLangs = this.ctx.$allLangs.value
  }

  private async chooseLang(state: VocListState, keys: UrlKeys) {
    if (keys.langCode && state.allLangs)
      state.lang = state.allLangs.find(l => l.code === keys.langCode)
  }

  private async chooseVoc(state: VocListState, keys: UrlKeys) {
    if (!state.lang) return

    state.voc = state.lang.vocs.find(v => DomainService.encodeName(v.name) === keys.vocCode)
    if (!state.voc && state.lang.vocs.length > 0) state.voc = state.lang.vocs[0]
  }
}