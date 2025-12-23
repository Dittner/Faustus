import { hstack, input, p, spacer, span, vlist, vstack } from "flinker-dom"
import { globalContext } from "../../../App"
import { LayoutLayer } from "../../../app/Application"
import { INote, ITag } from "../../../domain/DomainModel"
import { Btn, LinkBtn } from "../../controls/Button"
import { FontFamily } from "../../controls/Font"
import { LineInput } from "../../controls/Input"
import { Markdown } from "../../controls/Markdown"
import { DertutorContext } from "../../../DertutorContext"
import { MaterialIcon } from "../../icons/MaterialIcon"
import { theme } from "../../theme/ThemeManager"
import { Title } from "../../controls/Text"

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
        .observe(vm.$state)
        .react(s => {
          const hasAudio = vm.$state.value.selectedNote !== undefined && vm.$state.value.selectedNote.audio_url !== ''
          s.mouseEnabled = hasAudio
          s.position = 'relative'
          s.top = '120px'
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
            .observe(vm.$state)
            .react(s => {
              const searchKey = vm.$state.value.searchKey ?? ''
              s.className = theme().id
              s.mode = 'md'
              s.fontFamily = FontFamily.ARTICLE
              s.textColor = theme().text
              s.width = '100%'
              s.mark = searchKey.length > 1 ? searchKey : ''
              s.text = vm.$state.value.selectedNote?.text ?? ''
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
        .observe(vm.$state)
        .react(s => {
          const p = vm.$state.value.page
          s.text = p && p.pages > 0 ? `Page: ${p.page} of ${p.pages}` : 'No pages'
          s.paddingLeft = '20px'
        })

      vlist<INote>()
        .observe(vm.$state.pipe().map(s => s.page).removeDuplicates().fork(), 'recreateChildren')
        .observe(vm.$state.pipe().map(s => s.selectedNote?.id).removeDuplicates().fork(), 'affectsChildrenProps')
        .items(() => vm.$state.value.page?.items ?? [])
        .itemRenderer(NoteRenderer)
        .itemHash((item: INote) => item.id + item.name + ':' + (item.id === vm.$state.value.selectedNote?.id))
        .react(s => {
          s.fontFamily = FontFamily.MONO
          s.fontSize = theme().defMenuFontSize
          s.width = '100%'
          s.gap = '0'
        })

      NotesPaginator()

    })
}

const NoteRenderer = (n: INote) => {
  const ctx = DertutorContext.self
  const vm = ctx.noteListVM
  return LinkBtn()
    .react(s => {
      s.wrap = false
      s.isSelected = vm.$state.value.selectedNote?.id === n.id
      s.paddingRight = '2px'
      s.paddingLeft = '20px'
      s.text = n.name
    })
    .onClick(() => {
      vm.reloadWithNote(n)
    })
}

const NotesPaginator = () => {
  const ctx = DertutorContext.self
  const vm = ctx.noteListVM
  return hstack()
    .observe(vm.$state, 'affectsChildrenProps')
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
          const p = vm.$state.value.page
          s.visible = p && p.page > 1
          s.text = '1'
          s.wrap = false
          s.popUp = 'First page'
        })
        .onClick(() => vm.reloadWith({ page: 1 }))

      Btn()
        .react(s => {
          const p = vm.$state.value.page
          s.visible = p && p.page > 2
          s.text = p ? `${p.page - 1}` : ''
          s.wrap = false
          s.popUp = 'Prev page'
          //s.href = vm.getPageLink(p ? p.page + 1 : 1)
        })
        .onClick(() => {
          const p = vm.$state.value.page
          p && p.page > 0 && vm.reloadWith({ page: p.page - 1 })
        })

      p()
        .react(s => {
          const p = vm.$state.value.page
          s.visible = p && p.pages > 0
          s.text = p ? `${p.page}` : ''
          s.fontFamily = FontFamily.APP
          s.fontSize = theme().defMenuFontSize
          s.cornerRadius = '2px'
          s.textSelectable = false
          s.textColor = theme().accent + 'cc'
        })

      Btn()
        .react(s => {
          const p = vm.$state.value.page
          s.visible = p && p.page < p.pages - 1
          s.text = p ? `${p.page + 1}` : ''
          s.wrap = false
          s.popUp = 'Next page'
          //s.href = vm.getPageLink(p ? p.page + 1 : 1)
        })
        .onClick(() => {
          const p = vm.$state.value.page
          p && p.page < p.pages && vm.reloadWith({ page: p.page + 1 })
        })

      Btn()
        .react(s => {
          const p = vm.$state.value.page
          s.visible = p && p.page < p.pages
          s.text = p ? `${p.pages}` : ''
          s.wrap = false
          s.popUp = 'Last page'
        })
        .onClick(() => {
          const p = vm.$state.value.page
          p && vm.reloadWith({ page: p.pages })
        })
    })
}

