import { div, hstack, p, spacer, span, vlist, vstack } from "flinker-dom"
import { globalContext } from "../../../App"
import { LayoutLayer } from "../../../app/Application"
import { indexOfFirstVisibleElement } from "../../../app/Utils"
import { Page, TextFile } from "../../../domain/DomainModel"
import { IndexContext } from "../../IndexContext"
import { ActionsHelpView, MessangerView } from "../../IndexView"
import { FontFamily } from "../../controls/Font"
import { StatusBar, StatusBarModeName } from "../../controls/StatusBar"
import { Markdown } from "../../markdown/Markdown"
import { theme } from "../../theme/ThemeManager"
import { FileReader } from "./FileReader"
import { PageHeaderListView } from "./PageHeaderListView"
import { EditorView } from "./TextEditor"

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
            s.width = theme().menuWidth + 'px'
            s.height = '100%'
            s.gap = '0'
            s.className = 'invisibleScrollbar'
            s.enableOwnScroller = true
            s.paddingRight = '20px'
            s.paddingBottom = theme().statusBarHeight + 'px'
            s.layer = LayoutLayer.MODAL
          })

        PageList(file)
          .observe(ctx.reader.$showPageHeaderList)
          .observe(ctx.reader.$editMode)
          .react(s => {
            const showPageHeaderList = ctx.reader.$showPageHeaderList.value
            const isEditing = ctx.reader.$editMode.value !== 'none'
            s.position = 'absolute'
            s.layer = LayoutLayer.ZERO
            s.fontFamily = FontFamily.ARTICLE
            s.textColor = theme().text
            s.gap = '0'
            s.valign = 'top'
            s.halign = 'left'
            s.top = '0'
            s.paddingBottom = theme().statusBarHeight + 'px'
            s.width = (window.innerWidth - theme().menuWidth - 20) + 'px'
            s.gap = '20px'

            if (isEditing)
              s.left = window.innerWidth / 2 - 20 + 'px'
            else if (showPageHeaderList)
              s.left = theme().menuWidth + 'px'
            else
              s.left = '0px'
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
            s.height = window.innerHeight - theme().statusBarHeight + 'px'
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
          s.layer = LayoutLayer.MODAL
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
          s.borderColor = isEditing ? theme().red : isSelected ? theme().menuPage + '88' : theme().transparent
          s.borderRight = theme().red
        })

      Markdown()
        .observe(page)
        .react(s => {
          s.className = theme().id
          s.maxWidth = theme().maxBlogTextWidth - 10 + 'px'
          s.width = "100%"
          s.minHeight = "30px"
          s.text = page.text
          s.fontSize = theme().defFontSize
          s.absolutePathPrefix = globalContext.indexServer.assetsUrl
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
      ActionsHelpView(reader)
      StatusBar()
        .observe(reader.$isFileChanged)
        .react(s => {
          const isFileChanged = reader.$isFileChanged.value
          s.bgColor = isFileChanged ? theme().red + '20' : theme().statusBg + '88'
        })
        .children(() => {

          StatusBarModeName()
            .observe(reader.$editMode)
            .observe(reader.$isFileChanged)
            .react(s => {
              const isFileChanged = reader.$isFileChanged.value
              const isEditing = reader.$editMode.value !== 'none'
              s.bgColor = isEditing ? theme().red : isFileChanged ? theme().mark : theme().statusFg
              s.text = isEditing ? 'EDIT (Press <ESC> to quit)' : isFileChanged ? 'MODIFIED' : reader.id.toUpperCase()
            })

          span()
            .observe(reader.$selectedFile)
            .observe(reader.$isFileChanged)
            .react(s => {
              const f = reader.$selectedFile.value
              s.fontFamily = FontFamily.ARTICLE
              s.text = ''

              if (f) {
                if (f.author) {
                  s.text += f.author
                  s.text += s.text.endsWith('.') ? ' ' : '. '
                }

                s.text += f.alias || f.name

                if (f.published)
                  s.text += '. ' + f.published
                else if (f.birthYear && f.deathYear)
                  s.text += '. ' + f.birthYear + '-' + f.deathYear
                else if (f.birthYear)
                  s.text += '. ' + f.birthYear
              }

              s.textColor = reader.$isFileChanged.value ? theme().mark : theme().statusFg
              s.whiteSpace = 'nowrap'
            })

          spacer().react(s => s.width = '100%')

          MessangerView()
        })
    })
}