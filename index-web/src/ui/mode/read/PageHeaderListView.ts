import { p, vlist } from "flinker-dom"
import { Page, TextFile } from "../../../domain/DomainModel"
import { theme } from "../../theme/ThemeManager"
import { IndexContext } from "../../IndexContext"
import { FontFamily } from "../../controls/Font"

export const PageHeaderListView = (file: TextFile) => {
  console.log('new FileHeaderListView')
  const ctx = IndexContext.self
  const list = vlist<Page>()
    .observe(file, 'recreateChildren')
    .observe(ctx.reader.$selectedPage, 'affectsChildrenProps')
    .items(() => file.pages)
    .itemRenderer(PageHeaderRenderer)
    .itemHash((p: Page) => p.uid + '#' + p.header + ':' + (p === ctx.reader.$selectedPage.value))

  ctx.reader.$selectedPage.pipe()
    .onReceive(p => {
      if (list.childrenColl) {
        for (let i = 0; i < file.pages.length; i++) {
          if (file.pages[i] === p) {
            if (list.childrenColl.length > i) list.childrenColl[i].dom.scrollIntoView({
              behavior: 'instant',
              block: 'center'
            })
            break
          }
        }
      }
    })
    .subscribe()

  return list
}

const PageHeaderRenderer = (page: Page) => {
  const ctx = IndexContext.self

  return p()
    .observe(page)
    .react(s => {
      // updated when selected item has changed
      const underCurser = ctx.reader.$selectedPage.value === page
      const textColor = theme().menuPage
      const bgColor = theme().appBg
      //s.width = '100%'
      s.textSelectable = false
      s.fontSize = theme().defMenuFontSize
      s.fontFamily = FontFamily.ARTICLE
      s.textColor = underCurser ? theme().accent : theme().menuPage + 'cc'
      s.paddingRight = '5px'
      s.width = '100%'
      s.paddingLeft = page.headerLevel * 20 + 'px'
      s.paddingVertical = '5px'
      s.wrap = false
      s.text = page.header
      s.lineHeight = '1rem'
    })
    .whenHovered(s => {
      s.cursor = 'pointer'
      s.textColor = theme().menuPage
    })
    .onMouseDown(_ => ctx.reader.moveCursorUnder(page))
}