import { RXObservableValue } from "flinker"

import { Path } from "../../../app/Utils"
import { Lang, Vocabulary } from "../../../domain/DomainModel"
import { InputBufferController } from "../../controls/Input"
import { DertutorContext } from "../../DertutorContext"
import { ViewModel } from "../ViewModel"

const PATH_ALLOWED_SYMBOLS: Set<string> = new Set('_0123456789/abcdefghijklmnopqrstuvwxyz'.split(''))

export class VocListVM extends ViewModel {
  readonly $vocs = new RXObservableValue<Array<Vocabulary>>([])
  readonly $mode = new RXObservableValue<'explore' | 'create' | 'rename'>('explore')
  readonly bufferController = new InputBufferController(PATH_ALLOWED_SYMBOLS)

  constructor(ctx: DertutorContext) {
    super('vocs', ctx)
    this.addKeybindings()
  }

  private addKeybindings() {
    this.actionsList.add('g', 'Select first dictionary', () => this.moveCursorToTheFirst())
    this.actionsList.add('G', 'Select last dictionary', () => this.moveCursorToTheLast())

    this.actionsList.add('j', 'Select next dictionary', () => this.moveCursor(1))
    this.actionsList.add('k', 'Select prev dictionary', () => this.moveCursor(-1))

    this.actionsList.add('<Right>', 'Select next dictionary', () => this.moveCursor(1))
    this.actionsList.add('<Left>', 'Select prev dictionary', () => this.moveCursor(-1))

    this.actionsList.add('q', 'Quit', () => this.quit())

    this.actionsList.add('<CR>', 'Go [Enter]', () => this.applySelection())

    //this.actionsList.add(':n<CR>', 'New file', () => this.newFile())
    //this.actionsList.add(':d<CR>', 'Delete file', () => this.deleteFile())
    //this.actionsList.add(':r<CR>', 'Rename file', () => this.renameFile())
    //this.actionsList.add('/', 'Search file', () => this.searchFile())
  }

  private moveCursor(step: number) {
    const children = this.ctx.$selectedLang.value?.vocabularies ?? []

    for (let i = 0; i < children.length; i++) {
      if (this.ctx.$selectedVoc.value === children[i]) {
        if ((i + step) >= 0 && (i + step) < children.length)
          this.ctx.$selectedVoc.value = children[i + step]
        break
      }
    }
  }

  private moveCursorToTheLast() {
    const vocabularies = this.ctx.$selectedLang.value?.vocabularies ?? []
    this.ctx.$selectedVoc.value = vocabularies.length > 0 ? vocabularies[vocabularies.length - 1] : undefined
  }

  private moveCursorToTheFirst() {
    const vocabularies = this.ctx.$selectedLang.value?.vocabularies ?? []
    this.ctx.$selectedVoc.value = vocabularies.length > 0 ? vocabularies[0] : undefined
  }

  private applySelection() {
    if (this.ctx.$selectedVoc.value) {
      this.ctx.navigate(this.ctx.$selectedVoc.value.path)
      this.ctx.noteListVM.activate()
    }
  }

  private quit() {
    this.ctx.navigate('/')
    this.ctx.langListVM.activate()
    this.ctx.$selectedVoc.value = undefined
  }

  onKeyDown(e: KeyboardEvent): void {
    if (this.$mode.value === 'explore') {
      super.onKeyDown(e)
    } else {
      const code = this.actionsList.parser.keyToCode(e)
      if (code === '<ESC>') {
        this.$mode.value = 'explore'
      } else if (code === '<CR>') {
        //this.applyInput()
      } else {
        this.bufferController.onKeyDown(e)
      }
    }
  }

  /*
  *
  * ACTIVATE
  *
  */

  override activate(): void {
    super.activate()
    if (this.ctx.$selectedLang.value) {
      if (this.ctx.$selectedLang.value.vocabulariesLoaded) {
        this.$vocs.value = this.ctx.$selectedLang.value.vocabularies
        this.parseLocation(this.ctx.$selectedLang.value)
      }
      else {
        this.loadVocabularies(this.ctx.$selectedLang.value)
      }
    } else {
      this.ctx.langListVM.activate()
    }
  }

  private loadVocabularies(l: Lang) {
    console.log('VocListVM:loadVocabularies')
    this.ctx.$msg.value = { text: 'Loading...', level: 'info' }
    l.loadVocabularies().pipe()
      .onReceive(_ => {
        this.ctx.$msg.value = undefined
        this.$vocs.value = l.vocabularies
        this.parseLocation(l)
      })
      .onError(e => {
        this.ctx.$msg.value = { text: e.message, level: 'error' }
      })
      .subscribe()
  }


  private parseLocation(l: Lang) {
    const keys = Path.parseAdressBar()
    let selectedVoc: Vocabulary | undefined

    for (const v of l.vocabularies)
      if (v.code === keys.vocCode) {
        selectedVoc = v
        break
      }

    if (selectedVoc) {
      this.ctx.$selectedVoc.value = selectedVoc
      this.ctx.noteListVM.activate()
    } else if (!this.ctx.$selectedVoc.value) {
      this.ctx.$selectedVoc.value = l.vocabularies.length > 0 ? l.vocabularies[0] : undefined
    }
  }
}