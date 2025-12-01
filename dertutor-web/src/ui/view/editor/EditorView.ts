import { hlist, hstack, p, spacer, span, vstack } from "flinker-dom"
import { globalContext, MessangerView } from "../../../App"
import { LayoutLayer } from "../../../app/Application"
import { Note, noteLevels } from "../../../domain/DomainModel"
import { TextBtn } from "../../controls/Button"
import { FontFamily } from "../../controls/Font"
import { StatusBar, StatusBarModeName } from "../../controls/StatusBar"
import { DertutorContext } from "../../DertutorContext"
import { Markdown } from "../../markdown/Markdown"
import { theme } from "../../theme/ThemeManager"
import { TextEditor } from "./TextEditor"
import { TextFormatter } from "./TextFormatter"

const HEADER_HEI = 35
const borderStyle = () => {
  return '1px solid ' + theme().text + '88'
}

export const EditorView = () => {
  console.log('new EditorView')

  const ctx = DertutorContext.self
  const vm = ctx.editorVM

  let noteInFocus: Note | undefined = undefined
  const formatter = new TextFormatter()

  const onFocus = (e: FocusEvent) => {
    if (noteInFocus !== vm.$editingNote.value) {
      noteInFocus = vm.$editingNote.value
      const ta = e.currentTarget as HTMLTextAreaElement
      //scroll to first line
      ta.setSelectionRange(0, 0)
      ta.blur()
      ta.focus()
    }
  }

  return hstack()
    .react(s => {
      s.width = '100%'
      s.height = '100vh'
      s.halign = 'left'
      s.gap = '20px'
      s.paddingHorizontal = '20px'
    }).children(() => {

      Tools()
        .react(s => {
          s.width = theme().menuWidth - 10 + 'px'
          s.height = '100%'
        })

      Panel('Editor')
        .react(s => {
          s.maxWidth = theme().maxNoteViewWidth - 10 + 'px'
          s.width = (window.innerWidth - theme().menuWidth) / 2 - 20 + 'px'
          s.height = window.innerHeight - theme().statusBarHeight + 'px'
        })
        .children(() => {
          TextEditor(formatter)
            .bind(vm.$buffer)
            .react(s => {
              s.cornerRadius = '5px'
              s.width = '100%'
              s.height = '100%'
              s.border = borderStyle()
            })
            .whenFocused(s => {
              s.border = ['1px', 'solid', theme().red]
            })
            .onFocus(onFocus)
        })

      Panel('Markdown')
        .react(s => {
          s.maxWidth = theme().maxNoteViewWidth - 10 + 'px'
          s.width = (window.innerWidth - theme().menuWidth) / 2 - 20 + 'px'
          s.height = window.innerHeight - theme().statusBarHeight + 'px'
        })
        .children(() => {
          Markdown()
            .observe(vm.$buffer.pipe().debounce(500).fork())
            .react(s => {
              s.className = theme().id
              s.fontFamily = FontFamily.ARTICLE
              s.textColor = theme().text
              s.cornerRadius = '5px'
              s.width = '100%'
              s.height = '100%'
              s.text = vm.$buffer.value
              s.fontSize = theme().defFontSize
              s.absolutePathPrefix = globalContext.server.resourceUrl
              s.paddingHorizontal = '5px'
              s.border = borderStyle()
            })
        })


      Footer()
        .react(s => {
          s.position = 'fixed'
          s.width = '100%'
          s.bottom = '0'
          s.left = '0'
          s.layer = LayoutLayer.MODAL
        })
    })
}