const NavBar = () => {
  const ctx = DertutorContext.self
  const vm = ctx.noteListVM
  return hstack()
    .observe(vm.$state, 'affectsChildrenProps')
    .react(s => {
      s.gap = '10px'
      s.whiteSpace = 'nowrap'
      s.fontSize = theme().defMenuFontSize
      s.fontFamily = FontFamily.MONO
      s.valign = 'center'
      s.textSelectable = false
    })
    .children(() => {
      LinkBtn()
        .react(s => {
          s.text = vm.$state.value.lang?.name ?? ''
        }).onClick(() => {
          vm.$state.value.lang && vm.navigator.navigateTo({ langCode: vm.$state.value.lang?.code })
        })

      span()
        .react(s => {
          const lang = vm.$state.value.lang
          const voc = vm.$state.value.voc ?? lang?.vocs.find(v => v.id === vm.$state.value.selectedNote?.voc_id)
          s.visible = lang !== undefined && voc !== undefined
          s.text = ' › '
          s.textColor = theme().link + 'bb'
        })

      LinkBtn()
        .react(s => {
          const lang = vm.$state.value.lang
          const voc = vm.$state.value.voc ?? lang?.vocs.find(v => v.id === vm.$state.value.selectedNote?.voc_id)
          s.visible = lang !== undefined && voc !== undefined
          s.text = voc?.name ?? ''
        }).onClick(() => {
          const lang = vm.$state.value.lang
          const voc = vm.$state.value.voc ?? lang?.vocs.find(v => v.id === vm.$state.value.selectedNote?.voc_id)
          lang && voc && vm.navigator.navigateTo({ langCode: lang?.code, vocCode: voc && vm.encodeName(voc.name) })
        })
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
    .observe(vm.$state)
    .react(s => {
      const note = vm.$state.value.selectedNote
      const level = note ? vm.reprLevel(note.level) : ''
      const tag = vm.reprTag(note?.tag_id)
      s.text = ''
      if (level && tag) s.text += level + ', ' + tag
      else if (level) s.text += level
      else if (tag) s.text += tag
      s.fontFamily = FontFamily.APP
      s.fontSize = theme().defMenuFontSize
      s.paddingHorizontal = '10px'
      s.textColor = theme().text50
    })
}

const FiltersView = () => {
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

      spacer().react(s => s.height = '20px')

      Title('Filter by tag:')
      TagSelector()

      spacer().react(s => s.height = '20px')

      Title('Search:')
      SearchPanel()
    })
}

const LevelsBar = () => {
  const vm = DertutorContext.self.noteListVM
  return vlist<number>()
    .observe(vm.$state, 'affectsChildrenProps')
    .items(() => [1, 2, 3, 4, 5, 6])
    .itemRenderer(LevelRenderer)
    .itemHash((item: number) => item + ':' + (item === vm.$state.value.level))
    .react(s => {
      s.fontSize = theme().defMenuFontSize
      s.fontFamily = FontFamily.MONO
      s.gap = '0px'
      s.width = '100%'
      s.halign = 'left'
    })
}

