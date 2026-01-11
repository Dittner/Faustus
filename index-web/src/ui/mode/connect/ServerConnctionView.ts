import { observer, p, vstack } from "flinker-dom"
import { IndexContext } from "../../IndexContext"
import { theme } from "../../theme/ThemeManager"
import { FontFamily } from "../../controls/Font"

export const ServerConnectionView = () => {
  const ctx = IndexContext.self

  return observer(ctx.$mode)
    .onReceive(mode => {
      return mode === ctx.connection && vstack()
        .react(s => {
          s.position = 'fixed'
          s.width = '100vw'
          s.height = '100vh'
          s.mouseEnabled = false
        }).children(() => {
          p()
            .observe(ctx.connection.$logs)
            .react(s => {
              s.fontFamily = FontFamily.MONO
              s.text = ctx.connection.$logs.value
              s.textColor = theme().white
              s.fontSize = '16px'
              s.padding = '20px'
              s.whiteSpace = 'pre'
              s.height = '100%'
            })
        })
    })
}