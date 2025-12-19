import { h2, p, vlist, vstack } from "flinker-dom"
import { ILang } from "../../../domain/DomainModel"
import { FontFamily } from "../../controls/Font"
import { DertutorContext } from "../../../DertutorContext"
import { theme } from "../../theme/ThemeManager"

export const LangListView = () => {
  const ctx = DertutorContext.self
  const vm = ctx.langListVM
  return vstack()
    .react(s => {
      s.width = '100%'
      s.height = '100vh'
      s.halign = 'center'
      s.valign = 'center'
      s.paddingBottom = '100px'
      s.gap = '10px'
    }).children(() => {
      h2()
        .react(s => {
          s.textColor = theme().text
          s.paddingVertical = '50px'
          s.text = 'Select a language'
        })

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
    })
}

const LangRenderer = (lang: ILang) => {
  const ctx = DertutorContext.self
  const vm = ctx.langListVM
  return p()
    .react(s => {
      const selected = vm.$selectedLang.value === lang

      let textColor = theme().red

      s.fontSize = theme().defFontSize
      s.fontFamily = FontFamily.APP
      s.wrap = false
      s.width = '100%'
      s.textColor = selected ? theme().appBg : textColor
      s.bgColor = selected ? textColor : theme().transparent
      s.text = lang.name
      s.textAlign = 'center'
      s.textSelectable = false
    })
    .whenHovered(s => {
      s.textDecoration = 'underline'
    })
}