const Tools = () => {
  const vm = DertutorContext.self.editorVM
  return vstack()
    .children(() => {

      Panel('Level')
        .react(s => {
          s.width = '100%'
        }).children(() => {
          hlist<number>()
            .observe(vm.$level, 'affectsChildrenProps')
            .items(() => [1, 2, 3, 4, 5, 6])
            .itemRenderer(LevelRenderer)
            .itemHash((item: number) => item + ':' + (item === vm.$level.value))
            .react(s => {
              s.paddingBottom = theme().statusBarHeight - 40 + 'px'
              s.gap = '0'
              s.width = '100%'
              s.border = borderStyle()
              s.padding = '5px'
            })
        })

      Panel('Pronunciation')
        .react(s => {
          s.width = '100%'
        }).children(() => {
          vstack()
            .react(s => {
              s.paddingBottom = theme().statusBarHeight - 40 + 'px'
              s.gap = '0'
              s.width = '100%'
              s.border = borderStyle()
              s.padding = '5px'
            }).children(() => {
              TextBtn()
                .observe(vm.$audioUrl)
                .react(s => {
                  s.visible = vm.$audioUrl.value !== ''
                  s.fontSize = theme().defMenuFontSize
                  s.fontFamily = FontFamily.APP
                  s.textColor = theme().red
                  s.text = vm.$audioUrl.value
                })
                .onClick(() => vm.playAudio())
                .whenHovered(s => {
                  s.textDecoration = 'underline'
                })

              TextBtn()
                .observe(vm.$audioUrl)
                .react(s => {
                  s.visible = vm.$audioUrl.value !== ''
                  s.text = 'Delete'
                })
                .onClick(() => vm.$audioUrl.value = '')

              TextBtn()
                .observe(vm.$audioUrl)
                .react(s => {
                  s.visible = vm.$audioUrl.value === ''
                  s.text = 'Load Audio'
                })
                .onClick(() => vm.getAudioLink())

            })
        })

      Panel('Resourses')
        .react(s => {
          s.width = '100%'
        }).children(() => {
          vstack()
            .react(s => {
              s.paddingBottom = theme().statusBarHeight - 40 + 'px'
              s.gap = '0'
              s.width = '100%'
              s.border = borderStyle()
              s.padding = '5px'
            }).children(() => {
              TextBtn()
                .react(s => {
                  s.text = 'Add file'
                })
                .onClick(() => vm.addResource())
            })
        })

      spacer().react(s => s.height = '100%')

      TextBtn()
        .observe(vm.$hasChanges)
        .react(s => {
          s.isDisabled = !vm.$hasChanges.value
          s.text = 'Save'
          s.popUp = 'Ctrl + Shift + S'
        })
        .onClick(() => vm.save())

      TextBtn()
        .observe(vm.$hasChanges)
        .react(s => {
          s.isDisabled = !vm.$hasChanges.value
          s.text = 'Discard Changes'
        })
        .onClick(() => vm.discardChanges())

      TextBtn()
        .react(s => {
          s.text = 'Quit'
          s.popUp = 'ESC'
        })
        .onClick(() => vm.quit())
    })
}

const Panel = (title: string) => {
  return vstack()
    .react(s => {
      s.gap = '0'
    })
    .children(() => {
      p()
        .react(s => {
          s.fontSize = theme().defMenuFontSize
          s.fontFamily = FontFamily.APP
          s.wrap = false
          s.width = '100%'
          s.height = HEADER_HEI + 'px'
          s.paddingTop = '10px'
          s.textColor = theme().text50
          s.text = title
          s.textSelectable = false
        })
    })
}

const LevelRenderer = (level: number) => {
  const vm = DertutorContext.self.editorVM
  return p()
    .react(s => {
      const selected = vm.$level.value === level

      s.fontSize = theme().defMenuFontSize
      s.fontFamily = FontFamily.APP
      s.wrap = false
      s.width = '100%'
      s.textColor = selected ? theme().red : theme().text50
      s.bgColor = selected ? theme().appBg : theme().transparent
      s.text = level < noteLevels.length ? noteLevels[level] : ''
      s.textAlign = 'center'
      s.textSelectable = false
    })
    .whenHovered(s => {
      s.textColor = theme().red
      s.cursor = 'pointer'
    })
    .onClick(() => vm.$level.value = vm.$level.value === level ? 0 : level)
}

const Footer = () => {
  const vm = DertutorContext.self.editorVM
  return vstack()
    .react(s => {
      s.gap = '0'
    })
    .children(() => {
      StatusBar().children(() => {

        StatusBarModeName()
          .react(s => {
            s.text = 'Edit Mode'
            s.bgColor = theme().red
          })

        span()
          .observe(vm.$editingNote)
          .react(s => {
            let note = vm.$editingNote.value
            s.text = note ? note.vocabulary.lang.name + '. ' + note.vocabulary.name + '. ' + note.title + '(ID:' + note.id + ')' : ''
            s.textColor = theme().red
            s.width = '100%'
          })

        spacer()

        MessangerView()
      })
    })
}

