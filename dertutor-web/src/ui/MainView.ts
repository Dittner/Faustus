import { hstack, p, vlist, vstack } from "flinker-dom"
import { Lang, Note, Vocabulary } from "../domain/DomainModel"
import { FontFamily } from "./controls/Font"
import { DertutorContext } from "./DertutorContext"
import { theme } from "./theme/ThemeManager"
import { Footer } from "./footer/Footer"
import { LayoutLayer } from "../app/Application"

export const MainView = () => {
  return hstack()
    .react(s => {
      s.width = '100%'
      s.gap = '10px'
    }).children(() => {

      LangList()
        .react(s => {
          s.width = '100px'
          s.height = '100vh'
          s.paddingBottom = theme().statusBarHeight - 40 + 'px'
        })

      VocList()
        .react(s => {
          s.width = '100px'
          s.height = '100vh'
          s.paddingBottom = theme().statusBarHeight + 'px'
        })

      NoteList()
        .react(s => {
          s.width = '100px'
          s.height = '100vh'
          s.paddingBottom = theme().statusBarHeight + 'px'
        })

      NoteView()
        .react(s => {
          s.width = '100%'
          s.bgColor = '#550000'
        })

      Footer().react(s => {
        s.position = 'fixed'
        s.width = '100%'
        s.bottom = '0'
        s.left = '0'
        s.layer = LayoutLayer.MODAL
      })
    })
}

const LangList = () => {
  const ctx = DertutorContext.self

  return vlist<Lang>()
    .observe(ctx.$allLangs, 'recreateChildren')
    .observe(ctx.$selectedLang, 'affectsChildrenProps')
    .observe(ctx.$focusedItem, 'affectsChildrenProps')
    .items(() => ctx.$allLangs.value)
    .itemRenderer(LangRenderer)
    .itemHash((item: Lang) => item.id + ':' + (item === ctx.$focusedItem.value) + (item === ctx.$selectedLang.value))
    .react(s => {
      s.gap = '0'
      s.className = 'listScrollbar'
      s.enableOwnScroller = true
    })
}

const LangRenderer = (lang: Lang) => {
  const ctx = DertutorContext.self
  return p()
    .react(s => {
      const selected = ctx.$selectedLang.value === lang
      const focused = ctx.$focusedItem.value === lang

      let textColor = theme().menuNormal
      if (lang.code === 'de')
        textColor = theme().menuDe
      else if (lang.code === 'en')
        textColor = theme().menuEn

      s.fontSize = theme().defMenuFontSize
      s.fontFamily = FontFamily.MONO
      s.wrap = false
      s.width = '100%'
      s.padding = '5px'
      s.textColor = focused ? theme().appBg : textColor
      s.bgColor = focused ? textColor : theme().transparent
      s.text = lang.code.toLocaleUpperCase()
      s.textAlign = 'center'
      s.textSelectable = false
    })
    .whenHovered(s => {
      s.textDecoration = 'underline'
    })
}


const VocList = () => {
  const ctx = DertutorContext.self

  return vlist<Vocabulary>()
    .observe(ctx.$selectedLang, 'recreateChildren')
    .observe(ctx.$selectedLang.pipe().skipNullable().flatMap(l => l).fork(), 'recreateChildren')
    .observe(ctx.$selectedVoc, 'affectsChildrenProps')
    .observe(ctx.$focusedItem, 'affectsChildrenProps')
    .items(() => ctx.$selectedLang.value?.vocabularies ?? [])
    .itemRenderer(VocRenderer)
    .itemHash((item: Vocabulary) => item.id + ':' + (item === ctx.$selectedVoc.value) + (item === ctx.$focusedItem.value))
    .react(s => {
      s.gap = '0'
      s.className = 'listScrollbar'
      s.enableOwnScroller = true
    })
}

const VocRenderer = (voc: Vocabulary) => {
  const ctx = DertutorContext.self
  return p().react(s => {
    const underCurser = ctx.$focusedItem.value === voc
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
    s.paddingLeft = '20px'
    s.textColor = underCurser ? bgColor : textColor
    s.bgColor = underCurser ? textColor : theme().transparent
    s.text = voc.name
  })
}


const NoteList = () => {
  const ctx = DertutorContext.self

  return vlist<Note>()
    .observe(ctx.$selectedVoc, 'recreateChildren')
    .observe(ctx.$selectedVoc.pipe().skipNullable().flatMap(v => v).fork(), 'recreateChildren')
    .observe(ctx.$selectedNote, 'affectsChildrenProps')
    .observe(ctx.$focusedItem, 'affectsChildrenProps')
    .items(() => ctx.$selectedVoc.value?.notes ?? [])
    .itemRenderer(NoteRenderer)
    .itemHash((item: Note) => item.id + ':' + (item === ctx.$selectedNote.value) + (item === ctx.$selectedNote.value))
    .react(s => {
      s.gap = '0'
      s.className = 'listScrollbar'
      s.enableOwnScroller = true
    })
}

const NoteRenderer = (n: Note) => {
  const ctx = DertutorContext.self
  return p().react(s => {
    const underCurser = ctx.$focusedItem.value === n

    const textColor = theme().menuFocused
    const bgColor = theme().appBg
    s.fontSize = theme().defMenuFontSize
    s.fontFamily = FontFamily.MONO
    s.wrap = false
    s.padding = '5px'
    s.paddingLeft = '20px'
    s.textColor = underCurser ? bgColor : textColor
    s.bgColor = underCurser ? textColor : theme().transparent
    s.text = n.value1
  })
}

const NoteView = () => {
  const ctx = DertutorContext.self
  return vstack()
    .observe(ctx.$selectedNote, 'recreateChildren')
    .children(() => {
      const note = ctx.$selectedNote.value
      if (!note) return

      //title
      p().react(s => {
        const article = note.options['article'] ?? ''
        s.fontSize = '1rem'
        s.fontFamily = FontFamily.ARTICLE
        s.wrap = false
        s.textColor = theme().header
        s.text = article ? article + ' ' + note.value1 : note.value1
        if (note.value3)
          s.text += ', ' + note.value3
      })

      //translation
      p().react(s => {
        s.fontSize = theme().defMenuFontSize
        s.fontFamily = FontFamily.ARTICLE
        s.textColor = theme().text
        s.text = note.value2
      })

      //examples
      p().react(s => {
        s.fontSize = theme().defMenuFontSize
        s.fontFamily = FontFamily.ARTICLE
        s.textColor = theme().text
        s.text = note.examples
      })
    })
}
