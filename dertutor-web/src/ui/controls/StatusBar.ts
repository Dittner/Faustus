import { hstack, span } from "flinker-dom"
import { FontFamily } from "./Font"
import { theme } from "../theme/ThemeManager"

export const StatusBar = () => {
  return hstack()
    .react(s => {
      s.fontFamily = FontFamily.MONO
      s.fontSize = theme().defMenuFontSize
      s.gap = '10px'
      s.width = '100%'
      s.height = theme().statusBarHeight + 'px'
      s.valign = 'center'
      s.bgColor = theme().statusBg + '88'
      s.blur = '5px'
    })
}

export const StatusBarModeName = () => {
  return span()
    .react(s => {
      s.fontFamily = 'inherit'
      s.fontSize = 'inherit'
      s.paddingHorizontal = '20px'
      s.lineHeight = theme().statusBarHeight + 'px'
      s.height = theme().statusBarHeight + 'px'
      s.bgColor = theme().statusFg
      s.textColor = theme().statusBg
      s.whiteSpace = 'nowrap'
    })
}