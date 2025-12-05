import { div, hlist, hstack, input, p, spacer, span, vstack } from "flinker-dom"
import { globalContext, MessangerView } from "../../../App"
import { LayoutLayer } from "../../../app/Application"
import { MediaFile, Note, noteLevels } from "../../../domain/DomainModel"
import { BlueBtn, Btn, RedBtn } from "../../controls/Button"
import { FontFamily } from "../../controls/Font"
import { StatusBar, StatusBarModeName } from "../../controls/StatusBar"
import { DertutorContext } from "../../DertutorContext"
import { Markdown } from "../../controls/Markdown"
import { theme } from "../../theme/ThemeManager"
import { FileWrapper } from "./EditorVM"
import { TextEditor } from "./TextEditor"
import { TextFormatter } from "./TextFormatter"

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

  return div().children(() => {

    Header()
      .react(s => {
        s.position = 'fixed'
        s.width = '100%'
      })

    TextEditor(formatter)
      .bind(vm.$buffer)
      .react(s => {
        s.position = 'fixed'
        s.width = window.innerWidth / 2 - 50 + 'px'
        // s.height = window.innerHeight - theme().statusBarHeight + 'px'
        s.cornerRadius = '5px'
        s.paddingBottom = theme().statusBarHeight + 'px'
        s.top = '0px'
        s.bottom = theme().statusBarHeight + 'px'
        s.borderRight = '1px solid ' + theme().text50
      })
      .whenFocused(s => {
        s.borderRight = '1px solid ' + theme().red + '88'
      })
      .onFocus(onFocus)

    vstack()
      .react(s => {
        s.paddingLeft = window.innerWidth / 2 - 25 + 'px'
        s.width = '100%'
        s.paddingRight = '10px'
        s.paddingTop = '50px'
        s.gap = '20px'
      })
      .children(() => {
        LevelsPanel()
        PronunciationPanel()
        MediaFileList()
        PendingUploadResources()

        spacer().react(s => {
          s.width = '100%'
          s.height = '2px'
          s.marginVertical = '50px'
          s.bgColor = theme().text50
        })

        Markdown()
          .observe(vm.$buffer.pipe().debounce(500).fork())
          .react(s => {
            s.className = theme().id
            s.width = '100%'
            s.fontFamily = FontFamily.ARTICLE
            s.textColor = theme().text
            s.cornerRadius = '5px'
            s.text = vm.$buffer.value
            s.mode = 'md'
            s.fontSize = theme().defFontSize
            s.absolutePathPrefix = globalContext.server.baseUrl
            s.paddingHorizontal = '5px'
            s.paddingBottom = theme().statusBarHeight + 15 + 'px'
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

const Panel = (title: string) => {
  return hstack()
    .react(s => {
      s.gap = '10px'
      s.width = '100%'
      s.bgColor = theme().text + '10'
      s.paddingVertical = '5px'
      s.paddingHorizontal = '20px'
      s.cornerRadius = '5px'
      s.minHeight = '60px'
      s.valign = 'center'
      s.halign = 'stretch'
    })
    .children(() => {
      p()
        .react(s => {
          s.fontSize = theme().defMenuFontSize
          s.fontFamily = FontFamily.APP
          s.minWidth = '150px'
          s.textColor = theme().text50
          s.text = title + ':'
          s.textSelectable = false
        })
    })
}

const LevelsPanel = () => {
  const vm = DertutorContext.self.editorVM
  return Panel('Level')
    .children(() => {
      hlist<number>()
        .observe(vm.$level, 'affectsChildrenProps')
        .items(() => [1, 2, 3, 4, 5, 6])
        .itemRenderer(LevelRenderer)
        .itemHash((item: number) => item + ':' + (item === vm.$level.value))
        .react(s => {
          s.gap = '20px'
          s.width = '100%'
        })
    })
}
const LevelRenderer = (level: number) => {
  const vm = DertutorContext.self.editorVM
  return Btn()
    .react(s => {
      s.isSelected = vm.$level.value === level
      s.fontSize = theme().defFontSize
      s.fontFamily = FontFamily.APP
      s.wrap = false
      s.padding = '5px'
      s.textColor = theme().text50
      s.text = level < noteLevels.length ? noteLevels[level] : ''
      s.textAlign = 'left'
      s.textSelectable = false
    })
    .whenHovered(s => {
      s.textColor = theme().text
    })
    .whenSelected(s => {
      s.textColor = theme().btn + 'cc'
    })
    .onClick(() => vm.$level.value = vm.$level.value === level ? 0 : level)
}

const PronunciationPanel = () => {
  const vm = DertutorContext.self.editorVM
  return Panel('Pronunciation')
    .children(() => {
      vstack()
        .observe(vm.$audioUrl)
        .react(s => {
          s.visible = vm.$audioUrl.value !== ''
          s.gap = '0px'
          s.width = '100%'
          s.fontSize = theme().defMenuFontSize
          s.fontFamily = FontFamily.APP
          s.popUp = 'Play'
        })
        .children(() => {
          p().react(s => {
            s.textColor = theme().text50
            s.text = 'audio.mp3'
          })

          BlueBtn()
            .observe(vm.$audioUrl)
            .react(s => {
              s.text = vm.$audioUrl.value
            })
            .onClick(() => vm.playAudio())
        })

      RedBtn()
        .observe(vm.$audioUrl)
        .react(s => {
          s.text = vm.$audioUrl.value === '' ? 'Load Audio' : 'Delete'
        })
        .onClick(() => {
          if (vm.$audioUrl.value === '') vm.getAudioLink()
          else vm.$audioUrl.value = ''
        })
    })
}

const MediaFileList = () => {
  const vm = DertutorContext.self.editorVM
  return vstack()
    .observe(vm.$mediaFiles, 'affectsProps', 'recreateChildren')
    .react(s => {
      s.visible = vm.$mediaFiles.value.length > 0
      s.gap = '5px'
      s.width = '100%'
    })
    .children(() => {
      vm.$mediaFiles.value.forEach(f => {
        MediaFileView(f)
      })
    })
}

const MediaFileView = (mf: MediaFile) => {
  const vm = DertutorContext.self.editorVM
  return Panel('Media')
    .children(() => {
      vstack()
        .react(s => {
          s.gap = '0px'
          s.width = '100%'
          s.fontSize = theme().defMenuFontSize
          s.fontFamily = FontFamily.APP
          s.flexGrow = 1
        })
        .children(() => {
          p().react(s => {
            s.textColor = theme().text50
            s.text = mf.name + ' '
          })

          BlueBtn()
            .react(s => {
              s.text = mf.url
              s.popUp = 'Copy link'
            })
            .onClick(() => globalContext.app.copyTextToClipboard(mf.url))
        })

      RedBtn()
        .react(s => {
          s.text = 'Delete'
        })
        .onClick(() => vm.deleteMediaFile(mf))
    })
}


const PendingUploadResources = () => {
  const vm = DertutorContext.self.editorVM
  return vstack()
    .react(s => {
      s.gap = '5px'
    }).children(() => {
      PendingUploadFileList()

      const chooser = input()
        //.bind(inputBinding)
        .react(s => {
          s.type = 'file'
          s.visible = false
        })
        .onChange((e: any) => {
          vm.addResource(e.target.files[0])
          console.log(e)
        })

      hstack()
        .react(s => {
          s.width = '100%'
          s.gap = '20px'
          s.valign = 'center'
        })
        .children(() => {
          Btn()
            .react(s => {
              s.text = 'Choose a media-file'
            })
            .onClick(() => chooser.dom.click())

          p().observe(vm.$filesPendingUpload)
            .react(s => {
              s.visible = vm.$filesPendingUpload.value.length > 0
              s.fontFamily = FontFamily.APP
              s.textColor = theme().text50
              s.text = '|'
            })

          Btn()
            .observe(vm.$filesPendingUpload)
            .react(s => {
              s.visible = vm.$filesPendingUpload.value.length > 0
              s.text = 'Upload all'
            })
            .onClick(() => vm.uploadAll())
        })
    })
}

const PendingUploadFileList = () => {
  const vm = DertutorContext.self.editorVM
  return vstack()
    .observe(vm.$filesPendingUpload, 'affectsProps', 'recreateChildren')
    .react(s => {
      s.visible = vm.$filesPendingUpload.value.length > 0
      s.gap = '5px'
      s.width = '100%'
    })
    .children(() => {
      vm.$filesPendingUpload.value.forEach(w => {
        FileView(w)
      })
    })
}

const FileView = (w: FileWrapper) => {
  const vm = DertutorContext.self.editorVM
  return Panel('File')
    .react(s => {
      s.bgColor = theme().red + '10'
    })
    .children(() => {

      input()
        .bind(w.$name)
        .react(s => {
          s.type = 'text'
          s.width = '100%'
          s.height = '40px'
          s.fontFamily = FontFamily.APP
          s.fontSize = theme().defMenuFontSize
          s.textColor = theme().text
          s.bgColor = undefined
          s.autoCorrect = 'off'
          s.autoComplete = 'off'
        })
        .whenFocused(s => {
          s.textColor = theme().accent
          s.bgColor = theme().appBg + 'aa'
        })

      RedBtn()
        .react(s => {
          s.text = 'Cancel'
        })
        .onClick(() => vm.deletePendingUploadFile(w))
    })
}


const Header = () => {
  const vm = DertutorContext.self.editorVM
  return hstack()
    .react(s => {
      s.gap = '20px'
      s.paddingHorizontal = '30px'
      s.height = '50px'
      s.halign = 'right'
      s.valign = 'center'
      s.bgColor = theme().appBg
    })
    .children(() => {

      Btn()
        .observe(vm.$hasChanges)
        .react(s => {
          s.isDisabled = !vm.$hasChanges.value
          s.text = 'Save'
          s.popUp = 'Ctrl + Shift + S'
        })
        .onClick(() => vm.save())

      Btn()
        .observe(vm.$hasChanges)
        .react(s => {
          s.isDisabled = !vm.$hasChanges.value
          s.text = 'Discard Changes'
        })
        .onClick(() => vm.discardChanges())

      Btn()
        .observe(vm.$hasChanges)
        .react(s => {
          s.visible = vm.$editingNote.value?.vocabulary.lang.code === 'en'
          s.text = 'Load default translation'
        })
        .onClick(() => vm.loadTranslation())

      Btn()
        .react(s => {
          s.text = 'Quit'
          s.popUp = 'ESC'
        })
        .onClick(() => vm.quit())
    })
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

