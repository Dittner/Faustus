import { p, vlist } from "flinker-dom"
import { Page, TextFile } from "../../../domain/DomainModel"
import { theme } from "../../theme/ThemeManager"
import { IndexContext } from "../../IndexContext"
import { FontFamily } from "../../controls/Font"

export const PageHeaderListView = (file: TextFile) => {
  console.log('new FileHeaderListView')
  const ctx = IndexContext.self

  return vlist<Page>()
    .observe(file, 'recreateChildren')
    .observe(ctx.reader.$selectedPage, 'affectsChildrenProps')
    .items(() => file.pages)
    .itemRenderer(PageHeaderRenderer)
    .itemHash((p: Page) => p.uid + '#' + p.header + ':' + (p === ctx.reader.$selectedPage.value))
}

const PageHeaderRenderer = (page: Page) => {
  const ctx = IndexContext.self
  const textColor = '#5a8f9a'
  const bgColor = theme().appBg
  const host = p()
  return host
    .observe(page)
    .react(s => {
      // updated when selected item has changed
      const underCurser = ctx.reader.$selectedPage.value === page
      if (underCurser) {
        host.dom.scrollIntoView({
          behavior: 'instant',
          block: 'center'
        })
      }
      //s.width = '100%'
      s.textSelectable = false
      s.fontSize = theme().defMenuFontSize
      s.fontFamily = FontFamily.MONO
      s.textColor = underCurser ? bgColor : textColor
      s.bgColor = underCurser ? textColor : bgColor
      s.padding = '2px'
      s.paddingLeft = page.headerLevel * 20 + 'px'
      s.wrap = false
      s.text = page.header
    })
    .whenHovered(s => {
      s.cursor = 'pointer'
    })
    .onMouseDown(_ => ctx.reader.moveCursorUnder(page))
}