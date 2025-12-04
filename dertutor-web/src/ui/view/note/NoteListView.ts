import { div, p, span, vlist, vstack } from "flinker-dom"
import { ActionsHelpView, globalContext, MessangerView } from "../../../App"
import { LayoutLayer } from "../../../app/Application"
import { Note } from "../../../domain/DomainModel"
import { Btn } from "../../controls/Button"
import { FontFamily } from "../../controls/Font"
import { LineInput } from "../../controls/Input"
import { StatusBar, StatusBarModeName } from "../../controls/StatusBar"
import { DertutorContext } from "../../DertutorContext"
import { MaterialIcon } from "../../icons/MaterialIcon"
import { Markdown } from "../../markdown/Markdown"
import { theme } from "../../theme/ThemeManager"
import { IViewModel } from "../ViewModel"

export const NoteListView = () => {
  const ctx = DertutorContext.self
  const vm = ctx.noteListVM
  return div()
    .react(s => {
      s.width = '100%'
      s.gap = '10px'
    }).children(() => {
      vlist<Note>()
        .observe(vm.$notes, 'recreateChildren')
        .observe(ctx.$selectedNote, 'affectsChildrenProps')
        .items(() => vm.$notes.value)
        .itemRenderer(NoteRenderer)
        .itemHash((item: Note) => item.id + ':' + (item === ctx.$selectedNote.value))
        .react(s => {
          s.className = 'listScrollbar'
          s.position = 'fixed'
          s.enableOwnScroller = true
          s.width = theme().menuWidth + 'px'
          s.height = '100vh'
          s.paddingBottom = 2 * theme().statusBarHeight + 'px'
          s.gap = '0'
        })

      PlayAudioBtn()
        .observe(ctx.$selectedNote)
        .react(s => {
          s.visible = ctx.$selectedNote.value !== undefined && ctx.$selectedNote.value.audioUrl !== ''
          s.position = 'absolute'
          s.top = '22px'
          s.left = theme().menuWidth - 50 + 'px'
        })

      Markdown()
        .observe(ctx.$selectedNote)
        .react(s => {
          s.className = theme().id
          s.position = 'absolute'
          s.left = theme().menuWidth + 'px'
          s.fontFamily = FontFamily.ARTICLE
          s.textColor = theme().text
          s.paddingTop = '20px'
          s.paddingBottom = theme().statusBarHeight + 'px'
          s.maxWidth = theme().maxNoteViewWidth - 10 + 'px'
          s.width = '100%'
          s.minHeight = '30px'
          s.text = ctx.$selectedNote.value?.text ?? ''
          s.fontSize = theme().defFontSize
          s.absolutePathPrefix = globalContext.server.baseUrl
          //s.showRawText = page.file.showRawText
          //s.fontFamily = isCode ? 'var(--font-family)' : 'var(--font-family-article)'
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

const NoteRenderer = (n: Note) => {
  const ctx = DertutorContext.self
  return p().react(s => {
    const selected = ctx.$selectedNote.value === n
    const textColor = theme().menu
    const bgColor = theme().appBg
    s.fontSize = theme().defMenuFontSize
    s.fontFamily = FontFamily.MONO
    s.wrap = false
    s.padding = '5px'
    s.textColor = selected ? bgColor : textColor
    s.bgColor = selected ? textColor : theme().transparent
    s.text = n.title
  })
}

const PlayAudioBtn = () => {
  const ctx = DertutorContext.self
  return Btn()
    .react(s => {
      s.icon = MaterialIcon.volume_up
      s.width = '45px'
      s.height = '45px'
    }).onClick(() => ctx.$selectedNote.value?.play())
}

const Footer = (vm: IViewModel) => {
  const ctx = DertutorContext.self
  return vstack()
    .react(s => {
      s.gap = '0'
    })
    .children(() => {

      ActionsHelpView(vm)
      StatusBar().children(() => {

        StatusBarModeName()
          .react(s => {
            s.text = 'Explore'
          })

        span()
          .observe(ctx.$selectedNote)
          .react(s => {
            let note = ctx.$selectedNote.value
            s.text = note ? note.vocabulary.lang.name + '. ' + note.vocabulary.name : ''
            s.textColor = theme().statusFg
            s.whiteSpace = 'nowrap'
            s.width = '100%'
          })

        MessangerView()
      })
    })
}
