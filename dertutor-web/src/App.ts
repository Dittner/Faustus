import { div, hstack, observer, p, span, vlist } from "flinker-dom"
import { GlobalContext } from "./app/GlobalContext"
import { DertutorContext } from "./DertutorContext"
import { Action } from "./ui/actions/Action"
import { FontFamily } from "./ui/controls/Font"
import { theme, themeManager } from "./ui/theme/ThemeManager"
import { ServerConnectionView } from "./ui/view/connect/ServerConnctionView"
import { EditorView } from "./ui/view/editor/EditorView"
import { LangListView } from "./ui/view/lang/LangListView"
import { NoteListView } from "./ui/view/note/NoteListView"
import { VocListView } from "./ui/view/vocs/VocListView"

export const globalContext = GlobalContext.init()

export function App() {
  console.log('new App')
  const ctx = DertutorContext.init()

  return div()
    .observe(themeManager.$theme, 'affectsProps', 'affectsChildrenProps')
    .react(s => {
      s.width = '100%'
    })
    .children(() => {

      observer(ctx.$activeVM)
        .onReceive(vm => {
          if (vm === ctx.connectionVM) return ServerConnectionView()
          else if (vm === ctx.langListVM) return LangListView()
          else if (vm === ctx.vocListVM) return VocListView()
          else if (vm === ctx.noteListVM) return NoteListView()
          else if (vm === ctx.editorVM) return EditorView()
          else return undefined
        })

      ActionsHelpView()
      Footer()
    })
}

export const ActionsHelpView = () => {
  const ctx = DertutorContext.self

  return div()
    .observe(ctx.$activeVM.pipe().flatMap(vm => vm.$showActions).fork())
    .observe(ctx.$activeVM, 'recreateChildren')
    .react(s => {
      const vm = ctx.$activeVM.value
      s.visible = vm.$showActions.value
      s.position = 'fixed'
      s.bottom = theme().statusBarHeight + 'px'
      s.right = '0'
      s.paddingHorizontal = '20px'
      s.gap = '0'
    }).children(() => {
      const vm = ctx.$activeVM.value
      vlist<Action>()
        .items(() => vm.actionsList.actions)
        .itemHash(a => a.cmd)
        .itemRenderer(ActionInfoView)
        .react(s => {
          s.width = '100%'
          s.gap = '0'
        })
    })
}

const ActionInfoView = (a: Action) => {
  return p()
    .react(s => {
      s.width = '100%'
      s.fontFamily = FontFamily.MONO
      s.fontSize = theme().defMenuFontSize
    }).children(() => {
      span().react(s => {
        s.display = 'inline-block'
        s.text = a.cmd
        s.textColor = theme().em
        s.paddingHorizontal = '20px'
        s.paddingVertical = '5px'
        s.width = '120px'
        s.whiteSpace = 'nowrap'
        s.textAlign = 'right'
      })

      span()
        .react(s => {
          s.text = a.desc
          s.textColor = theme().accent
          s.width = '100%'
          s.whiteSpace = 'nowrap'
          s.paddingVertical = '5px'
        })
    })
}

const Footer = () => {
  return hstack()
    .react(s => {
      s.position = 'fixed'
      s.bottom = '0'
      s.left = '0'
      s.fontFamily = FontFamily.MONO
      s.fontSize = theme().defMenuFontSize
      s.gap = '10px'
      s.width = '100%'
      s.minHeight = theme().statusBarHeight + 'px'
      s.valign = 'center'
      s.bgColor = theme().accent + '10'
      s.blur = '5px'
    })
    .children(() => {

      MessangerView().react(s => {
        s.width = '100%'
      })

      CmdView()
    })
}

export const MessangerView = () => {
  const ctx = DertutorContext.self
  return p()
    .observe(ctx.$msg)
    .react(s => {
      const msg = ctx.$msg.value
      s.fontFamily = FontFamily.MONO
      s.fontSize = theme().defMenuFontSize
      s.text = msg?.text ?? ''
      //s.bgColor = theme().appBg
      s.width = '100%'
      s.paddingHorizontal = '20px'

      if (msg?.level === 'error')
        s.textColor = theme().red
      else if (msg?.level === 'warning')
        s.textColor = theme().yellow
      else
        s.textColor = theme().text50
    })
}

export const CmdView = () => {
  const ctx = DertutorContext.self
  return p()
    .observe(ctx.$activeVM.pipe().flatMap(vm => vm.$cmd).fork())
    .react(s => {
      s.fontFamily = FontFamily.MONO
      s.fontSize = theme().defMenuFontSize
      s.text = ctx.$activeVM.value.$cmd.value
      s.whiteSpace = 'nowrap'
      s.paddingHorizontal = '10px'
      s.textColor = theme().text
    })
}