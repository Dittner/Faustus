import { div, hstack, spacer, span, vlist } from "flinker-dom"
import { globalContext } from "../../../App"
import { Page, TextFile } from "../../../domain/DomainModel"
import { IndexContext } from "../../IndexContext"
import { FontFamily } from "../../controls/Font"
import { Markdown } from "../../markdown/Markdown"
import { theme } from "../../theme/ThemeManager"
import { FileReader } from "./FileReader"
import { PageHeaderListView } from "./PageHeaderListView"
import { EditorView } from "./TextEditor"
import { TranslationPanel } from "./Translation"
import { log } from "../../../app/Logger"
import { TextReplacerView } from "./TextReplacer"

export const FileView = () => {
  log('new FileView')
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
          .observe(globalContext.app.$layout)
          .observe(ctx.reader.$showPageHeaderList)
          .react(s => {
            s.visible = ctx.reader.$showPageHeaderList.value
            s.position = 'fixed'
            s.width = globalContext.app.$layout.value.menuWidth + 'px'
            s.height = '100%'
            s.gap = '0'
            s.className = 'invisibleScrollbar'
            s.enableOwnScroller = true
            s.paddingRight = '20px'
            s.paddingTop = globalContext.app.$layout.value.navBarHeight + 'px'
          })

        PageList(file)
          .observe(globalContext.app.$layout)
          .observe(ctx.reader.$showPageHeaderList)
          .observe(ctx.reader.$editMode)
          .react(s => {
            const showPageHeaderList = ctx.reader.$showPageHeaderList.value
            const isEditing = ctx.reader.$editMode.value !== 'none'
            s.visible = ctx.reader.$editMode.value !== 'file'
            s.position = 'absolute'
            s.fontFamily = FontFamily.ARTICLE
            s.textColor = theme().text
            s.gap = '0'
            s.valign = 'top'
            s.halign = 'left'
            s.top = '0'
            s.paddingTop = globalContext.app.$layout.value.navBarHeight + 'px'
            //s.width = globalContext.app.$layout.value.contentWidth + 'px'
            s.width = '100%'
            s.gap = '20px'

            if (isEditing)
              s.left = window.innerWidth / 2 - 20 + 'px'
            else if (showPageHeaderList)
              s.left = globalContext.app.$layout.value.menuWidth + 'px'
            else {
              s.left = globalContext.app.$layout.value.menuWidth + 'px'
            }
          })

        TranslationPanel()
          .react(s => {
            s.position = 'fixed'
            s.right = '20px'
            s.top = '50px'
            s.padding = '20px'
            s.width = '400px'
            s.bgColor = theme().appBg
            s.border = '10px solid ' + theme().searchTranslationTheme.text + '44'
          })

        EditorView()
          .observe(globalContext.app.$layout)
          .observe(ctx.reader.$editMode)
          .react(s => {
            const layout = globalContext.app.$layout.value
            s.visible = ctx.reader.$editMode.value !== 'none'
            s.position = 'fixed'
            s.top = layout.navBarHeight + 'px'
            s.left = '0px'
            s.width = window.innerWidth / 2 - 20 + 'px'
            s.height = window.innerHeight - layout.navBarHeight + 'px'
            s.border = '1px solid' + theme().text + '50'
            s.bgColor = theme().appBg
            s.caretColor = theme().isLight ? '#000000' : theme().red
            s.paddingHorizontal = '20px'
            s.paddingBottom = layout.statusBarHeight + 'px'
            s.position = 'fixed'
            s.textColor = theme().text
          })

        TextReplacerView(file)
          .observe(ctx.reader.$editMode)
          .react(s => {
            s.visible = ctx.reader.$editMode.value === 'file'
            s.position = 'absolute'
            s.top = '0'
            s.paddingTop = globalContext.app.$layout.value.navBarHeight + 'px'
            s.width = window.innerWidth / 2 - 100 + 'px'
            s.left = window.innerWidth / 2 + 20 + 'px'
          })

        Header(ctx.reader)
          .observe(globalContext.app.$layout)
          .react(s => {
            s.position = 'fixed'
            s.top = '0'
            s.left = '0'
            s.gap = '0'
            s.width = '100%'
            s.height = globalContext.app.$layout.value.navBarHeight + 'px'
          })
      }
    })
}

