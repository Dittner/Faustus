import { div, p, vlist, vstack } from "flinker-dom"
import { ILang } from "../../../domain/DomainModel"
import { FontFamily } from "../../controls/Font"
import { DertutorContext } from "../../../DertutorContext"
import { theme } from "../../theme/ThemeManager"
import { ACTION_TIPS } from "../../../App"
import { Title } from "../../controls/Text"
import { LinkBtn } from "../../controls/Button"

export const LangListView = () => {
  const ctx = DertutorContext.self
  const vm = ctx.langListVM
  return vstack()
    .react(s => {
      s.className = 'listScrollbar'
      s.position = 'fixed'
      s.left = '0'
      s.top = '0'
      s.gap = '0'
      s.paddingTop = theme().navBarHeight + 'px'
      s.width = theme().menuWidth + 'px'
      s.height = window.innerHeight - theme().statusBarHeight + 'px'
      s.enableOwnScroller = true
      s.borderRight = '1px solid ' + theme().border
    }).children(() => {

      Title('Select a language').react(s => s.paddingLeft = '20px')

      vlist<ILang>()
        .observe(vm.$langs, 'recreateChildren')
        .observe(vm.$selectedLang, 'affectsChildrenProps')
        .items(() => vm.$langs.value)
        .itemRenderer(LangRenderer)
        .itemHash((item: ILang) => item.id + ':' + (item === vm.$selectedLang.value))
        .react(s => {
          s.width = '100%'
          s.maxWidth = theme().menuWidth + 'px'
          s.paddingBottom = theme().statusBarHeight - 40 + 'px'
          s.gap = '0'
        })

      div()
        .react(s => {
          s.position = 'fixed'
          s.width = '100%'
          s.textAlign = 'center'
          s.fontFamily = FontFamily.APP
          s.bottom = window.innerHeight / 2 + 'px'
          s.fontSize = theme().defMenuFontSize
          s.textColor = theme().text50
        })
        .children(() => {
          ACTION_TIPS.split('\n').forEach(tip => {
            p().react(s => s.text = tip)
          })
        })
    })
}

const LangRenderer = (lang: ILang) => {
  const ctx = DertutorContext.self
  const vm = ctx.langListVM
  return LinkBtn()
    .react(s => {
      s.wrap = false
      s.isSelected = vm.$selectedLang.value === lang
      s.paddingRight = '2px'
      s.paddingLeft = '20px'
      s.text = lang.name
      s.textColor = theme().red + 'cc'
    })
    .whenHovered(s => {
      s.textColor = theme().red
    })
    .whenSelected(s => {
      s.textColor = theme().appBg
      s.bgColor = theme().red + 'cc'
    })
    .onClick(() => {
      vm.$selectedLang.value = lang
      vm.applySelection()
    })
}
