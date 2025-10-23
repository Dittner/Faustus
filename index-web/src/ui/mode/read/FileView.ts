import { div, hstack, p, spacer, span, vlist, vstack } from "flinker-dom"
import { globalContext } from "../../../App"
import { Page, TextFile } from "../../../domain/DomainModel"
import { IndexContext } from "../../IndexContext"
import { FontFamily } from "../../controls/Font"
import { Markdown } from "../../markdown/Markdown"
import { theme } from "../../theme/ThemeManager"
import { LayoutLayer } from "../../../app/Application"
import { ActionsHelpView, CMD_LINE_HEIGHT, MessangerView } from "../../IndexView"
import { EditorView } from "./TextEditor"
import { StatusBar, StatusBarActionBuffer, StatusBarModeName } from "../../controls/StatusBar"
import { FileReader } from "./FileReader"
import { indexOfFirstVisibleElement } from "../../../app/Utils"
import { PageHeaderListView } from "./PageHeaderListView"

export const FileView = () => {
  console.log('new FileView')
  const ctx = IndexContext.self

  return div()
    .observe(ctx.$mode)
    .observe(ctx.reader.$selectedFile, 'recreateChildren')
    .react(s => {
      s.width = '100%'
      s.height = '100%'
      s.visible = ctx.$mode.value === ctx.reader
    })
    .children(() => {
      const file = ctx.reader.$selectedFile.value

      if (file) {
        PageHeaderListView(file)
          .observe(ctx.reader.$showPageHeaderList)
          .react(s => {
            s.visible = ctx.reader.$showPageHeaderList.value
            s.position = 'fixed'
            s.width = theme().menuWidthPx + 'px'
            s.height = '100%'
            s.gap = '0'
            s.className = 'invisibleScrollbar'
            s.enableOwnScroller = true
            s.paddingRight = '20px'
            s.paddingBottom = CMD_LINE_HEIGHT + 'px'
            s.layer = LayoutLayer.MODAL
          })

        PageList(file)
          .observe(ctx.reader.$editMode)
          .react(s => {

            const isEditing = ctx.reader.$editMode.value !== 'none'
            s.position = 'absolute'
            s.layer = LayoutLayer.ZERO
            s.fontFamily = FontFamily.ARTICLE
            s.textColor = theme().text
            s.gap = '0'
            s.valign = 'top'
            s.halign = 'left'
            s.top = '0'
            s.paddingBottom = CMD_LINE_HEIGHT + 'px'
            s.left = (isEditing ? window.innerWidth / 2 - 20 : theme().menuWidthPx) + 'px'
            s.width = (window.innerWidth - theme().menuWidthPx - 20) + 'px'
            s.gap = '20px'
          })

        EditorView()
          .observe(ctx.reader.$editMode)
          .react(s => {
            s.visible = ctx.reader.$editMode.value !== 'none'
            s.position = 'fixed'
            s.layer = LayoutLayer.MODAL
            s.top = '0'
            s.left = '0'
            s.width = window.innerWidth / 2 - 20 + 'px'
            s.height = window.innerHeight - CMD_LINE_HEIGHT + 'px'
            s.borderRight = ['1px', 'solid', theme().text + '20']
            s.borderColor = theme().transparent
          })
      }

      Footer(ctx.reader)
        .react(s => {
          s.position = 'fixed'
          s.bottom = '0'
          s.left = '0'
          s.gap = '0'
          s.width = '100%'
          s.bgColor = theme().appBg
          s.layer = LayoutLayer.MODAL
        })

      span()
        .observe(ctx.reader.$selectedFile)
        .react(s => {
          s.visible = false
          ctx.reader.pageListDidRender()
        })
    })
}

