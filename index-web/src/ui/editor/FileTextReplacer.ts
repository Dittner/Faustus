import { RXObservableValue } from "flinker"
import { div, input, p, spacer, StackProps, vstack } from "flinker-dom"
import { IndexContext } from "../../app/IndexContext"
import { theme } from "../../app/ThemeManager"
import { RedBtn } from "../controls/Button"
import { FontFamily } from "../controls/Font"

export const FileTextReplacer = () => {
  const editor = IndexContext.self.editor
  return vstack()
    .react(s => {
      s.width = '100%'
      s.height = '100%'
      s.halign = 'left'
      s.valign = 'top'
      s.gap = '15px'
      s.padding = '40px'
    }).children(() => {

      TextInput(editor.$replaceSubstring)
        .react(s => {
          s.title = 'Text substring (RegExp):'
          s.maxWidth = '400px'
        })

      TextInput(editor.$replaceWith)
        .react(s => {
          s.title = 'Replace with (RegExp):'
          s.maxWidth = '400px'
        })

      RedBtn()
        .react(s => {
          s.text = 'Replace'
          s.paddingVertical = '10px'
          s.cornerRadius = '5px'
        })
        .onClick(() => editor.replaceWith())

      spacer().react(s => s.height = '50px')

      div()
        .react(s => {
          s.fontSize = theme().defFontSize
          s.fontFamily = FontFamily.APP
          s.textColor = theme().text
        })
        .children(() => {
          p().react(s => s.text = 'E.g.')
          p().react(s => s.text = 'Substring: (colo)(r)')
          p().react(s => s.text = 'Replace with: $1u$2')
          p().react(s => s.text = 'Result: colour')
        })
    })
}

export interface TextInputProps extends StackProps {
  title?: string
}

export const TextInput = (inputBinding: RXObservableValue<string>) => {
  const $state = new RXObservableValue({} as TextInputProps)
  return vstack<TextInputProps>()
    .propsDidChange(props => $state.value = props)
    .react(s => {
      s.gap = '0px'
    })
    .children(() => {
      p()
        .observe($state)
        .react(s => {
          s.fontFamily = FontFamily.APP
          s.text = $state.value.title ?? 'Title'
          s.textColor = theme().text
        })

      input()
        .bind(inputBinding)
        .react(s => {
          s.type = 'text'
          s.width = '100%'
          s.height = '40px'
          s.fontFamily = FontFamily.APP
          s.fontSize = theme().defFontSize
          s.textColor = theme().h1
          s.bgColor = theme().text + '10'
          s.padding = '10px'
          s.autoCorrect = 'off'
          s.autoComplete = 'off'
          s.borderBottom = ['1px', 'solid', theme().violet + '50']
        })
        .whenFocused(s => {
          s.borderBottom = ['1px', 'solid', theme().red]
        })
    })
}