import { RXObservableValue } from "flinker"

import { globalContext } from "../../../App"
import { DertutorContext } from "../../../DertutorContext"
import { ViewModel } from "../ViewModel"
import { ILang } from "../../../domain/DomainModel"

export class LangListVM extends ViewModel {
  readonly $langs = new RXObservableValue<ILang[]>([])
  readonly $selectedLang = new RXObservableValue<ILang | undefined>(undefined)

  constructor(ctx: DertutorContext) {
    super('langs', ctx)
    this.addKeybindings()
    this.$selectedLang.pipe().onReceive(_ => this.showSelectedLangIndex())
  }

  private showSelectedLangIndex() {
    const lang = this.$selectedLang.value
    if (lang) {
      const index = this.$langs.value.findIndex(child => child.id === lang.id)
      this.ctx.$msg.value = { 'text': index != -1 ? `${index + 1}:${this.$langs.value.length}` : '', 'level': 'info' }
    }
  }

  private addKeybindings() {
    this.actionsList.add('g', 'Select first langugage', () => this.moveCursorToTheFirst())
    this.actionsList.add('G', 'Select last langugage', () => this.moveCursorToTheLast())

    this.actionsList.add('<Right>', 'Select next langugage', () => this.moveCursor(1))
    this.actionsList.add('<Down>', 'Select next langugage', () => this.moveCursor(1))
    this.actionsList.add('<Left>', 'Select prev langugage', () => this.moveCursor(-1))
    this.actionsList.add('<Up>', 'Select prev langugage', () => this.moveCursor(-1))

    this.actionsList.add('<CR>', 'Go [Enter]', () => this.applySelection())
  }

  private moveCursor(step: number) {
    const children = this.$langs.value

    for (let i = 0; i < children.length; i++) {
      if (this.$selectedLang.value === children[i]) {
        if ((i + step) >= 0 && (i + step) < children.length)
          this.$selectedLang.value = children[i + step]
        break
      }
    }
  }

  private moveCursorToTheLast() {
    const count = this.$langs.value.length
    this.$selectedLang.value = count > 0 ? this.$langs.value[count - 1] : undefined
  }

  private moveCursorToTheFirst() {
    this.$selectedLang.value = this.$langs.value.length > 0 ? this.$langs.value[0] : undefined
  }

  applySelection() {
    if (this.$selectedLang.value) {
      globalContext.navigator.navigateTo({ langCode: this.$selectedLang.value.code })
      this.ctx.vocListVM.activate()
    }
  }

  /*
  *
  * ACTIVATE
  *
  */

  override activate(): void {
    super.activate()
    if (this.$langs.value.length === 0)
      this.loadAllLangs()
    else
      this.selectFromUrl()
    
    this.showSelectedLangIndex()
  }

  private async loadAllLangs() {
    console.log('LangListVM:loadAllLangs')
    this.ctx.$msg.value = { text: 'Loading...', level: 'info' }
    globalContext.server.loadAllLangs().pipe()
      .onReceive(data => {
        console.log('LangListVM:loadAllLangs, complete, data: ', data)
        this.ctx.$allLangs.value = data ?? []
        this.$langs.value = data ?? []
        this.selectFromUrl()
      })
      .onError(err => {
        this.ctx.$msg.value = { text: err.message, level: 'error' }
        this.ctx.$allLangs.value = []
      })
  }

  private selectFromUrl() {
    const langCode = globalContext.navigator.$keys.value.langCode
    const lang = this.$langs.value.find(l => l.code === langCode)
    if (lang) {
      this.$selectedLang.value = lang
      this.ctx.vocListVM.activate()
    } else {
      this.$selectedLang.value = this.$langs.value.length > 0 ? this.$langs.value[0] : undefined
    }
  }
}