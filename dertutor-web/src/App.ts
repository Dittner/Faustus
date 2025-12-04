import { div, hstack, observer, p, span, vlist } from "flinker-dom"
import { GlobalContext } from "./app/GlobalContext"
import { DertutorContext } from "./ui/DertutorContext"
import { Action } from "./ui/actions/Action"
import { FontFamily } from "./ui/controls/Font"
import { theme, themeManager } from "./ui/theme/ThemeManager"
import { IViewModel } from "./ui/view/ViewModel"
import { ServerConnectionView } from "./ui/view/connect/ServerConnctionView"
import { LangListView } from "./ui/view/lang/LangListView"
import { NoteListView } from "./ui/view/note/NoteListView"
import { VocListView } from "./ui/view/vocs/VocListView"
import { EditorView } from "./ui/view/editor/EditorView"

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

      // p()
      //   .observe(ctx.$selectedLang)
      //   .react(s => {
      //     const code = ctx.$selectedLang.value?.code ?? ''
      //     s.visible = ctx.$selectedLang.value !== undefined
      //     s.position = 'fixed'
      //     s.width = '100%'
      //     s.height = '1px'
      //     s.top = '0'
      //     s.bgColor = code === 'de' ? theme().yellow : theme().red
      //   })
    })
}

export const ActionsHelpView = (vm: IViewModel) => {
  const total = vm.actionsList.actions.length
  const col1 = vm.actionsList.actions.slice(0, Math.ceil(total / 2))
  const col2 = vm.actionsList.actions.slice(Math.ceil(total / 2))
  return hstack()
    .observe(vm.$showActions)
    .react(s => {
      s.visible = vm.$showActions.value
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

const ActionInfoView = (a: Action) => {
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
        s.width = '120px'
        s.whiteSpace = 'nowrap'
        s.textAlign = 'right'
      })

      span()
        .react(s => {
          s.text = a.desc
          s.textColor = theme().statusFg
          s.width = '100%'
          s.whiteSpace = 'nowrap'
          s.paddingVertical = '5px'
        })
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
      s.fontSize = theme().defMenuFontSize
      s.text = msg?.text ?? ''
      //s.bgColor = theme().appBg
      s.whiteSpace = 'nowrap'
      s.paddingLeft = '20px'
      s.paddingRight = '2px'
      
      if (msg?.level === 'error')
        s.textColor = theme().red
      else if (msg?.level === 'warning')
        s.textColor = theme().yellow
      else
        s.textColor = theme().accent
    })
}