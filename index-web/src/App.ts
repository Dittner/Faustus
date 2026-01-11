import { div } from "flinker-dom"
import { p, span, vlist } from "flinker-dom"
import { ServerConnectionView } from "./ui/mode/connect/ServerConnctionView"
import { FileExplorerView } from "./ui/mode/explore/FileExplorerView"
import { FileView } from "./ui/mode/read/FileView"
import { FileSearchView } from "./ui/mode/search/FileSearchView"
import { GlobalContext } from "./app/GlobalContext"
import { IndexContext } from "./ui/IndexContext"
import { FontFamily } from "./ui/controls/Font"
import { theme } from "./ui/theme/ThemeManager"
import { Action } from "./ui/mode/Action"

export const globalContext = GlobalContext.init()
IndexContext.init()

export function App() {
  return div()
    .react(s => {
      s.width = '100vw'
    })
    .children(() => {
      ServerConnectionView()
      FileExplorerView()
      FileView()
      FileSearchView()

      MessangerView()
      ActionsHelpView()
    })
}

const ActionsHelpView = () => {
  const ctx = IndexContext.self
  return vlist<Action>()
    .observe(ctx.$mode.pipe().skipNullable().flatMap(vm => vm.$showActions).fork())
    .observe(ctx.$mode, 'recreateChildren')
    .react(s => {
      const layout = globalContext.app.$layout.value
      s.visible = ctx.$mode.value.$showActions.value ?? false
      s.position = 'fixed'
      s.right = '0'
      s.top = '0'
      s.width = '400px'
      s.height = window.innerHeight - globalContext.app.$layout.value.statusBarHeight + 'px'
      s.fontFamily = FontFamily.MONO
      s.fontSize = theme().defMenuFontSize
      s.paddingTop = layout.navBarHeight + 'px'
      s.paddingBottom = layout.statusBarHeight + 'px'
      s.bgColor = theme().appBg
      s.borderLeft = '1px solid ' + theme().text + '20'
    })
    .items(() => ctx.$mode.value.actionsList.actions)
    .itemHash(a => a.cmd)
    .itemRenderer(ActionInfoView)
}

const ActionInfoView = (a: Action) => {
  return p()
    .react(s => {
      s.width = '100%'
    }).children(() => {
      span().react(s => {
        s.display = 'inline-block'
        s.text = a.cmd
        s.textColor = theme().accent
        s.paddingHorizontal = '20px'
        s.width = '150px'
        s.whiteSpace = 'nowrap'
        s.textAlign = 'right'
      })

      span()
        .react(s => {
          s.text = a.desc
          s.textColor = theme().header
          s.width = '100%'
          //s.whiteSpace = 'pre'
          s.paddingHorizontal = '20px'
        })
    })
}

const MessangerView = () => {
  const ctx = IndexContext.self
  return p()
    .observe(ctx.$msg)
    .react(s => {
      const msg = ctx.$msg.value
      s.visible = msg !== undefined
      s.position = 'fixed'
      s.bottom = '0'
      s.width = '100%'
      s.fontFamily = FontFamily.MONO
      s.fontSize = theme().defMenuFontSize
      s.text = msg?.text ?? ''
      s.textAlign = 'right'
      //s.bgColor = theme().appBg
      s.paddingHorizontal = '5px'
      s.whiteSpace = 'nowrap'

      if (msg?.level === 'error')
        s.textColor = theme().red
      else if (msg?.level === 'warning')
        s.textColor = theme().warn
      else
        s.textColor = theme().id === 'light' ? theme().black : theme().white
    })
}
