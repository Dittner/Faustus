import { p, vstack } from "flinker-dom"
import { MessangerView } from "../../../App"
import { LayoutLayer } from "../../../app/Application"
import { FontFamily } from "../../controls/Font"
import { DertutorContext } from "../../../DertutorContext"
import { theme } from "../../theme/ThemeManager"

export const ServerConnectionView = () => {
  const ctx = DertutorContext.self
  const vm = ctx.connectionVM

  return vstack()
    .react(s => {
      s.position = 'fixed'
      s.width = '100vw'
      s.height = '100vh'
      s.paddingTop = theme().navBarHeight + 'px'
      s.layer = LayoutLayer.MODAL
      s.mouseEnabled = false
    }).children(() => {
      p()
        .observe(vm.$logs)

        .react(s => {
          s.fontFamily = FontFamily.MONO
          s.text = vm.$logs.value
          s.textColor = theme().accent
          s.fontSize = '16px'
          s.paddingHorizontal = '20px'
          s.whiteSpace = 'pre'
          s.height = '100%'
        })

      MessangerView()
    })
}