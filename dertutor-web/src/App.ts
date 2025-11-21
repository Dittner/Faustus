import { p } from "flinker-dom"
import { GlobalContext } from "./app/GlobalContext"
import { DertutorContext } from "./ui/DertutorContext"
import { MainView } from "./ui/MainView"
import { FontFamily } from "./ui/controls/Font"
import { theme, themeManager } from "./ui/theme/ThemeManager"

export const globalContext = GlobalContext.init()

export function App() {
  console.log('new App')
  DertutorContext.init()

  return MainView()
    .observe(themeManager.$theme, 'affectsProps', 'affectsChildrenProps')
    .react(s => {
      s.width = '100%'
      s.minHeight = '100vh'
    })
}

export const MessangerView = () => {
  const ctx = DertutorContext.self
  return p()
    .observe(ctx.$msg)
    .react(s => {
      const msg = ctx.$msg.value
      s.visible = msg !== undefined
      s.fontFamily = FontFamily.MONO
      s.fontSize = '18px'
      s.text = msg?.text ?? ''
      //s.bgColor = theme().appBg
      s.paddingHorizontal = '2px'
      s.whiteSpace = 'nowrap'

      if (msg?.level === 'error')
        s.textColor = theme().red
      else if (msg?.level === 'warning')
        s.textColor = theme().warn
      else
        s.textColor = theme().id === 'light' ? theme().black : theme().white
    })
}