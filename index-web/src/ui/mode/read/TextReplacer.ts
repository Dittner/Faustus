import { div, hstack, p, spacer, vstack } from "flinker-dom"
import { IndexContext } from "../../IndexContext"
import { theme } from "../../theme/ThemeManager"
import { log } from "../../../app/Logger"
import { TextInput } from "../../controls/Input"
import { RedBtn } from "../../controls/Button"
import { RXObservableValue } from "flinker"
import { FontFamily } from "../../controls/Font"
import { TextFile } from "../../../domain/DomainModel"

export class TextReplacer {
  private $buffer: RXObservableValue<string>
  readonly $replaceFrom = new RXObservableValue('')
  readonly $replaceTo = new RXObservableValue('')

  constructor($buffer: RXObservableValue<string>) {
    this.$buffer = $buffer
  }

  replaceAll() {
    const isRegExp = this.$replaceFrom.value.startsWith('/') && this.$replaceFrom.value.endsWith('/')
    let res = ''
    if (isRegExp) {
      const valueFrom = new RegExp(this.$replaceFrom.value.slice(1, this.$replaceFrom.value.length - 1), 'g')
      log('RegExp, valueFrom:', valueFrom)
      const valueTo = this.$replaceTo.value
      res = this.$buffer.value.replace(valueFrom, valueTo)
      res = res.replace(/\\n/g, '\n')
    } else {
      res = this.$buffer.value.replaceAll(this.$replaceFrom.value, this.$replaceTo.value)
    }

    this.$buffer.value = res
  }
}

export const TextReplacerView = (file: TextFile) => {
  log('new TextReplacerView')
  const reader = IndexContext.self.reader

  return vstack()
    .react(s => {
      s.width = '100%'
      s.gap = '50px'
      s.valign = 'top'
      s.halign = 'left'
    })
    .children(() => {
      hstack()
        .react(s => {
          s.width = '100%'
          s.gap = '10px'
          s.valign = 'bottom'
          s.halign = 'left'
        })
        .children(() => {
          TextInput(reader.textReplacer.$replaceFrom).react(s => {
            s.title = 'Text substring (RegExp):'
            s.textColor = theme().accent
          })

          TextInput(reader.textReplacer.$replaceTo).react(s => {
            s.title = 'Replace with (RegExp):'
            s.textColor = theme().accent
          })

          spacer()

          RedBtn()
            .observe(reader.textReplacer.$replaceFrom.pipe().map(value => value.length > 0).removeDuplicates().fork())
            .react(s => {
              s.isDisabled = reader.textReplacer.$replaceFrom.value.length === 0
              s.text = 'Replace'
            })
            .onClick(() => reader.textReplacer.replaceAll())
        })

      div()
        .react(s => {
          s.fontSize = theme().defFontSize
          s.fontFamily = FontFamily.APP
          s.textColor = theme().text50
        })
        .children(() => {
          p().react(s => s.text = 'Example 1:')
          p().react(s => s.text = 'Substring: /(colo)(r)/')
          p().react(s => s.text = 'Replace with: $1u$2')
          p().react(s => s.text = 'Result: colour')

          spacer().react(s => {
            s.width = '200px'
            s.height = '2px'
            s.bgColor = theme().text50
            s.marginVertical = '20px'
          })
          p().react(s => s.text = 'Example 2:')
          p().react(s => s.text = 'Substring: /\\n\\n\\n/')
          p().react(s => s.text = 'Replace with: \\n\\n')
        })

      RedBtn()
        .observe(file)
        .react(s => {
          s.isDisabled = !file.hasChanges
          s.text = 'Discard changes'
        })
        .onClick(() => {
          file.discardChanges()
          reader.$inputBuffer.value = file.serialize().text
        })
    })
}