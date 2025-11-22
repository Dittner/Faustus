import { div, p, span, vlist, vstack } from "flinker-dom"
import { ActionsHelpView, MessangerView } from "../../../App"
import { LayoutLayer } from "../../../app/Application"
import { Lang } from "../../../domain/DomainModel"
import { FontFamily } from "../../controls/Font"
import { StatusBar, StatusBarModeName } from "../../controls/StatusBar"
import { DertutorContext } from "../../DertutorContext"
import { theme } from "../../theme/ThemeManager"
import { IViewModel } from "../ViewModel"

export const LangListView = () => {
  const ctx = DertutorContext.self
  const vm = ctx.langListVM
  return div()
    .react(s => {
      s.width = '100%'
      s.gap = '10px'
    }).children(() => {

      vlist<Lang>()
        .observe(vm.$allLangs, 'recreateChildren')
        .observe(ctx.$selectedLang, 'affectsChildrenProps')
        .items(() => vm.$allLangs.value)
        .itemRenderer(LangRenderer)
        .itemHash((item: Lang) => item.id + ':' + (item === ctx.$selectedLang.value))
        .react(s => {
          s.className = 'listScrollbar'
          s.enableOwnScroller = true
          s.width = '200px'
          s.height = '100vh'
          s.paddingBottom = theme().statusBarHeight - 40 + 'px'
          s.gap = '0'
        })

      Footer(vm)
        .react(s => {
          s.position = 'fixed'
          s.width = '100%'
          s.bottom = '0'
          s.left = '0'
          s.layer = LayoutLayer.MODAL
        })
    })
}

const LangRenderer = (lang: Lang) => {
  const ctx = DertutorContext.self
  return p()
    .react(s => {
      const selected = ctx.$selectedLang.value === lang

      let textColor = theme().menuNormal
      if (lang.code === 'de')
        textColor = theme().menuDe
      else if (lang.code === 'en')
        textColor = theme().menuEn

      s.fontSize = theme().defMenuFontSize
      s.fontFamily = FontFamily.MONO
      s.wrap = false
      s.width = '100%'
      s.padding = '5px'
      s.textColor = selected ? theme().appBg : textColor
      s.bgColor = selected ? textColor : theme().transparent
      s.text = lang.code.toLocaleUpperCase()
      s.textSelectable = false
    })
    .whenHovered(s => {
      s.textDecoration = 'underline'
    })
}

const Footer = (vm: IViewModel) => {
  return vstack()
    .react(s => {
      s.gap = '0'
    })
    .children(() => {

      ActionsHelpView(vm)
      StatusBar().children(() => {

        StatusBarModeName()
          .react(s => {
            s.text = vm.id.toUpperCase()
          })

        span()
          .react(s => {
            s.text = ''
            s.textColor = theme().statusFg
            s.width = '100%'
          })

        MessangerView()
      })
    })
}
