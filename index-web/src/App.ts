import { div, spacer, vstack } from "flinker-dom"
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
import { RecentOpenedFile } from "./ui/mode/RecentOpenedFilesManager"

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
      RecentOpenedFilesView()
      ActionsHelpView()
    })
}


const SHORTKEY_TEXT_WIDTH = '160px'
export const ActionsHelpView = () => {
  const ctx = IndexContext.self

  return div()
    .observe(ctx.$activeActionController.pipe().skipNullable().flatMap(ac => ac.$showActions).fork())
    .react(s => {
      const ac = ctx.$activeActionController.value
      const layout = globalContext.app.$layout.value
      s.visible = ac && ac.$showActions.value
      s.position = 'fixed'
      s.top = layout.navBarHeight + 'px'
      s.right = '20px'
      s.width = '550px'
      s.height = window.innerHeight - layout.navBarHeight - layout.statusBarHeight + 'px'
      s.paddingTop = '20px'
      s.paddingBottom = layout.statusBarHeight + 'px'
      s.paddingHorizontal = '20px'
      s.gap = '0px'
      s.bgColor = theme().actionsBg
      //s.borderColor = theme().action + '44'
      s.border = '10px solid ' + theme().action + '88'
      s.layer = '100'
      s.className = 'listScrollbar'
      s.enableOwnScroller = true
    }).children(() => {

      p().react(s => {
        s.textColor = theme().action
        s.fontWeight = 'bold'
        s.paddingLeft = SHORTKEY_TEXT_WIDTH
        s.text = 'Shortkeys'
      })

      p().react(s => {
        s.textColor = theme().action
        s.paddingLeft = SHORTKEY_TEXT_WIDTH
        s.text = '(Press ESC to hide)'
        s.paddingBottom = '20px'
      })

      vlist<Action>()
        .observe(ctx.$activeActionController, 'recreateChildren')
        .items(() => ctx.$activeActionController.value?.actionsList.actions ?? [])
        .itemHash(a => a.cmd)
        .itemRenderer(ActionInfoView)
        .react(s => {
          s.width = '100%'
          s.gap = '0'
        })

      spacer().react(s => {
        s.bgColor = theme().action + 'aa'
        s.width = '200px'
        s.height = '5px'
        s.marginLeft = SHORTKEY_TEXT_WIDTH
        s.marginVertical = '20px'
      })

      vstack()
        .react(s => {
          s.width = 'unset'
          s.textColor = theme().action + 'aa'
          s.fontSize = theme().fontSizeXS
          s.fontFamily = FontFamily.MONO
          s.paddingLeft = SHORTKEY_TEXT_WIDTH
          s.paddingRight = '20px'
          s.gap = '0px'
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
        s.textColor = theme().action
        s.paddingHorizontal = '20px'
        //s.paddingVertical = '2px'
        s.width = SHORTKEY_TEXT_WIDTH
        s.whiteSpace = 'nowrap'
        s.textAlign = 'right'
      })

      span()
        .react(s => {
          s.text = a.desc
          s.textColor = theme().action + 'aa'
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


export const RecentOpenedFilesView = () => {
  const ctx = IndexContext.self
  const filesManager = ctx.recentOpenedFilesManager

  return vstack()
    .observe(filesManager.$files)
    .observe(filesManager.$isOpened)
    .react(s => {
      s.visible = filesManager.$isOpened.value
      s.position = 'fixed'
      s.halign = 'center'
      s.valign = 'center'
      s.width = '100%'
      s.height = '100%'
      s.bgColor = theme().appBg + '44'
      s.layer = '100'
    }).children(() => {

      vlist<RecentOpenedFile>()
        .observe(filesManager.$files, 'recreateChildren')
        .observe(filesManager.$selectedFile, 'affectsChildrenProps')
        .items(() => filesManager.$files.value)
        .itemRenderer(RecentOpenedFileRenderer)
        .itemHash((item: RecentOpenedFile) => item.path + ':' + (item.path === filesManager.$selectedFile.value?.path))
        .react(s => {
          s.width = '600px'
          s.minHeight = '200px'
          s.padding = '20px'
          s.bgColor = theme().actionsBg
          s.border = '10px solid ' + theme().action + '88'
          s.gap = '10px'
        })
    })
}

const RecentOpenedFileRenderer = (f: RecentOpenedFile) => {
  const ctx = IndexContext.self
  const filesManager = ctx.recentOpenedFilesManager

  return div()
    .react(s => {
      // updated when selected item has changed
      const underCurser = filesManager.$selectedFile.value?.path === f.path
      s.width = '100%'
      s.fontSize = theme().fontSizeS
      s.fontFamily = FontFamily.MONO
      s.paddingHorizontal = '20px'
      s.bgColor = underCurser ? theme().menuFile : theme().transparent
      s.wrap = false
    })
    .children(() => {
      p()
        .react(s => {
          const underCurser = filesManager.$selectedFile.value?.path === f.path
          s.width = '100%'
          s.textColor = underCurser ? theme().appBg : theme().menuFile
          s.text = (ctx.explorer.filesAliasVoc[f.path] || f.name)
        })

      p().react(s => {
        const underCurser = filesManager.$selectedFile.value?.path === f.path
        s.width = '100%'
        s.textColor = underCurser ? theme().appBg : theme().menuPath
        s.text = '~' + f.path
        s.fontStyle = 'italic'
      })
    })
}