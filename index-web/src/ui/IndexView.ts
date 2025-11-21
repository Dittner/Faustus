import { div, hstack, p, span, vlist } from "flinker-dom"
import { FontFamily } from "./controls/Font"
import { IndexContext } from "./IndexContext"
import { ServerConnectionView } from "./mode/connect/ServerConnctionView"
import { OperatingMode } from "./mode/OperatingMode"
import { theme } from "./theme/ThemeManager"
import { Action } from "./mode/Action"
import { FileExplorerView } from "./mode/explore/FileExplorerView"
import { FileView } from "./mode/read/FileView"
import { FileSearchView } from "./mode/search/FileSearchView"

export function IndexView() {
  console.log('new IndexView')
  IndexContext.init()

  return div()
    .react(s => {
      s.width = '100%'
    })
    .children(() => {
      ServerConnectionView()
      FileExplorerView()
      FileView()
      FileSearchView()
    })
}

export const ActionsHelpView = (mode: OperatingMode) => {
  const total = mode.actionsList.actions.length
  const col1 = mode.actionsList.actions.slice(0, Math.ceil(total / 2))
  const col2 = mode.actionsList.actions.slice(Math.ceil(total / 2))
  return hstack()
    .observe(mode.$showActions)
    .react(s => {
      s.visible = mode.$showActions.value
      s.fontFamily = FontFamily.MONO
      s.fontSize = '18px'
      s.width = '100%'
      s.gap = '0'
      s.paddingVertical = '20px'
      s.borderColor = theme().statusFg
      s.bgColor = theme().statusBg + '88'
      s.blur = '10px'
    }).children(() => {
      vlist<Action>()
        .items(() => col1)
        .itemHash(a => a.cmd)
        .itemRenderer(ActionInfoView)
        .react(s => {
          s.width = '50%'
          s.gap = '0'
        })

      vlist<Action>()
        .items(() => col2)
        .itemHash(a => a.cmd)
        .itemRenderer(ActionInfoView)
        .react(s => {
          s.width = '50%'
          s.gap = '0'
        })
    })
}

export const ActionInfoView = (a: Action) => {
  return p()
    .react(s => {
      s.width = '100%'
      s.fontSize = '18px'
    }).children(() => {
      span().react(s => {
        s.display = 'inline-block'
        s.text = a.cmd
        s.textColor = theme().red
        s.paddingHorizontal = '20px'
        s.paddingVertical = '5px'
        s.width = '100px'
        s.whiteSpace = 'nowrap'
        s.textAlign = 'right'
      })

      span()
        .react(s => {
          s.text = a.desc
          s.textColor = theme().statusFg
          s.width = '100%'
          //s.whiteSpace = 'pre'
          s.paddingHorizontal = '20px'
          s.paddingVertical = '5px'
        })
    })
}

export const MessangerView = () => {
  const ctx = IndexContext.self
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