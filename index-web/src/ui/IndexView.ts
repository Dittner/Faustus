import { div, observer, p, vstack } from "flinker-dom"
import { globalContext } from "../App"
import { LayoutLayer } from "../app/Application"
import { IndexContext } from "../app/IndexContext"
import { theme } from "../app/ThemeManager"
import { EditorView } from "./editor/EditorView"
import { FileTreeView } from "./FileTreeView"
import { FileView } from "./FileView"
import { NavBar } from "./NavBar"

export function IndexView() {
  console.log('new IndexView')
  IndexContext.init()
  const ctx = IndexContext.self

  return div()
    .react(s => {
      s.width = '100%'
    })
    .children(() => {
      NavBar()
        .react(s => {
          s.position = 'fixed'
          s.top = '0'
          s.left = '0'
          s.width = '100%'
          s.height = '40px'
          s.paddingHorizontal = '20px'
          s.layer = LayoutLayer.HEADER
        })

      FileTreeView()
        .observe(ctx.$isFileTreeShown)
        .observe(ctx.$isSelectedFileEditing)
        .observe(globalContext.restApi.$isServerAvailable)
        .react(s => {
          s.visible = ctx.$isFileTreeShown.value && !ctx.$selectedFile.value.isEditing && globalContext.restApi.$isServerAvailable.value
          s.className = 'listScrollbar'
          s.enableOwnScroller = false
          s.position = 'fixed'
          s.paddingTop = '20px'
          s.top = '40px'
          s.left = '0'
          s.width = theme().menuWidthPx + 'px'
          s.bottom = '0'
        })
        .whenHovered(s => {
          s.enableOwnScroller = true
        })

      FileView()
        .observe(ctx.$isSelectedFileEditing)
        .observe(ctx.$isLoading)
        .observe(globalContext.restApi.$isServerAvailable)
        .react(s => {
          s.visible = !ctx.$isLoading.value && globalContext.restApi.$isServerAvailable.value
          s.layer = LayoutLayer.ZERO
          s.position = 'absolute'
          s.top = '0'
          s.right = '0'
          s.left = ctx.$isSelectedFileEditing.value ? '50%' : theme().menuWidthPx + 'px'
          s.height = '100%'
          s.gap = '80px'
        })

      EditorView()
        .observe(ctx.$isSelectedFileEditing)
        .react(s => {
          s.visible = ctx.$isSelectedFileEditing.value
          console.log('EditorView is visible:', s.visible)
          s.position = 'fixed'
          s.width = '50%'
          s.minWidth = '800px'
          s.top = '40px'
          s.bottom = '0'
          s.left = '0'
          s.top = '0'
          s.bgColor = theme().appBg
          s.borderRight = ['1px', 'solid', theme().text + '20']
          s.borderColor = theme().transparent
          s.layer = LayoutLayer.ONE
        })

      LoadIndicator()
      ServerNotAvailableView()
    })
}

const LoadIndicator = () => {
  const ctx = IndexContext.self
  return vstack()
    .observe(ctx.$isLoading)
    .react(s => {
      s.position = 'fixed'
      s.visible = ctx.$isLoading.value
      s.width = '100vw'
      s.height = '100vh'
      s.valign = 'center'
      s.halign = 'center'
      s.bgColor = theme().appBg + '88'
      s.layer = LayoutLayer.MODAL
      s.mouseEnabled = false
    }).children(() => {
      p().react(s => {
        s.text = 'Loading...'
        s.textColor = theme().h1
        s.fontSize = '12px'
      })
    })
}

const ServerNotAvailableView = () => {
  return observer(globalContext.restApi.$isServerAvailable)
    .onReceive(isServerAvailable => {
      return !isServerAvailable && vstack()
        .react(s => {
          s.position = 'fixed'
          s.width = '100vw'
          s.height = '100vh'
          s.valign = 'center'
          s.halign = 'center'
          s.bgColor = theme().appBg + '88'
          s.layer = LayoutLayer.MODAL
        }).children(() => {
          p().react(s => {
            s.text = 'Server is not available!!!'
            s.textColor = theme().h1
            s.fontSize = '0.8rem'
          })
        })
    })
}