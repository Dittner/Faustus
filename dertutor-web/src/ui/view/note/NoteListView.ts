import { hstack, input, link, p, spacer, span, switcher, vlist, vstack } from "flinker-dom"
import { globalContext } from "../../../App"
import { LayoutLayer } from "../../../app/Application"
import { INote, ITag } from "../../../domain/DomainModel"
import { Btn } from "../../controls/Button"
import { FontFamily } from "../../controls/Font"
import { LineInput } from "../../controls/Input"
import { Markdown } from "../../controls/Markdown"
import { DertutorContext } from "../../../DertutorContext"
import { MaterialIcon } from "../../icons/MaterialIcon"
import { theme } from "../../theme/ThemeManager"

export const NoteListView = () => {
  const ctx = DertutorContext.self
  const vm = ctx.noteListVM
  return hstack()
    .react(s => {
      s.width = '100%'
      s.gap = '10px'
      s.paddingLeft = theme().menuWidth + 10 + 'px'
      s.paddingBottom = theme().statusBarHeight + 'px'
    }).children(() => {

      NotesMenu()

      PlayAudioBtn()
        .observe(vm.$selectedNote)
        .react(s => {
          const hasAudio = vm.$selectedNote.value !== undefined && vm.$selectedNote.value.audio_url !== ''
          s.mouseEnabled = hasAudio
          s.position = 'relative'
          s.top = '112px'
          s.opacity = hasAudio ? '1' : '0'
        })

      vstack()
        .react(s => {
          s.width = '100%'
          s.gap = '0'
          s.paddingTop = theme().navBarHeight + 'px'
          s.maxWidth = theme().maxNoteViewWidth - 10 + 'px'
        })
        .children(() => {
          hstack()
            .react(s => {
              s.width = '100%'
              s.valign = 'center'
              s.halign = 'stretch'
              s.paddingBottom = '50px'
            })
            .children(() => {
              NavBar()
              NoteMeta()
            })

          Markdown()
            .observe(vm.$selectedNote)
            .observe(vm.$searchKey)
            .react(s => {
              s.className = theme().id
              s.mode = 'md'
              s.fontFamily = FontFamily.ARTICLE
              s.textColor = theme().text
              s.width = '100%'
              s.mark = vm.$searchKey.value
              s.text = vm.$selectedNote.value?.text ?? ''
              s.fontSize = theme().defFontSize
              s.absolutePathPrefix = globalContext.server.baseUrl
              //s.showRawText = page.file.showRawText
            })
        })

      FiltersView()
        .react(s => {
          s.position = 'fixed'
          s.top = theme().navBarHeight + 'px'
          s.left = theme().menuWidth + theme().maxNoteViewWidth + 100 + 'px'
          s.valign = 'center'
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
          s.left = '0'
          s.bottom = '0'
          s.layer = LayoutLayer.MODAL
        })
    })
}

const NotesMenu = () => {
  const ctx = DertutorContext.self
  const vm = ctx.noteListVM
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
    })
    .children(() => {

      Title('')
        .observe(vm.$page)
        .react(s => {
          const p = vm.$page.value
          s.text = p && p.pages > 0 ? `Page: ${p.page} of ${p.pages}` : 'No pages'
          s.paddingLeft = '20px'
        })

      vlist<INote>()
        .observe(vm.$page, 'recreateChildren')
        .observe(vm.$selectedNote, 'affectsChildrenProps')
        .items(() => vm.$page.value?.items ?? [])
        .itemRenderer(NoteRenderer)
        .itemHash((item: INote) => item.id + item.name + ':' + (item.id === vm.$selectedNote.value?.id))
        .react(s => {
          s.fontFamily = FontFamily.MONO
          s.fontSize = theme().defMenuFontSize
          s.width = '100%'
          s.gap = '0'
        })

      NotesPaginator()

    })
}

