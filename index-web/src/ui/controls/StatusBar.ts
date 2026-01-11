import { hstack, span } from "flinker-dom"
import { FontFamily } from "./Font"
import { theme } from "../theme/ThemeManager"
import { globalContext } from "../../App"

export const StatusBar = () => {
  return hstack()
    .react(s => {
      s.fontFamily = FontFamily.MONO
      s.fontSize = theme().defMenuFontSize
      s.gap = '10px'
      s.width = '100%'
      s.height = globalContext.app.$layout.value.statusBarHeight + 'px'
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
      s.lineHeight = globalContext.app.$layout.value.statusBarHeight + 'px'
      s.height = globalContext.app.$layout.value.statusBarHeight + 'px'
      s.bgColor = theme().statusFg
      s.textColor = theme().statusBg
      s.whiteSpace = 'nowrap'
    })
}