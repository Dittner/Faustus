import { h2, p, vlist, vstack } from "flinker-dom"
import { LayoutLayer } from "../../../app/Application"
import { IVoc } from "../../../domain/DomainModel"
import { FontFamily } from "../../controls/Font"
import { DertutorContext } from "../../../DertutorContext"
import { theme } from "../../theme/ThemeManager"
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
      s.paddingBottom = '100px'
    }).children(() => {

      h2()
        .react(s => {
          s.textColor = theme().text
          s.paddingVertical = '50px'
          s.text = 'Select a vocabulary'
        })

      vlist<IVoc>()
        .observe(vm.$vocs, 'recreateChildren')
        .observe(vm.$selectedVoc, 'affectsChildrenProps')
        .items(() => vm.$vocs.value)
        .itemRenderer(VocRenderer)
        .itemHash((item: IVoc) => item.id + item.name + ':' + (item === vm.$selectedVoc.value))
        .react(s => {
          s.className = 'listScrollbar'
          s.enableOwnScroller = true
          s.width = '100%'
          s.maxWidth = theme().menuWidth + 'px'
          s.paddingBottom = theme().statusBarHeight - 40 + 'px'
          s.gap = '0'
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
const VocRenderer = (voc: IVoc) => {
  const ctx = DertutorContext.self
  const vm = ctx.vocListVM
  return p().react(s => {
    const selected = vm.$selectedVoc.value === voc
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
