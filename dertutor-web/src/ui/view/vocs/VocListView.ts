import { p, span, vlist, vstack } from "flinker-dom"
import { ActionsHelpView, MessangerView } from "../../../App"
import { LayoutLayer } from "../../../app/Application"
import { Vocabulary } from "../../../domain/DomainModel"
import { FontFamily } from "../../controls/Font"
import { StatusBar, StatusBarModeName } from "../../controls/StatusBar"
import { DertutorContext } from "../../DertutorContext"
import { theme } from "../../theme/ThemeManager"
import { IViewModel } from "../ViewModel"
import { LineInput } from "../../controls/Input"

export const VocListView = () => {
  const ctx = DertutorContext.self
  const vm = ctx.vocListVM
  return vstack()
    .react(s => {
      s.width = '100%'
      s.height = '100vh'
      s.gap = '10px'
      s.width = '100%'
      s.halign = 'center'
      s.valign = 'center'
    }).children(() => {

      vlist<Vocabulary>()
        .observe(vm.$vocs, 'recreateChildren')
        .observe(ctx.$selectedVoc, 'affectsChildrenProps')
        .items(() => vm.$vocs.value)
        .itemRenderer(VocRenderer)
        .itemHash((item: Vocabulary) => item.id + item.name + ':' + (item === ctx.$selectedVoc.value))
        .react(s => {
          s.className = 'listScrollbar'
          s.enableOwnScroller = true
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

      LineInput(vm.bufferController.$buffer, vm.bufferController.$cursorPos)
        .observe(vm.$mode)
        .react(s => {
          const mode = vm.$mode.value
          s.visible = vm.$mode.value !== 'explore'
          s.title = mode === 'create' ? 'New:' : mode === 'rename' ? 'Rename:' : 'Input:'
          s.position = 'fixed'
          s.width = '100%'
          s.height = theme().statusBarHeight + 'px'
          s.bottom = '0'
          s.layer = LayoutLayer.MODAL
        })
    })
}
const VocRenderer = (voc: Vocabulary) => {
  const ctx = DertutorContext.self
  return p().react(s => {
    const selected = ctx.$selectedVoc.value === voc
    // if (underCurser) {
    //   host.dom.scrollIntoView({
    //     behavior: 'instant',
    //     block: 'center'
    //   })
    // }

    const textColor = theme().menu
    const bgColor = theme().appBg
    s.fontSize = theme().defFontSize
    s.fontFamily = FontFamily.APP
    s.wrap = false
    s.width = '100%'
    s.textColor = selected ? bgColor : textColor
    s.textAlign = 'center'
    s.bgColor = selected ? textColor : theme().transparent
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
            s.text = 'Select a vocabulary'
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
