import { observer, p, vstack } from "flinker-dom"
import { theme } from "../../ThemeManager"
import { FontFamily } from "../../controls/Font"
import { globalContext } from "../../../App"

export const ServerConnectionView = () => {
  return observer(globalContext.$mode)
    .onReceive(mode => {
      return mode === globalContext.connection && vstack()
        .react(s => {
          s.position = 'fixed'
          s.width = '100vw'
          s.height = '100vh'
          s.mouseEnabled = false
        }).children(() => {
          p()
            .observe(globalContext.connection.$logs)
            .react(s => {
              s.fontFamily = FontFamily.MONO
              s.text = globalContext.connection.$logs.value
              s.textColor = theme().white
              s.fontSize = '16px'
              s.padding = '20px'
              s.whiteSpace = 'pre'
              s.height = '100%'
            })
        })
    })
}