import { div, vstack } from "flinker-dom"
import { p, span, vlist } from "flinker-dom"
import { ServerConnectionView } from "./ui/mode/connect/ServerConnctionView"
import { FileExplorerView } from "./ui/mode/explore/FileExplorerView"
import { FileView } from "./ui/mode/read/FileView"
import { FileSearchView } from "./ui/mode/search/FileSearchView"
import { GlobalContext } from "./app/GlobalContext"
import { IndexContext } from "./ui/IndexContext"
import { FontFamily } from "./ui/controls/Font"
import { theme, themeManager } from "./ui/theme/ThemeManager"
import { Action } from "./ui/mode/Action"

export const globalContext = GlobalContext.init()
IndexContext.init()

export function App() {
  return div()
    .observe(themeManager.$theme, 'affectsProps', 'affectsChildrenProps')
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


const SHORTKEY_TEXT_WIDTH = '160px'
export const ActionsHelpView = () => {
  const ctx = IndexContext.self

  return div()
    .observe(ctx.$mode.pipe().skipNullable().flatMap(vm => vm.$showActions).fork())
    .react(s => {
      const vm = ctx.$mode.value
      const layout = globalContext.app.$layout.value
      s.visible = vm && vm.$showActions.value
      s.position = 'fixed'
      s.top = '0px'
      s.right = '0px'
      s.width = '500px'
      s.paddingTop = '20px'
      s.paddingBottom = layout.statusBarHeight + 'px'
      s.height = window.innerHeight + 'px'
      s.paddingHorizontal = '20px'
      s.gap = '0px'
      s.bgColor = theme().actionsBg
      s.layer = '100'
    }).children(() => {

      p().react(s => {
        s.textColor = theme().text
        s.fontWeight = 'bold'
        s.paddingLeft = SHORTKEY_TEXT_WIDTH
        s.text = 'Shortkeys'
      })

      p().react(s => {
        s.textColor = theme().text
        s.paddingLeft = SHORTKEY_TEXT_WIDTH
        s.text = '(Press ESC to hide)'
        s.paddingBottom = '50px'
      })

      vlist<Action>()
        .observe(ctx.$mode, 'recreateChildren')
        .items(() => ctx.$mode.value?.actionsList.actions ?? [])
        .itemHash(a => a.cmd)
        .itemRenderer(ActionInfoView)
        .react(s => {
          s.width = '100%'
          s.gap = '0'
        })

      vstack()
        .react(s => {
          s.width = 'unset'
          s.textColor = theme().header
          s.fontSize = theme().fontSizeXS
          s.fontFamily = FontFamily.MONO
          s.paddingLeft = SHORTKEY_TEXT_WIDTH
          s.paddingTop = '50px'
          s.paddingRight = '20px'
          s.gap = '2px'
        })
        .children(() => {
          p().react(s => { s.text = '<CR> — Enter' })
          p().react(s => s.text = '<C-k> — Ctrl+k / Cmd+k')
        })
    })
}

const ActionInfoView = (a: Action) => {
  return p()
    .react(s => {
      s.width = '100%'
      s.height = '100%'
      s.fontFamily = FontFamily.MONO
      s.fontSize = theme().fontSizeXS
    }).children(() => {
      span().react(s => {
        s.display = 'inline-block'
        s.text = a.cmd
        s.textColor = theme().header
        s.paddingHorizontal = '20px'
        s.paddingVertical = '2px'
        s.width = SHORTKEY_TEXT_WIDTH
        s.whiteSpace = 'nowrap'
        s.textAlign = 'right'
      })

      span()
        .react(s => {
          s.text = a.desc
          s.textColor = theme().text
          s.width = '100%'
          //s.whiteSpace = 'nowrap'
          s.paddingVertical = '5px'
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
      s.fontSize = theme().fontSizeXS
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
        s.textColor = theme().text50
    })
}
