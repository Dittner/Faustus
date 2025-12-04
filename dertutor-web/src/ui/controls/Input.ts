import { RXObservableValue } from "flinker"
import { hstack, input, p, span, StackProps, vstack } from "flinker-dom"
import { theme } from "../theme/ThemeManager"
import { FontFamily } from "./Font"

export interface NumberProtocol {
  value: number
}

export interface InputProtocol {
  value: string;
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
          s.textColor = theme().header
          s.bgColor = theme().text + '10'
          s.padding = '10px'
          s.autoCorrect = 'off'
          s.autoComplete = 'off'
          s.borderBottom = ['1px', 'solid', theme().red + '50']
        })
        .whenFocused(s => {
          s.borderBottom = ['1px', 'solid', theme().red]
        })
    })
}


export class InputBufferController {
  readonly $buffer = new RXObservableValue('')
  readonly $cursorPos = new RXObservableValue(-1)
  readonly $title = new RXObservableValue('Title:')

  constructor() { }

  async pasteFromKeyboard() {
    const text = await navigator.clipboard.readText()
    if (text) {
      const i = this.$cursorPos.value === -1 ? this.$buffer.value.length : this.$cursorPos.value
      const t1 = this.$buffer.value.slice(0, i)
      const t2 = this.$buffer.value.slice(i)
      this.$buffer.value = t1 + text + t2
      this.$cursorPos.value = this.$cursorPos.value === -1 ? -1 : this.$cursorPos.value + text.length
    }
  }

  onKeyDown(e: KeyboardEvent) {
    if (e.key === 'Backspace') {
      if (this.$buffer.value.length > 0 && this.$cursorPos.value !== 0) {
        if (this.$cursorPos.value === -1)
          this.$buffer.value = this.$buffer.value.slice(0, -1)
        else {
          this.$buffer.value = this.$buffer.value.slice(0, this.$cursorPos.value - 1) + this.$buffer.value.slice(this.$cursorPos.value)
          this.$cursorPos.value--
        }
      }
    } else if (e.key === 'Delete') {
      if (this.$cursorPos.value > -1) {
        this.$buffer.value = this.$buffer.value.slice(0, this.$cursorPos.value) + this.$buffer.value.slice(this.$cursorPos.value + 1)
        if (this.$cursorPos.value >= this.$buffer.value.length)
          this.$cursorPos.value = -1
      }
    } else if (e.key === 'ArrowUp') {
      if (this.$buffer.value.length > 0)
        this.$cursorPos.value = 0
    } else if (e.key === 'ArrowDown') {
      this.$cursorPos.value = -1
    } else if (e.key === 'ArrowLeft') {
      if (this.$cursorPos.value === -1)
        this.$cursorPos.value = this.$buffer.value.length - 1
      else if (this.$cursorPos.value > 0)
        this.$cursorPos.value = this.$cursorPos.value - 1
    }
    else if (e.key === 'ArrowRight') {
      if (this.$cursorPos.value === this.$buffer.value.length - 1)
        this.$cursorPos.value = -1
      else if (this.$cursorPos.value !== -1 && this.$cursorPos.value < this.$buffer.value.length - 1)
        this.$cursorPos.value = this.$cursorPos.value + 1
    }
    else if (e.key.length === 1) {
      if (this.$cursorPos.value === -1)
        this.$buffer.value += e.key
      else {
        this.$buffer.value = this.$buffer.value.slice(0, this.$cursorPos.value) + e.key + this.$buffer.value.slice(this.$cursorPos.value)
        this.$cursorPos.value++
      }
    }
  }
}

export interface LineInputProps extends StackProps {
  title: string
}

export const LineInput = ($buffer: RXObservableValue<string>, $cursorPos: RXObservableValue<number>) => {
  const $sharedState = new RXObservableValue<LineInputProps>({ title: '' })
  const textColor = '#111111'
  return hstack<LineInputProps>()
    .react(s => {
      s.fontFamily = FontFamily.MONO
      s.gap = '0'
      s.width = '100%'
      s.fontSize = theme().defMenuFontSize
      s.valign = 'top'
      s.height = '100%'
      s.lineHeight = '1.9'
      s.paddingHorizontal = '20px'
      s.margin = '0'
      s.wrap = false
      s.whiteSpace = 'pre'
      s.textColor = textColor
      s.bgColor = theme().mark
    })
    .propsDidChange(props => $sharedState.value = props)
    .children(() => {

      span()
        .observe($sharedState)
        .react(s => {
          s.fontSize = 'inherit'
          s.text = $sharedState.value.title
          s.paddingRight = '5px'
        })

      span()
        .observe($buffer)
        .observe($cursorPos)
        .react(s => {
          const t = $buffer.value
          const i = $cursorPos.value
          s.fontSize = 'inherit'
          s.textColor = 'inherit'
          s.height = '100%'
          s.text = i === -1 ? t : t.slice(0, i)
        })

      span()
        .observe($buffer)
        .observe($cursorPos)
        .react(s => {
          const t = $buffer.value
          const i = $cursorPos.value
          s.fontSize = 'inherit'
          s.textColor = i === -1 ? textColor : theme().mark
          s.bgColor = textColor
          s.height = '100%'
          s.text = i === -1 ? ' ' : t.at(i)
        })

      span()
        .observe($buffer)
        .observe($cursorPos)
        .react(s => {
          const t = $buffer.value
          const i = $cursorPos.value
          s.fontSize = 'inherit'
          s.textColor = 'inherit'
          s.height = '100%'
          s.text = i === -1 ? '' : t.slice(i + 1)
        })
    })
}