const PageList = (file: TextFile) => {
  console.log('new PageList')
  const ctx = IndexContext.self

  const list = vlist<Page>()
    .observe(file, 'recreateChildren')
    .react(s => {
      s.className = 'article'
      s.textColor = theme().text
      s.gap = "0px"
      s.width = "100%"
    })
    .items(() => file.pages)
    .itemRenderer(PageView)
    .itemHash(p => p.uid)

  globalContext.app.$scrollY.pipe()
    .debounce(1000)
    .onReceive(scrollY => {
      console.log('ScrollHeight:', list.dom.clientHeight)
      if (list.childrenColl) {
        const index = indexOfFirstVisibleElement(list.childrenColl.map(u => u.dom), scrollY, list.dom.clientHeight)
        if (index !== -1)
          ctx.reader.$selectedPage.value = file.pages[index]
      }
    })
    .subscribe()

  return list
}

export const PageView = (page: Page, index: number) => {
  console.log('new PageView')
  const reader = IndexContext.self.reader
  return hstack()
    .react(s => {
      s.id = '#' + index
      s.gap = '20px'
      s.valign = 'stretch'
      s.halign = 'left'
      s.width = '100%'
      s.padding = '20px'
    })
    .children(() => {
      p()
        .observe(reader.$editingPage)
        .observe(reader.$selectedPage)
        .observe(reader.$showPageHeaderList)
        .react(s => {
          const isEditing = reader.$editingPage.value === page
          const isSelected = reader.$selectedPage.value === page && reader.$showPageHeaderList.value
          s.width = '10px'
          s.maxWidth = '10px'
          s.top = '0'
          s.bottom = '0'
          s.borderColor = isEditing ? theme().red + '50' : isSelected ? theme().green : theme().transparent
          s.borderRight = theme().red
        })

      Markdown()
        .observe(page)
        .react(s => {
          s.className = theme().id
          s.maxWidth = theme().maxBlogTextWidthPx - 10 + 'px'
          s.width = "100%"
          s.minHeight = "30px"
          s.text = page.text
          s.fontSize = theme().defFontSize

          s.apiUrl = globalContext.restApi.assetsUrl
          //s.showRawText = page.file.showRawText
          //s.fontFamily = isCode ? 'var(--font-family)' : 'var(--font-family-article)'
        })
    })
}

const Footer = (reader: FileReader) => {
  return vstack()
    .react(s => {
      s.gap = '0'
    })
    .children(() => {
      MessangerView()
      ActionsHelpView(reader)
      StatusBar().children(() => {

        StatusBarModeName()
          .observe(reader.$editMode)
          .react(s => {
            const isEditing = reader.$editMode.value !== 'none'
            s.bgColor = isEditing ? theme().red : theme().statusFg
            s.text = isEditing ? 'EDIT' : reader.id.toUpperCase()
          })

        span()
          .observe(reader.$selectedFile)
          .observe(reader.$isFileChanged)
          .react(s => {
            const f = reader.$selectedFile.value
            s.text = f?.alias ?? f?.name ?? ''
            if (f?.published)
              s.text += ' (' + f.published + ')'
            else if (f?.birthYear && f.deathYear)
              s.text += ' (' + f.birthYear + '-' + f.deathYear + ')'
            else if (f?.birthYear)
              s.text += ' (' + f.birthYear + ')'
            s.textColor = reader.$isFileChanged.value ? theme().yellow : theme().statusFg
            s.fontWeight = 'bold'
            s.whiteSpace = 'nowrap'
          })

        span()
          .observe(reader.$selectedFile)
          .observe(reader.$isFileChanged)
          .react(s => {
            const f = reader.$selectedFile.value
            s.text = '~/' + f?.path
            if (reader.$isFileChanged.value)
              s.text += ' (CHANGED)'
            s.textColor = reader.$isFileChanged.value ? theme().yellow : theme().statusFg
            s.whiteSpace = 'nowrap'
          })

        spacer().react(s => s.width = '100%')

        span()
          .observe(reader.$editMode)
          .react(s => {
            const isEditing = reader.$editMode.value !== 'none'
            s.visible = isEditing
            s.text = 'Press <ESC> to quit'
            s.whiteSpace = 'nowrap'
            s.textColor = theme().statusFg
          })

        StatusBarActionBuffer(reader)
          .observe(reader.$cmdBuffer)
          .react(s => {
            s.text = reader.$cmdBuffer.value || (reader.lastExecutedAction?.cmd ?? '')
          })
      })
    })
}