import { vlist, vstack } from "flinker-dom"
import { LayoutLayer } from "../../../app/Application"
import { IVoc } from "../../../domain/DomainModel"
import { FontFamily } from "../../controls/Font"
import { DerTutorContext } from "../../../DerTutorContext"
import { theme } from "../../theme/ThemeManager"
import { LineInput } from "../../controls/Input"
import { LinkBtn } from "../../controls/Button"
import { Title } from "../../controls/Text"
import { ACTION_TIPS } from "../../../App"
import { Markdown } from "../../controls/Markdown"

export const VocListView = () => {
  const ctx = DerTutorContext.self
  const vm = ctx.vocListVM
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

      Title('Select a vocabulary').react(s => s.paddingLeft = '20px')

      vlist<IVoc>()
        .observe(vm.$vocs, 'recreateChildren')
        .observe(vm.$selectedVoc, 'affectsChildrenProps')
        .items(() => vm.$vocs.value)
        .itemRenderer(VocRenderer)
        .itemHash((item: IVoc) => item.id + item.name + ':' + (item === vm.$selectedVoc.value))
        .react(s => {
          s.fontFamily = FontFamily.MONO
          s.fontSize = theme().defMenuFontSize
          s.width = '100%'
          s.gap = '0'
        })

      Markdown()
        .react(s => {
          s.className = theme().id
          s.position = 'fixed'
          s.paddingHorizontal = '20px'
          s.left = theme().menuWidth + 10 + 'px'
          s.mode = 'md'
          s.fontSize = theme().defMenuFontSize
          s.textColor = theme().green
          s.text = ACTION_TIPS.trim()
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
  const ctx = DerTutorContext.self
  const vm = ctx.vocListVM
  return LinkBtn()
    .react(s => {
      s.wrap = false
      s.isSelected = vm.$selectedVoc.value === voc
      s.paddingRight = '5px'
      s.paddingLeft = '20px'
      s.text = voc.name
    })
    .onClick(() => {
      vm.$selectedVoc.value = voc
      vm.applySelection()
    })
}