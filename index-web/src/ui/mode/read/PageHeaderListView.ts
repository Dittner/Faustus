import { btn, vlist } from "flinker-dom"
import { Page, TextFile } from "../../../domain/DomainModel"
import { theme } from "../../theme/ThemeManager"
import { IndexContext } from "../../IndexContext"
import { FontFamily } from "../../controls/Font"
import { log } from "../../../app/Logger"

export const PageHeaderListView = (file: TextFile) => {
  log('new FileHeaderListView')
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

  return btn()
    .observe(page)
    .react(s => {
      s.isSelected = ctx.reader.$selectedPage.value === page
      s.fontSize = theme().fontSizeXS
      s.fontFamily = FontFamily.APP
      s.textColor = theme().menuPage + 'bb'
      s.paddingRight = '5px'
      s.width = '100%'

      if (page.headerLevel === 0)
        s.paddingLeft = '0px'
      else if (page.headerLevel === 1)
        s.paddingLeft = '20px'
      else
        s.paddingLeft = (page.headerLevel - 1) * 20 + 'px'

      s.paddingVertical = '3px'
      s.wrap = true
      s.whiteSpace = 'normal'
      s.textAlign = 'left'
      s.text = page.header.length > 80 ? page.header.substring(0, 80) + '...' : page.header
      s.lineHeight = '1rem'
    })
    .whenHovered(s => s.textColor = theme().menuPage)
    .whenSelected(s => s.textColor = theme().accent)
    .onMouseDown(_ => ctx.reader.moveCursorUnder(page))
}