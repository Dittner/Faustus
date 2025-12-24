import { RXObservableValue } from "flinker"

import { DerTutorContext } from "../../../DerTutorContext"
import { ViewModel } from "../ViewModel"
import { ILang } from "../../../domain/DomainModel"
import { Interactor } from "../Interactor"
import { UrlKeys } from "../../../app/URLNavigator"
import { globalContext } from "../../../App"

export interface LangListState {
  allLangs?: ILang[]
  lang?: ILang
}

export class LangListVM extends ViewModel<LangListState> {
  readonly $langs = new RXObservableValue<ILang[]>([])
  readonly $selectedLang = new RXObservableValue<ILang | undefined>(undefined)

  constructor(ctx: DerTutorContext) {
    const interactor = new LangListInteractor(ctx)
    super('langs', ctx, interactor)
    this.addKeybindings()
    this.$selectedLang.pipe().onReceive(_ => this.showSelectedLangIndex())
  }

  protected override stateDidChange(state: LangListState) {
    if (!this.activate) return

    this.$langs.value = state.allLangs ?? []
    this.$selectedLang.value = state.lang
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
      this.navigator.navigateTo({ langCode: this.$selectedLang.value.code })
    }
  }
}

class LangListInteractor extends Interactor<LangListState> {
  constructor(ctx: DerTutorContext) {
    super(ctx)
    console.log('new LangListInteractor')
  }

  override async load(state: LangListState, keys: UrlKeys) {
    await this.loadLangs(state, keys)
    await this.chooseLang(state, keys)
  }

  private async loadLangs(state: LangListState, keys: UrlKeys) {
    if (this.ctx.$allLangs.value.length === 0)
      this.ctx.$allLangs.value = await globalContext.server.loadAllLangs().asAwaitable
    state.allLangs = this.ctx.$allLangs.value
  }

  private async chooseLang(state: LangListState, keys: UrlKeys) {
    if (!state.allLangs || state.allLangs.length === 0) return

    if (keys.langCode) state.lang = state.allLangs.find(l => l.code === keys.langCode)
    else state.lang = state.allLangs[0]
  }
}