const PageList = (file: TextFile) => {
  log('new PageList')
  const ctx = IndexContext.self

  const list = vlist<Page>()
    .observe(file, 'recreateChildren')
    .react(s => {
      s.className = 'article'
      s.textColor = theme().text
    })
    .items(() => file.pages)
    .itemRenderer(PageView)
    .itemHash(p => p.uid)

  // globalContext.app.$scrollY.pipe()
  //   .debounce(1000)
  //   .onReceive(scrollY => {
  //     log('ScrollHeight:', list.dom.clientHeight)
  //     if (list.childrenColl) {
  //       const index = indexOfFirstVisibleElement(list.childrenColl.map(u => u.dom), scrollY, list.dom.clientHeight)
  //       if (index !== -1)
  //         ctx.reader.$selectedPage.value = file.pages[index]
  //     }
  //   })
  //   .subscribe()

  return list
}

export const PageView = (page: Page, index: number) => {
  log('new PageView')
  const reader = IndexContext.self.reader
  return div()
    .observe(reader.$editingPage)
    //.observe(reader.$selectedPage)
    .observe(reader.$showPageHeaderList)
    .react(s => {
      const isEditing = reader.$editingPage.value === page
      //const isSelected = reader.$selectedPage.value === page && reader.$showPageHeaderList.value

      s.id = '#' + index
      s.gap = '20px'
      //s.paddingBottom = '40px'
      s.paddingLeft = '60px'
      s.borderLeft = '1px solid ' + (isEditing ? theme().red : theme().transparent)
    })
    .children(() => {

      hstack().react(s => {
        s.gap = '20px'
        s.valign = 'top'
      })
        .children(() => {

          Markdown()
            .observe(page)
            .react(s => {
              const hasTranslation = page.text.indexOf('~~') !== -1
              s.className = theme().id
              s.width = '100%'
              s.maxWidth = hasTranslation ? '600px' : '850px'
              s.minHeight = '30px'
              if (hasTranslation) {
                const text = page.text.split('~~').map((text: string, index: number) => index % 2 === 0 ? text : '')
                s.text = text.join('').trim()
              } else {
                s.text = page.text
              }

              s.fontSize = theme().defFontSize
              s.absolutePathPrefix = globalContext.indexServer.assetsUrl
              //s.showRawText = page.file.showRawText
              //s.fontFamily = isCode ? 'var(--font-family)' : 'var(--font-family-article)'
            })

          Markdown()
            .observe(page)
            .react(s => {
              const hasTranslation = page.text.indexOf('~~') !== -1
              s.visible = hasTranslation
              s.className = theme().id
              s.width = '100%'
              s.maxWidth = hasTranslation ? '600px' : '850px'
              s.minHeight = '30px'
              if (hasTranslation) {
                const text = page.text.split('~~').map((text: string, index: number) => index % 2 !== 0 ? text : '')
                s.text = text.join('').trim()
              }

              s.textColor = theme().text + 'dd'
              s.fontSize = theme().defFontSize
              s.absolutePathPrefix = globalContext.indexServer.assetsUrl
              //s.showRawText = page.file.showRawText
              //s.fontFamily = isCode ? 'var(--font-family)' : 'var(--font-family-article)'
            })
        })

      spacer().react(s => {
        s.width = '400px'
        s.bgColor = theme().text + '40'
        s.height = '10px'
        //s.bottom = '0'
        //s.marginLeft = '350px'
        s.marginVertical = '80px'
      })

    })
}

const Header = (reader: FileReader) => {
  return hstack()
    .observe(reader.$isFileChanged, 'affectsChildrenProps')
    .react(s => {
      s.gap = '0'
      s.fontFamily = FontFamily.APP
      s.fontSize = theme().fontSizeXS
      s.valign = 'center'
      s.paddingHorizontal = '20px'
      const isFileChanged = reader.$isFileChanged.value
      s.bgColor = isFileChanged ? theme().red + '20' : theme().appBg + '88'
      s.blur = '10px'
    })
    .children(() => {

      span()
        .observe(reader.$selectedFile)
        .observe(reader.$isFileChanged)
        .react(s => {
          const f = reader.$selectedFile.value
          s.text = ''
          s.fontWeight = 'bold'
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

          s.textColor = reader.$isFileChanged.value ? theme().mark : theme().header
          s.whiteSpace = 'nowrap'
        })

      spacer().react(s => s.width = '100%')

    })
}