const NotesPaginator = () => {
  const ctx = DertutorContext.self
  const vm = ctx.noteListVM
  return hstack()
    .observe(vm.$page, 'affectsChildrenProps')
    .react(s => {
      s.width = '100%'
      s.gap = '10px'
      s.valign = 'center'
      s.halign = 'left'
      s.paddingHorizontal = '20px'
      s.minHeight = '30px'
      s.fontFamily = FontFamily.MONO
    })
    .children(() => {

      Btn()
        .react(s => {
          const p = vm.$page.value
          s.visible = p && p.page > 1
          s.text = '1'
          s.wrap = false
          s.popUp = 'First page'
        })
        .onClick(() => vm.$page.value && vm.reloadPage(1))

      Btn()
        .react(s => {
          const p = vm.$page.value
          s.visible = p && p.page > 2
          s.text = p ? `${p.page - 1}` : ''
          s.wrap = false
          s.popUp = 'Prev page'
          s.href = vm.getPageLink(p ? p.page + 1 : 1)
        })
        .onClick(() => vm.$page.value && vm.reloadPage(vm.$page.value.page - 1))

      p()
        .react(s => {
          const p = vm.$page.value
          s.visible = p && p.pages > 0
          s.text = p ? `${p.page}` : ''
          s.fontFamily = FontFamily.APP
          s.fontSize = theme().defMenuFontSize
          s.cornerRadius = '2px'
          s.textSelectable = false
          s.textColor = theme().btn + 'cc'
        })

      Btn()
        .react(s => {
          const p = vm.$page.value
          s.visible = p && p.page < p.pages - 1
          s.text = p ? `${p.page + 1}` : ''
          s.wrap = false
          s.popUp = 'Next page'
          s.href = vm.getPageLink(p ? p.page + 1 : 1)
        })
        .onClick(() => vm.$page.value && vm.reloadPage(vm.$page.value.page + 1))

      Btn()
        .react(s => {
          const p = vm.$page.value
          s.visible = p && p.page < p.pages
          s.text = p ? `${p.pages}` : ''
          s.wrap = false
          s.popUp = 'Last page'
        })
        .onClick(() => vm.$page.value && vm.reloadPage(vm.$page.value.pages))
    })
}

const NoteRenderer = (n: INote) => {
  const ctx = DertutorContext.self
  const vm = ctx.noteListVM
  return link()
    .react(s => {
      const selected = vm.$selectedNote.value?.id === n.id
      const textColor = theme().menu
      const bgColor = theme().appBg
      s.wrap = false
      s.padding = '2px'
      s.paddingLeft = '20px'
      s.textColor = selected ? bgColor : textColor
      s.bgColor = selected ? textColor : theme().transparent
      s.text = n.name
      s.href = vm.getNoteLink(n)
    })
    .whenHovered(s => {
      s.textDecoration = 'underline'
    })
    .onClick(e => {
      e.preventDefault()
      vm.selectNote(n)
    })
}

const NavBar = () => {
  const ctx = DertutorContext.self
  const vm = ctx.noteListVM
  return hstack()
    .observe(ctx.navigator.$keys, 'affectsChildrenProps')
    .observe(ctx.$allLangs, 'affectsChildrenProps')
    .react(s => {
      s.gap = '10px'
      s.whiteSpace = 'nowrap'
      s.fontSize = theme().defMenuFontSize
      s.textSelectable = false
    })
    .children(() => {
      NavBarLink()
        .react(s => {
          const langCode = ctx.$allLangs.value.find(l => l.code === ctx.navigator.$keys.value.langCode)?.code
          s.text = langCode ?? ''
          s.href = ctx.navigator.buildUrl({ langCode })
        })
        .onClick((e) => {
          e.preventDefault()
          const langCode = ctx.$allLangs.value.find(l => l.code === ctx.navigator.$keys.value.langCode)?.code
          if (langCode) {
            ctx.navigator.navigateTo({ langCode })
            ctx.langListVM.activate()
          }
        })

      span()
        .react(s => {
          s.visible = ctx.navigator.$keys.value.vocCode !== undefined
          s.text = ' › '
          s.textColor = theme().link + 'bb'
        })

      NavBarLink()
        .react(s => {
          const k = ctx.navigator.$keys.value
          const lang = ctx.$allLangs.value.find(l => l.code === k.langCode)
          const voc = lang?.vocs.find(v => vm.encodeName(v) === k.vocCode)
          s.text = voc?.name ?? ''
          s.href = ctx.navigator.buildUrl({ langCode: lang?.code, vocCode: voc && vm.encodeName(voc) })
        })
        .onClick((e) => {
          e.preventDefault()
          const langCode = ctx.navigator.$keys.value.langCode
          const vocCode = ctx.navigator.$keys.value.vocCode
          if (langCode && vocCode) {
            ctx.navigator.navigateTo({ langCode, vocCode })
            ctx.vocListVM.activate()
          }
        })
    })
}

const NavBarLink = () => {
  return link()
    .react(s => {
      s.textColor = theme().link + 'bb'
    }).whenHovered(s => {
      s.textColor = theme().link
      s.cursor = 'pointer'
    })
}

const PlayAudioBtn = () => {
  const ctx = DertutorContext.self
  const vm = ctx.noteListVM
  return Btn()
    .react(s => {
      s.icon = MaterialIcon.volume_up
      s.width = '40px'
      s.height = '40px'
    })
    .onClick(() => vm.playAudio())
}

const NoteMeta = () => {
  const ctx = DertutorContext.self
  const vm = ctx.noteListVM
  return p()
    .observe(vm.$selectedNote)
    .react(s => {
      const level = vm.$selectedNote.value ? vm.reprLevel(vm.$selectedNote.value.level) : ''
      const tag = vm.reprTag(vm.$selectedNote.value?.tag_id)
      s.text = ''
      if (level && tag) s.text += level + ', ' + tag
      else if (level) s.text += level
      else if (tag) s.text += tag
      s.fontFamily = FontFamily.APP
      s.fontSize = theme().defMenuFontSize
      s.fontStyle = 'italic'
      s.paddingHorizontal = '10px'
      s.textColor = theme().pynk
    })
}

