import { hstack, span } from "flinker-dom"
import { FontFamily } from "./Font"
import { CMD_LINE_HEIGHT } from "../IndexView"
import { theme } from "../theme/ThemeManager"
import { OperatingModeClass } from "../mode/OperatingMode"

export const StatusBar = () => {
  return hstack()
    .react(s => {
      s.fontFamily = FontFamily.MONO
      s.fontSize = '18px'
      s.gap = '10px'
      s.width = '100%'
      s.height = CMD_LINE_HEIGHT + 'px'
      s.valign = 'center'
      s.bgColor = theme().statusBg + '88'
      s.blur = '5px'
    })
}

export const StatusBarModeName = () => {
  return span()
    .react(s => {
      s.paddingHorizontal = '20px'
      s.lineHeight = CMD_LINE_HEIGHT + 'px'
      s.height = CMD_LINE_HEIGHT + 'px'
      s.bgColor = theme().statusFg
      s.textColor = theme().statusBg
    })
}

export const StatusBarActionBuffer = (mode: OperatingModeClass) => {
  return span()
    .observe(mode.$cmdBuffer)
    .react(s => {
      const fg = theme().id === 'light' ? theme().statusFg : theme().header
      const bg = theme().id === 'light' ? theme().statusBg : theme().statusBg
      const isBufferEmpty = mode.$cmdBuffer.value.length > 0
      s.lineHeight = CMD_LINE_HEIGHT + 'px'
      s.height = CMD_LINE_HEIGHT + 'px'
      s.textColor = isBufferEmpty ? bg : fg
      s.bgColor = isBufferEmpty ? fg : bg
      s.whiteSpace = 'nowrap'
    })
}