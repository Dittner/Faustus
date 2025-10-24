import { observer, p, span, vlist, vstack } from "flinker-dom"
import { theme } from "../../theme/ThemeManager"
import { FileExplorer } from "./FileExplorer"
import { IndexContext } from "../../IndexContext"
import { FontFamily } from "../../controls/Font"
import { LayoutLayer } from "../../../app/Application"
import { ActionsHelpView, CMD_LINE_HEIGHT, MessangerView } from "../../IndexView"
import { StatusBar, StatusBarActionBuffer, StatusBarModeName } from "../../controls/StatusBar"
import { LineInput } from "../../controls/Input"
import { FileNode } from "../FileNode"

export const FileExplorerView = () => {
  const ctx = IndexContext.self

  return observer(ctx.$mode)
    .onReceive(mode => {
      return mode === ctx.explorer && vstack()
        .react(s => {
          s.position = 'fixed'
          s.width = '100%'
          s.height = '100vh'
          s.paddingBottom = CMD_LINE_HEIGHT + 'px'
          s.layer = LayoutLayer.MODAL
        }).children(() => {

          vlist<FileNode>()
            .observe(ctx.explorer.$mode)
            .observe(ctx.explorer.$openedDirFiles, 'recreateChildren')
            .observe(ctx.explorer.$selectedFilePath, 'affectsChildrenProps')
            .items(() => ctx.explorer.$openedDirFiles.value)
            .itemRenderer(FileNodeRenderer)
            .itemHash((item: FileNode) => item.path + ':' + (item.path === ctx.explorer.$selectedFilePath.value))
            .react(s => {
              s.width = '100%'
              s.height = '100%'
              s.gap = '0'
              s.className = 'listScrollbar'
              s.enableOwnScroller = true
            })

          Footer(ctx.explorer)
            .react(s => {
              s.position = 'fixed'
              s.width = '100%'
              s.bottom = '0'
              s.layer = LayoutLayer.MODAL
            })

          LineInput(ctx.explorer.bufferController.$buffer, ctx.explorer.bufferController.$cursorPos)
            .observe(ctx.explorer.$mode)
            .react(s => {
              const mode = ctx.explorer.$mode.value
              s.visible = ctx.explorer.$mode.value !== 'explore'
              s.title = mode === 'create' ? 'New:' : mode === 'rename' ? 'Rename:' : 'Input:'
              s.position = 'fixed'
              s.width = '100%'
              s.height = CMD_LINE_HEIGHT + 'px'
              s.bottom = '0'
              s.layer = LayoutLayer.MODAL
            })
        })
    })
}

const FileNodeRenderer = (n: FileNode) => {
  const ctx = IndexContext.self
  const host = p()
  return host
    .react(s => {
      // updated when selected item has changed
      s.fontSize = theme().defMenuFontSize
      s.fontFamily = FontFamily.MONO
      s.wrap = false
    })
    .children(() => {
      span().react(s => {
        const underCurser = ctx.explorer.$selectedFilePath.value === n.path
        if (underCurser) {
          host.dom.scrollIntoView({
            behavior: 'instant',
            block: 'center'
          })
        }


        const textColor = n.isDir ? theme().menuDir : theme().menuFile
        const bgColor = theme().appBg
        s.padding = '5px'
        s.paddingLeft = '20px'
        s.textColor = underCurser ? bgColor : textColor
        s.bgColor = underCurser ? textColor : theme().transparent
        s.text = n.isDir ? n.id + '/' : ctx.explorer.filesAliasVoc[n.path] ?? n.id
      })

      span().react(s => {
        s.padding = '5px'
        s.textColor = theme().menuPath
        s.paddingLeft = '20px'
        s.text = '~/' + n.path
        s.fontStyle = 'italic'
      })
    })
}


const Footer = (explorer: FileExplorer) => {
  return vstack()
    .observe(explorer.$mode)
    .react(s => {
      s.gap = '0'
    })
    .children(() => {

      MessangerView()
      ActionsHelpView(explorer)
      StatusBar().children(() => {

        StatusBarModeName()
          .react(s => {
            s.text = explorer.id.toUpperCase()
          })

        span()
          .observe(explorer.$openedDirPath)
          .react(s => {
            s.text = '~/' + explorer.$openedDirPath.value
            s.textColor = theme().statusFg
            s.width = '100%'
          })

        StatusBarActionBuffer(explorer)
          .observe(explorer.$cmdBuffer)
          .react(s => {
            s.text = explorer.$cmdBuffer.value || (explorer.lastExecutedAction?.cmd ?? '')
          })
      })
    })
}
