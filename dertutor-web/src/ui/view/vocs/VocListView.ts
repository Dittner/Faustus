import { div, p, span, vlist, vstack } from "flinker-dom"
import { ActionsHelpView, MessangerView } from "../../../App"
import { LayoutLayer } from "../../../app/Application"
import { Vocabulary } from "../../../domain/DomainModel"
import { FontFamily } from "../../controls/Font"
import { StatusBar, StatusBarModeName } from "../../controls/StatusBar"
import { DertutorContext } from "../../DertutorContext"
import { theme } from "../../theme/ThemeManager"
import { IViewModel } from "../ViewModel"

export const VocListView = () => {
  const ctx = DertutorContext.self
  const vm = ctx.vocListVM
  return div()
    .react(s => {
      s.width = '100%'
      s.gap = '10px'
    }).children(() => {

      vlist<Vocabulary>()
        .observe(vm.$vocs, 'recreateChildren')
        .observe(ctx.$selectedVoc, 'affectsChildrenProps')
        .items(() => vm.$vocs.value)
        .itemRenderer(VocRenderer)
        .itemHash((item: Vocabulary) => item.id + ':' + (item === ctx.$selectedVoc.value))
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
const VocRenderer = (voc: Vocabulary) => {
  const ctx = DertutorContext.self
  return p().react(s => {
    const underCurser = ctx.$selectedVoc.value === voc
    // if (underCurser) {
    //   host.dom.scrollIntoView({
    //     behavior: 'instant',
    //     block: 'center'
    //   })
    // }

    const textColor = theme().menuFocused
    const bgColor = theme().appBg
    s.fontSize = theme().defMenuFontSize
    s.fontFamily = FontFamily.MONO
    s.wrap = false
    s.padding = '5px'
    s.textColor = underCurser ? bgColor : textColor
    s.bgColor = underCurser ? textColor : theme().transparent
    s.text = voc.name
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
