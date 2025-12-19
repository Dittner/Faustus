import { span } from "flinker-dom"
import { theme } from "../theme/ThemeManager"


export const StatusBarModeName = () => {
  return span()
    .react(s => {
      s.fontFamily = 'inherit'
      s.fontSize = 'inherit'
      s.paddingHorizontal = '20px'
      s.lineHeight = theme().statusBarHeight + 'px'
      s.height = theme().statusBarHeight + 'px'
      s.bgColor = theme().accent
      s.textColor = theme().appBg
      s.whiteSpace = 'nowrap'
    })
}