const LevelRenderer = (level: number) => {
  const vm = DertutorContext.self.noteListVM
  return Btn()
    .react(s => {
      s.isSelected = vm.$state.value.level === level
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
      s.textColor = theme().accent
    })
    .onClick(() => vm.reloadWith({ page: 1, level: vm.$state.value.level === level ? undefined : level }))
}

const TagSelector = () => {
  const vm = DertutorContext.self.noteListVM
  return vlist<ITag>()
    .observe(vm.$state.pipe().map(s => s.lang?.tags).removeDuplicates().fork(), 'recreateChildren')
    .observe(vm.$state.pipe().map(s => s.tagId).removeDuplicates().fork(), 'affectsChildrenProps')
    .items(() => vm.$state.value.lang?.tags ?? [])
    .itemRenderer(TagRenderer)
    .itemHash((item: ITag) => item.id + ':' + (item.id === vm.$state.value.tagId))
    .react(s => {
      s.fontSize = theme().defMenuFontSize
      s.fontFamily = FontFamily.MONO
      s.gap = '10px'
      s.width = '100%'
      s.halign = 'left'
    })
}

const TagRenderer = (t: ITag) => {
  const vm = DertutorContext.self.noteListVM
  return Btn()
    .react(s => {
      s.isSelected = vm.$state.value.tagId === t.id
      s.text = t.name
    })
    .onClick(() => vm.reloadWith({ page: 1, tagId: vm.$state.value.tagId === t.id ? undefined : t.id }))
}

const SearchPanel = () => {
  const vm = DertutorContext.self.noteListVM
  return vstack()
    .react(s => {
      s.gap = '0px'
      s.width = '100%'
      s.fontFamily = FontFamily.APP
      s.halign = 'left'
    })
    .children(() => {
      input()
        .observe(vm.$searchFocused)
        .bind(vm.$searchBuffer)
        .react(s => {
          s.type = 'text'
          s.width = '100%'
          s.className = 'search'
          s.fontFamily = FontFamily.APP
          s.autoFocus = vm.$searchFocused.value
          s.fontSize = theme().defMenuFontSize
          s.textColor = theme().accent
          s.cornerRadius = '4px'
          s.paddingHorizontal = '10px'
          s.autoCorrect = 'off'
          s.autoComplete = 'off'
          s.border = '1px solid ' + theme().text + '40'
        })
        .whenFocused(s => {
          s.border = '1px solid ' + theme().accent
        })
        .onKeyDown(e => {
          if (e.key === 'Enter') {
            vm.startSearch(vm.$searchBuffer.value)
            document.activeElement instanceof HTMLInputElement && document.activeElement.blur()
          }
          else if (e.key === 'Escape') {
            document.activeElement instanceof HTMLInputElement && document.activeElement.blur()
          }
        })
        .onBlur(() => { vm.$searchFocused.value = false })
        .onFocus(() => {
          vm.$searchFocused.value = true
          document.activeElement instanceof HTMLInputElement && document.activeElement.select()
        })

      // spacer().react(s => s.height = '10px')

      // hstack()
      //   .react(s => {
      //     s.gap = '10px'
      //   })
      //   .children(() => {
      //     switcher()
      //       .observe(vm.$searchGlobally)
      //       .react(s => {
      //         s.isSelected = vm.$searchGlobally.value
      //         s.trackColor = theme().text + '40'
      //       })
      //       .whenSelected(s => {
      //         s.trackColor = theme().accent
      //       })
      //       .onClick(() => vm.$searchGlobally.value = !vm.$searchGlobally.value)

      //     p().react(s => {
      //       s.textColor = theme().text50
      //       s.fontSize = theme().defMenuFontSize
      //       s.text = 'Search globally'
      //     })
      //   })
    })
}