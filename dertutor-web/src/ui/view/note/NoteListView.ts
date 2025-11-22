import { hstack, p, span, vlist, vstack } from "flinker-dom"
import { ActionsHelpView, globalContext, MessangerView } from "../../../App"
import { LayoutLayer } from "../../../app/Application"
import { Note } from "../../../domain/DomainModel"
import { FontFamily } from "../../controls/Font"
import { StatusBar, StatusBarModeName } from "../../controls/StatusBar"
import { DertutorContext } from "../../DertutorContext"
import { Markdown } from "../../markdown/Markdown"
import { theme } from "../../theme/ThemeManager"
import { IViewModel } from "../ViewModel"

export const NoteListView = () => {
  const ctx = DertutorContext.self
  const vm = ctx.noteListVM
  return hstack()
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
          s.enableOwnScroller = true
          s.width = '200px'
          s.height = '100vh'
          s.paddingBottom = theme().statusBarHeight - 40 + 'px'
          s.gap = '0'
        })

      Markdown()
        .observe(ctx.$selectedNote)
        .react(s => {
          s.className = theme().id
          s.fontFamily = FontFamily.ARTICLE
          s.textColor = theme().text
          s.maxWidth = theme().maxNoteViewWidth - 10 + 'px'
          s.width = '100%'
          s.minHeight = '30px'
          s.text = ctx.$selectedNote.value?.text ?? ''
          s.fontSize = theme().defFontSize
          s.absolutePathPrefix = globalContext.server.resourceUrl
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
    })
}
const NoteRenderer = (n: Note) => {
  const ctx = DertutorContext.self
  return p().react(s => {
    const selected = ctx.$selectedNote.value === n
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
    s.textColor = selected ? bgColor : textColor
    s.bgColor = selected ? textColor : theme().transparent
    s.text = n.title
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