const FiltersView = () => {
  const ctx = DertutorContext.self
  const vm = ctx.noteListVM
  return vstack()
    .react(s => {
      s.gap = '0'
      s.width = '300px'
      s.paddingLeft = '20px'
      s.borderLeft = '1px solid ' + theme().border
    })
    .children(() => {
      Title('Filter by level:')
      LevelsBar()

      spacer().react(s => s.height = '10px')

      Title('Filter by tag:')
      TagSelector()

      spacer().react(s => s.height = '10px')

      Title('Search:')
      input()
        .bind(vm.$searchBuffer)
        .react(s => {
          s.type = 'text'
          s.width = '100%'
          s.fontFamily = FontFamily.APP
          s.fontSize = theme().defMenuFontSize
          s.textColor = theme().blue
          s.cornerRadius = '4px'
          s.paddingHorizontal = '10px'
          s.autoCorrect = 'off'
          s.autoComplete = 'off'
          s.border = '1px solid ' + theme().text + '40'
        })
        .whenFocused(s => {
          s.border = '1px solid ' + theme().blue
        }).onKeyDown(e => {
          if (e.key === 'Enter') vm.$searchKey.value = vm.$searchBuffer.value
        })

      spacer().react(s => s.height = '10px')

      hstack()
        .react(s => {
          s.gap = '10px'
        })
        .children(() => {
          switcher()
            .observe(vm.$searchGlobally)
            .react(s => {
              s.isSelected = vm.$searchGlobally.value
              s.trackColor = theme().text50
            })
            .whenSelected(s => {
              s.trackColor = theme().yellow
            })
            .onClick(() => vm.$searchGlobally.value = !vm.$searchGlobally.value)

          p().react(s => {
            s.textColor = theme().text50
            s.fontSize = theme().defMenuFontSize
            s.text = 'Search globally'
          })
        })
    })
}

const Title = (value: string) => {
  return p().react(s => {
    s.textColor = theme().text
    s.fontFamily = FontFamily.APP
    s.fontSize = theme().defMenuFontSize
    s.text = value
    s.fontWeight = 'bold'
  })
}

const LevelsBar = () => {
  const vm = DertutorContext.self.noteListVM
  return vlist<number>()
    .observe(vm.$level, 'affectsChildrenProps')
    .items(() => [1, 2, 3, 4, 5, 6])
    .itemRenderer(LevelRenderer)
    .itemHash((item: number) => item + ':' + (item === vm.$level.value))
    .react(s => {
      s.gap = '10px'
      s.width = '100%'
      s.halign = 'left'
      s.paddingLeft = '20px'
    })
}

const LevelRenderer = (level: number) => {
  const vm = DertutorContext.self.noteListVM
  return Btn()
    .react(s => {
      s.isSelected = vm.$level.value === level
      s.fontSize = theme().defMenuFontSize
      s.fontFamily = FontFamily.APP
      s.wrap = false
      s.textColor = theme().text50
      s.text = vm.reprLevel(level)
      s.textAlign = 'left'
      s.textSelectable = false
    })
    .whenHovered(s => {
      s.textColor = theme().text
    })
    .whenSelected(s => {
      s.textColor = theme().btn + 'cc'
    })
    .onClick(() => vm.$level.value = vm.$level.value === level ? undefined : level)
}


const TagSelector = () => {
  const vm = DertutorContext.self.noteListVM
  return vstack()
    .observe(vm.$tagId, 'affectsChildrenProps')
    .react(s => {
      s.gap = '10px'
      s.width = '100%'
      s.paddingLeft = '20px'
      s.fontFamily = FontFamily.APP
      s.halign = 'left'
    })
    .children(() => {
      const lang = vm.$selectedLang.value
      if (lang) lang.tags.forEach(t => TagRenderer(t))
    })
}

const TagRenderer = (t: ITag) => {
  const vm = DertutorContext.self.noteListVM
  return span()
    .react(s => {
      const isSelected = vm.$tagId.value === t.id
      const color = isSelected ? theme().btn + 'cc' : theme().text50
      s.textColor = color
      s.textSelectable = false
      s.fontSize = theme().defMenuFontSize
      s.fontFamily = FontFamily.APP
      s.text = t.name
      s.width = '100%'
    })
    .whenHovered(s => {
      const isSelected = vm.$tagId.value === t.id
      const color = isSelected ? theme().btn + 'cc' : theme().text
      s.textColor = color
      s.cursor = 'pointer'
    })
    .onClick(() => vm.$tagId.value = vm.$tagId.value === t.id ? undefined : t.id)
}