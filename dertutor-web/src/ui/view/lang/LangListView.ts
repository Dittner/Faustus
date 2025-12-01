import { hstack, p, spacer, span, vlist, vstack } from "flinker-dom"
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
  return vstack()
    .react(s => {
      s.width = '100%'
      s.height = '100vh'
      s.halign = 'center'
      s.valign = 'center'
      s.gap = '10px'
    }).children(() => {
      hstack()
        .react(s => {
          s.position = 'fixed'
          s.top = '0'
          s.width = '100%'
          s.paddingHorizontal = '20px'
          s.halign = 'left'
          s.valign = 'center'
        })
        .children(() => {
          HelpAction('→', 'Next')
          spacer()
          HelpAction('←', 'Prev')
          spacer()
          HelpAction('<Enter>', 'Accept')
          spacer()
          HelpAction('T', 'Switch theme')
          spacer()
          HelpAction('?', 'Help')
        })

      vlist<Lang>()
        .observe(vm.$allLangs, 'recreateChildren')
        .observe(ctx.$selectedLang, 'affectsChildrenProps')
        .items(() => vm.$allLangs.value)
        .itemRenderer(LangRenderer)
        .itemHash((item: Lang) => item.id + ':' + (item === ctx.$selectedLang.value))
        .react(s => {
          s.width = '100%'
          s.maxWidth = theme().menuWidth + 'px'
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
            s.text = 'Select a language'
          })

        spacer()

        MessangerView()
      })
    })
}


const HelpAction = (cmd: string, desc: string) => {
  return p()
    .react(s => {
      s.fontSize = theme().defMenuFontSize
      s.fontFamily = FontFamily.APP
      s.paddingVertical = '5px'
      s.whiteSpace = 'nowrap'
    }).children(() => {
      span()
        .react(s => {
          s.text = desc
          s.textColor = theme().text
          s.whiteSpace = 'nowrap'
        })

      span().react(s => {
        s.display = 'inline-block'
        s.text = cmd
        s.textColor = theme().header
        s.whiteSpace = 'nowrap'
        s.paddingLeft = '5px'
      })
    })
}