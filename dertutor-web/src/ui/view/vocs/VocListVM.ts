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
  readonly $langs = new RXObservableValue<ILang[]>([])
  readonly $selectedLang = new RXObservableValue<ILang | undefined>(undefined)
  readonly $highlightedLang = new RXObservableValue<ILang | undefined>(undefined)
  readonly $highlightedVoc = new RXObservableValue<IVoc | undefined>(undefined)
  readonly $mode = new RXObservableValue<'explore' | 'create' | 'rename'>('explore')
  readonly bufferController = new InputBufferController()

  constructor(ctx: DerTutorContext) {
    const interactor = new VocListInteractor(ctx)
    super('vocs', ctx, interactor)
    this.addKeybindings()
    this.$highlightedVoc.pipe().onReceive(_ => this.showSelectedVocIndex())
  }

  protected override stateDidChange(state: VocListState) {
    if (!this.activate) return

    this.$langs.value = state.allLangs ?? []
    this.$selectedLang.value = state.lang
    this.$highlightedLang.value = state.lang ?? (state.allLangs && state.allLangs.length > 0 ? state.allLangs[0] : undefined)
    this.$highlightedVoc.value = state.voc ?? (state.lang && state.lang.vocs.length > 0 ? state.lang.vocs[0] : undefined)
  }

  private addKeybindings() {
    this.actionsList.add('g', 'Select first item', () => this.moveCursorToTheFirst())
    this.actionsList.add('G', 'Select last item', () => this.moveCursorToTheLast())

    this.actionsList.add('<Right>', 'Select next item', () => this.moveCursor(1))
    this.actionsList.add('<Down>', 'Select next item', () => this.moveCursor(1))
    this.actionsList.add('<Left>', 'Select prev item', () => this.moveCursor(-1))
    this.actionsList.add('<Up>', 'Select prev item', () => this.moveCursor(-1))

    this.actionsList.add('n', 'New vocabulary (ADMIN)', () => this.createVoc())
    this.actionsList.add('r', 'Rename vocabulary (ADMIN)', () => this.renameVoc())
    this.actionsList.add(':d<CR>', 'Delete vocabulary (ADMIN)', () => this.deleteVoc())
    this.actionsList.add('q', 'Quit', () => this.quit())

    this.actionsList.add('<CR>', 'Go [Enter]', () => this.applySelection())
    this.actionsList.add(':id<CR>', 'Print ID of the selected item', () => this.printID())
  }

  private moveCursor(step: number) {
    const selectedLang = this.$selectedLang.value
    if (selectedLang) {
      for (let i = 0; i < selectedLang.vocs.length; i++) {
        if (this.$highlightedVoc.value === selectedLang.vocs[i]) {
          if ((i + step) >= 0 && (i + step) < selectedLang.vocs.length)
            this.$highlightedVoc.value = selectedLang.vocs[i + step]
          break
        }
      }
    } else {
      const allLangs = this.$langs.value
      for (let i = 0; i < allLangs.length; i++) {
        if (this.$highlightedLang.value === allLangs[i]) {
          if ((i + step) >= 0 && (i + step) < allLangs.length)
            this.$highlightedLang.value = allLangs[i + step]
          break
        }
      }
    }
  }

  private moveCursorToTheLast() {
    const selectedLang = this.$selectedLang.value
    if (selectedLang) {
      this.$highlightedVoc.value = selectedLang.vocs.length > 0 ? selectedLang.vocs[selectedLang.vocs.length - 1] : undefined
    } else {
      this.$highlightedLang.value = this.$langs.value.length > 0 ? this.$langs.value[this.$langs.value.length - 1] : undefined
    }
  }

  private moveCursorToTheFirst() {
    const selectedLang = this.$selectedLang.value
    if (selectedLang) {
      this.$highlightedVoc.value = selectedLang.vocs.length > 0 ? selectedLang.vocs[0] : undefined
    } else {
      this.$highlightedLang.value = this.$langs.value.length > 0 ? this.$langs.value[0] : undefined
    }
  }

  applySelection() {
    if (this.$selectedLang.value && this.$highlightedVoc.value) {
      this.navigator.navigateTo({ langCode: this.$selectedLang.value.code, vocCode: this.encodeName(this.$highlightedVoc.value) })
    } else if (this.$highlightedLang.value) {
      this.$selectedLang.value = this.$highlightedLang.value
      this.$highlightedVoc.value = this.$highlightedLang.value.vocs.length > 0 ? this.$highlightedLang.value.vocs[0] : undefined
    }
  }

  private encodeName(voc: IVoc) {
    return DomainService.encodeName(voc.name)
  }

  private printID() {
    if (this.$highlightedVoc.value)
      this.ctx.$msg.value = { text: `ID=${this.$highlightedVoc.value}` }
    else if (this.$selectedLang.value)
      this.ctx.$msg.value = { text: `ID=${this.$selectedLang.value}` }
    else
      this.ctx.$msg.value = { text: 'Not selected' }
  }

  private createVoc() {
    if (this.$selectedLang.value) {
      if (this.$mode.value === 'explore') {
        this.bufferController.$buffer.value = ''
        this.$mode.value = 'create'
      }
    } else {
      this.ctx.$msg.value = { text: 'Language not selected' }
    }
  }

  private renameVoc() {
    if (!this.$highlightedVoc.value) return
    if (this.$mode.value !== 'explore') return
    this.bufferController.$buffer.value = this.$highlightedVoc.value.name
    this.$mode.value = 'rename'
  }

  private quit() {
    if (this.$selectedLang.value) {
      this.$highlightedVoc.value = undefined
      this.$highlightedLang.value = this.$selectedLang.value
      this.$selectedLang.value = undefined
    }
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
            lang.vocs.push(data)
            this.$selectedLang.value = undefined
            this.$selectedLang.value = lang
            this.$highlightedVoc.value = data
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
    const voc = this.$highlightedVoc.value

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
            this.ctx.$msg.value = { text: 'renamed' }
            const ind = lang.vocs.findIndex(v => v.id === voc.id)
            if (ind !== -1) {
              lang.vocs[ind] = { id: voc.id, lang_id: lang.id, name: data.name } as IVoc
              this.$selectedLang.value = undefined
              this.$selectedLang.value = lang
              this.$highlightedVoc.value = lang.vocs[ind]
            }
          } else {
            this.ctx.$msg.value = { text: 'Renamed vocabulary is demaged', level: 'warning' }
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
    const voc = this.$highlightedVoc.value
    if (lang && voc) {
      const schema = { id: voc.id } as DeleteVocSchema
      this.server.deleteVoc(schema).pipe()
        .onReceive(_ => {
          console.log('VocListVM:deleteNote complete')
          this.ctx.$msg.value = { level: 'info', text: 'deleted' }
          this.moveCursor(1)
          if (this.$highlightedVoc.value === voc)
            this.moveCursor(-1)

          const ind = lang.vocs.findIndex(v => v.id === voc.id)
          if (ind !== -1) {
            lang.vocs.splice(ind, 1)
            this.$selectedLang.value = undefined
            this.$selectedLang.value = lang
          }
        })
        .onError(e => {
          this.ctx.$msg.value = { level: 'error', text: e.message }
        })
        .subscribe()
    }
  }

  private showSelectedVocIndex() {
    const lang = this.$selectedLang.value
    const voc = this.$highlightedVoc.value
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
    if (state.allLangs && state.allLangs.length > 0 && keys.langCode)
      state.lang = state.allLangs.find(l => l.code === keys.langCode)
  }

  private async chooseVoc(state: VocListState, keys: UrlKeys) {
    if (state.lang && keys.vocCode)
      state.voc = state.lang.vocs.find(v => DomainService.encodeName(v.name) === keys.vocCode)
  }
}