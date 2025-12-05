import { RXObservableValue } from "flinker"

import { Path } from "../../../app/Utils"
import { Lang, Vocabulary } from "../../../domain/DomainModel"
import { InputBufferController } from "../../controls/Input"
import { DertutorContext } from "../../DertutorContext"
import { ViewModel } from "../ViewModel"
import { globalContext } from "../../../App"

export class VocListVM extends ViewModel {
  readonly $vocs = new RXObservableValue<Array<Vocabulary>>([])
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
    this.actionsList.add('<Left>', 'Select prev vocabulary', () => this.moveCursor(-1))

    this.actionsList.add('n', 'New vocabulary (ADMIN)', () => this.createVoc())
    this.actionsList.add('r', 'Rename vocabulary (ADMIN)', () => this.renameVoc())
    this.actionsList.add(':d<CR>', 'Delete vocabulary (ADMIN)', () => this.deleteVoc())
    this.actionsList.add('q', 'Quit', () => this.quit())

    this.actionsList.add('<CR>', 'Go [Enter]', () => this.applySelection())
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

  private createVoc() {
    if (this.$mode.value === 'explore') {
      this.bufferController.$buffer.value = ''
      this.$mode.value = 'create'
    }
  }

  private renameVoc() {
    if (!this.ctx.$selectedVoc.value) return
    if (this.$mode.value !== 'explore') return
    this.bufferController.$buffer.value = this.ctx.$selectedVoc.value.name
    this.$mode.value = 'rename'
  }

  private quit() {
    this.ctx.navigate('/')
    this.ctx.langListVM.activate()
    this.ctx.$selectedVoc.value = undefined
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
    const parent = this.ctx.$selectedLang.value
    const title = this.bufferController.$buffer.value.trim()
    if (parent && title) {
      const v = parent.createVoc(title)
      globalContext.server.createVocabulary(v).pipe()
        .onReceive((data: any[]) => {
          console.log('VocListVM:applyInput, creating voc, result: ', data)
          v.deserialize(data)
          if (v.isDamaged) {
            this.ctx.$msg.value = { level: 'warning', text: 'Created vocabulary is demaged' }
          } else {
            parent.add(v)
            this.$vocs.value = this.ctx.$selectedLang.value?.vocabularies ? [...this.ctx.$selectedLang.value.vocabularies] : []
            this.ctx.$selectedVoc.value = v
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
    if (!this.ctx.$selectedVoc.value) return
    const newName = this.bufferController.$buffer.value.trim()
    const voc = this.ctx.$selectedVoc.value
    if (newName && newName === voc?.name) {
      this.ctx.$msg.value = { level: 'info', text: 'No changes' }
      return
    }

    globalContext.server.renameVocabulary(voc.id, newName).pipe()
      .onReceive((data: any[]) => {
        console.log('VocListVM:applyInput, renaming voc, result: ', data)
        voc.deserialize(data)
        if (voc.isDamaged) {
          this.ctx.$msg.value = { level: 'warning', text: 'Renamed vocabulary is demaged' }
        } else {
          this.ctx.$msg.value = { level: 'warning', text: 'renamed' }
          this.$vocs.value = this.ctx.$selectedLang.value?.vocabularies ? [...this.ctx.$selectedLang.value.vocabularies] : []
        }
      })
      .onError(e => {
        const msg = e.message.indexOf('duplicate key') ? 'Note already exists' : e.message
        this.ctx.$msg.value = { level: 'error', text: msg }
      })
      .subscribe()
  }

  private deleteVoc() {
    if (this.$mode.value !== 'explore') return
    if (!this.ctx.$selectedVoc.value) return
    const voc = this.ctx.$selectedVoc.value
    globalContext.server.deleteVocabulary(voc.id).pipe()
      .onReceive(_ => {
        console.log('VocListVM:deleteNote complete')
        this.ctx.$msg.value = { level: 'info', text: 'deleted' }
        this.moveCursor(1)
        if (this.ctx.$selectedVoc.value === voc)
          this.moveCursor(-1)

        this.ctx.$selectedLang.value?.remove(voc)
        this.$vocs.value = this.ctx.$selectedLang.value?.vocabularies ? [...this.ctx.$selectedLang.value.vocabularies] : []
      })
      .onError(e => {
        this.ctx.$msg.value = { level: 'error', text: e.message }
      })
      .subscribe()
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