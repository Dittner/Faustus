import { RXObservableValue } from "flinker"

import { globalContext } from "../../../App"
import { Path } from "../../../app/Utils"
import { Lang } from "../../../domain/DomainModel"
import { DertutorContext } from "../../DertutorContext"
import { ViewModel } from "../ViewModel"

export class LangListVM extends ViewModel {
  readonly $allLangs = new RXObservableValue<Array<Lang>>([])

  constructor(ctx: DertutorContext) {
    super('langs', ctx)
    this.addKeybindings()
  }

  private addKeybindings() {
    this.actionsList.add('g', 'Select first langugage', () => this.moveCursorToTheFirst())
    this.actionsList.add('G', 'Select last langugage', () => this.moveCursorToTheLast())

    this.actionsList.add('<Right>', 'Select next langugage', () => this.moveCursor(1))
    this.actionsList.add('<Left>', 'Select prev langugage', () => this.moveCursor(-1))

    this.actionsList.add('<CR>', 'Go [Enter]', () => this.applySelection())
  }

  private moveCursor(step: number) {
    const children = this.$allLangs.value

    for (let i = 0; i < children.length; i++) {
      if (this.ctx.$selectedLang.value === children[i]) {
        if ((i + step) >= 0 && (i + step) < children.length)
          this.ctx.$selectedLang.value = children[i + step]
        break
      }
    }
  }

  private moveCursorToTheLast() {
    const count = this.$allLangs.value.length
    this.ctx.$selectedLang.value = count > 0 ? this.$allLangs.value[count - 1] : undefined
  }

  private moveCursorToTheFirst() {
    this.ctx.$selectedLang.value = this.$allLangs.value.length > 0 ? this.$allLangs.value[0] : undefined
  }

  private applySelection() {
    if (this.ctx.$selectedLang.value) {
      this.ctx.navigate(this.ctx.$selectedLang.value.path)
      this.ctx.vocListVM.activate()
    }
  }

  /*
  *
  * ACTIVATE
  *
  */

  private allLangsLoaded = false
  override activate(): void {
    super.activate()
    if (this.allLangsLoaded) {
      this.parseLocation()
    } else {
      this.allLangsLoaded = true
      this.loadAllLangs()
    }
  }

  private loadAllLangs() {
    console.log('LangListVM:loadAllLangs')
    this.ctx.$msg.value = { text: 'Loading...', level: 'info' }
    globalContext.server.loadAllLangs().pipe()
      .onReceive((data: any[]) => {
        this.ctx.$msg.value = undefined
        console.log('LangListVM:loadAllLangs, complete, data: ', data)
        this.$allLangs.value = data.map(d => {
          const l = new Lang()
          l.deserialize(d)
          return l
        }).filter(l => !l.isDamaged)
        this.parseLocation()
      })
      .onError(e => {
        this.ctx.$msg.value = { text: e.message, level: 'error' }
      })
      .subscribe()
  }


  private parseLocation() {
    const keys = Path.parseAdressBar()
    let selectedLang: Lang | undefined

    for (const lang of this.$allLangs.value)
      if (lang.code === keys.langCode) {
        selectedLang = lang
        break
      }

    if (selectedLang) {
      this.ctx.$selectedLang.value = selectedLang
      this.ctx.vocListVM.activate()
    } else if (!this.ctx.$selectedLang.value) {
      this.ctx.$selectedLang.value = this.$allLangs.value.length > 0 ? this.$allLangs.value[0] : undefined
    }
  }
}