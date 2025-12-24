import { btn, div, h2, hstack, spacer, vlist, vstack } from "flinker-dom"
import { LayoutLayer } from "../../../app/Application"
import { ILang, IVoc } from "../../../domain/DomainModel"
import { FontFamily } from "../../controls/Font"
import { DerTutorContext } from "../../../DerTutorContext"
import { theme } from "../../theme/ThemeManager"
import { LineInput } from "../../controls/Input"
import { Markdown } from "../../controls/Markdown"

const ACTION_TIPS = `
## [icon:lightbulb_outline] Tips
---
\`\`\`ul
+ You can navigate through menu items using arrows: →, ↓, →, ↑
+ To see more shortkeys, press ?
+ To create/edit/delete notes, you must have superuser rights.
\`\`\`
`

export const VocListView = () => {
  const ctx = DerTutorContext.self
  const vm = ctx.vocListVM
  return hstack()
    .react(s => {
      s.height = '100%'
      s.gap = '0px'
    }).children(() => {

      div()
        .react(s => {
          s.gap = '10px'
          s.paddingTop = theme().navBarHeight + 'px'
          s.paddingLeft = '20px'
          s.width = theme().menuWidth + 'px'
          s.height = window.innerHeight - theme().statusBarHeight + 'px'
          s.borderRight = '1px solid ' + theme().border
        })

      vstack()
        .react(s => {
          s.width = '100%'
          s.gap = '20px'
          s.paddingTop = theme().navBarHeight + 'px'
        }).children(() => {

          h2()
            .observe(vm.$selectedLang)
            .react(s => {
              s.textColor = theme().text50
              s.text = vm.$selectedLang.value ? 'Select a vocabulary' : 'Select a language'
              s.paddingLeft = '20px'
            })

          vlist<ILang>()
            .observe(vm.$langs, 'recreateChildren')
            .observe(vm.$selectedLang, 'affectsChildrenProps')
            .observe(vm.$highlightedLang, 'affectsChildrenProps')
            .items(() => vm.$langs.value)
            .itemRenderer(LangRenderer)
            .itemHash((item: ILang) => item.id + ':' + (item === vm.$selectedLang.value))
            .react(s => {
              s.width = '500px'
              s.maxWidth = theme().menuWidth + 'px'
              s.gap = '0'
            })

          vlist<IVoc>()
            .observe(vm.$selectedLang, 'recreateChildren')
            .observe(vm.$highlightedVoc, 'affectsChildrenProps')
            .items(() => vm.$selectedLang.value?.vocs ?? [])
            .itemRenderer(VocRenderer)
            .itemHash((item: IVoc) => item.id + item.name + ':' + (item === vm.$highlightedVoc.value))
            .react(s => {
              s.fontFamily = FontFamily.MONO
              s.fontSize = theme().defMenuFontSize
              s.width = '100%'
              s.gap = '0'
            })

          spacer().react(s => s.height = '20px')

          Markdown()
            .react(s => {
              s.className = theme().id
              s.paddingHorizontal = '20px'
              s.mode = 'md'
              s.position = 'absolute'
              s.bottom = theme().statusBarHeight + 20 + 'px'
              s.fontSize = theme().defMenuFontSize
              s.textColor = theme().green
              s.text = ACTION_TIPS.trim()
            })
        })

      LineInput(vm.bufferController.$buffer, vm.bufferController.$cursorPos)
        .observe(vm.$mode)
        .react(s => {
          const mode = vm.$mode.value
          s.visible = vm.$mode.value !== 'explore'
          s.position = 'fixed'
          s.width = '100%'
          s.height = theme().statusBarHeight + 'px'
          s.bottom = '0'
          s.title = mode === 'create' ? 'New:' : mode === 'rename' ? 'Rename:' : 'Input:'
          s.layer = LayoutLayer.MODAL
        })
    })
}

const LangRenderer = (lang: ILang) => {
  const ctx = DerTutorContext.self
  const vm = ctx.vocListVM
  return btn()
    .react(s => {
      const isSelected = vm.$selectedLang.value === lang
      const isHighlighted = vm.$highlightedLang.value === lang
      s.wrap = false
      s.isSelected = isSelected || isHighlighted
      s.paddingHorizontal = '20px'
      s.textAlign = 'left'
      s.text = lang.name
      s.textColor = theme().red + 'cc'
      s.bgColor = theme().appBg
    })
    .whenHovered(s => {
      s.textColor = theme().red
    })
    .whenSelected(s => {
      s.textColor = theme().appBg
      s.bgColor = theme().red + 'cc'
    })
    .onClick(() => {
      vm.$selectedLang.value = undefined
      vm.$highlightedLang.value = lang
      vm.applySelection()
    })
}

const VocRenderer = (voc: IVoc, index: number) => {
  const ctx = DerTutorContext.self
  const vm = ctx.vocListVM
  return btn()
    .react(s => {
      s.wrap = false
      s.isSelected = vm.$highlightedVoc.value === voc
      s.paddingRight = '5px'
      s.paddingLeft = '20px'
      s.text = index + 1 + '. ' + voc.name
      s.textColor = theme().blue + 'cc'
      s.bgColor = theme().appBg
    })
    .whenHovered(s => {
      s.textColor = theme().blue
    })
    .whenSelected(s => {
      s.textColor = theme().appBg
      s.bgColor = theme().blue + 'cc'
    })
    .onClick(() => {
      vm.$highlightedVoc.value = voc
      vm.applySelection()
    })
}