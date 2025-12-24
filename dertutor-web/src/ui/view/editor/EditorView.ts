import { btn, div, hlist, hstack, input, p, spacer, vstack } from "flinker-dom"
import { globalContext } from "../../../App"
import { IMediaFile, INote, ITag } from "../../../domain/DomainModel"
import { Btn, LinkBtn, RedBtn } from "../../controls/Button"
import { FontFamily } from "../../controls/Font"
import { Markdown } from "../../controls/Markdown"
import { DerTutorContext } from "../../../DerTutorContext"
import { theme } from "../../theme/ThemeManager"
import { FileWrapper } from "./EditorVM"
import { TextEditor } from "./TextEditor"
import { TextFormatter } from "./TextFormatter"

export const EditorView = () => {
  console.log('new EditorView')

  const ctx = DerTutorContext.self
  const vm = ctx.editorVM

  let noteInFocus: INote | undefined = undefined
  const formatter = new TextFormatter()

  const onFocus = (e: FocusEvent) => {
    if (noteInFocus !== vm.$state.value.note) {
      noteInFocus = vm.$state.value.note
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
      .observe(vm.$state)
      .bind(vm.$buffer)
      .react(s => {
        s.visible = vm.$state.value.note !== undefined
        s.position = 'fixed'
        s.left = '20px'
        s.top = theme().navBarHeight + 'px'
        s.width = window.innerWidth / 2 - 20 + 'px'
        //s.fontSize = theme().defMenuFontSize
        s.bgColor = theme().appBg
        s.caretColor = theme().isLight ? '#000000' : theme().red
        s.textColor = theme().editor
        s.fontFamily = FontFamily.MONO
        s.fontSize = '18px'
        s.height = window.innerHeight - theme().statusBarHeight - theme().navBarHeight + 'px'
        s.border = '1px solid ' + theme().border
      })
      .whenFocused(s => {
        s.border = '1px solid ' + theme().editor
      })
      .onFocus(onFocus)

    vstack()
      .react(s => {
        s.paddingLeft = window.innerWidth / 2 + 20 + 'px'
        s.width = '100%'
        s.paddingRight = '10px'
        s.paddingTop = theme().navBarHeight + 'px'
        s.gap = '20px'
      })
      .children(() => {
        LevelsPanel()
        TagSelector()
        PronunciationPanel()
        MediaFileList()
        PendingUploadResources()

        spacer().react(s => {
          s.width = '100%'
          s.height = '2px'
          s.marginVertical = theme().navBarHeight + 'px'
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
  const vm = DerTutorContext.self.editorVM
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
  const vm = DerTutorContext.self.editorVM
  return Btn()
    .react(s => {
      s.isSelected = vm.$level.value === level
      s.padding = '5px'
      s.text = vm.reprLevel(level)
      s.textAlign = 'left'
    })
    .onClick(() => vm.$level.value = vm.$level.value === level ? 0 : level)
}

const TagSelector = () => {
  const vm = DerTutorContext.self.editorVM
  return Panel('Tag')
    .observe(vm.$state, 'recreateChildren')
    .observe(vm.$tagId, 'affectsChildrenProps')
    .children(() => {
      p()
        .react(s => {
          s.width = '100%'
          s.fontFamily = FontFamily.APP
        })
        .children(() => {
          const lang = vm.$state.value.lang
          if (lang) lang.tags.forEach(t => TagRenderer(t))
        })
    })
}

const TagRenderer = (t: ITag) => {
  const vm = DerTutorContext.self.editorVM
  return Btn()
    .react(s => {
      s.isSelected = vm.$tagId.value === t.id
      s.border = '1px solid ' + theme().text50
      s.paddingHorizontal = '5px'
      s.cornerRadius = '2px'
      s.text = t.name
      s.marginRight = '5px'
      s.marginTop = '5px'
    })
    .whenHovered(s => {
      s.textColor = theme().text
      s.border = '1px solid ' + theme().text
    })
    .whenSelected(s => {
      s.textColor = theme().accent
      s.border = '1px solid ' + theme().accent
    })
    .onClick(() => vm.$tagId.value = vm.$tagId.value === t.id ? undefined : t.id)
}

const PronunciationPanel = () => {
  const vm = DerTutorContext.self.editorVM
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

          LinkBtn()
            .observe(vm.$audioUrl)
            .react(s => {
              s.text = vm.$audioUrl.value
            })
            .onClick(() => vm.playAudio())
        })

      BlueBtn()
        .observe(vm.$audioUrl)
        .react(s => {
          s.visible = vm.$audioUrl.value === ''
          s.text = 'Load Audio'
        })
        .onClick(() => vm.loadAudioLink())

      RedBtn()
        .observe(vm.$audioUrl)
        .react(s => {
          s.visible = vm.$audioUrl.value !== ''
          s.text = 'Delete'
        })
        .onClick(() => vm.$audioUrl.value = '')
    })
}

const MediaFileList = () => {
  const vm = DerTutorContext.self.editorVM
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

const MediaFileView = (mf: IMediaFile) => {
  const vm = DerTutorContext.self.editorVM
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

          LinkBtn()
            .react(s => {
              s.text = vm.getMediaFileLink(mf)
              s.popUp = 'Copy link'
            })
            .onClick(() => globalContext.app.copyTextToClipboard(vm.getMediaFileLink(mf)))
        })

      RedBtn()
        .react(s => {
          s.text = 'Delete'
        })
        .onClick(() => vm.deleteMediaFile(mf))
    })
}


const PendingUploadResources = () => {
  const vm = DerTutorContext.self.editorVM
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
          BlueBtn()
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

          BlueBtn()
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
  const vm = DerTutorContext.self.editorVM
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
  const vm = DerTutorContext.self.editorVM
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
  const vm = DerTutorContext.self.editorVM
  return hstack()
    .react(s => {
      s.gap = '20px'
      s.paddingHorizontal = '30px'
      s.height = theme().navBarHeight + 'px'
      s.halign = 'right'
      s.valign = 'center'
      s.bgColor = theme().appBg
    })
    .children(() => {

      BlueBtn()
        .observe(vm.$hasChanges)
        .react(s => {
          s.isDisabled = !vm.$hasChanges.value
          s.text = 'Save'
          s.popUp = 'Ctrl + Shift + S'
        })
        .onClick(() => vm.save())

      BlueBtn()
        .observe(vm.$hasChanges)
        .react(s => {
          s.isDisabled = !vm.$hasChanges.value
          s.text = 'Discard Changes'
        })
        .onClick(() => vm.discardChanges())

      BlueBtn()
        .observe(vm.$hasChanges)
        .react(s => {
          s.visible = vm.$state.value.lang?.code === 'en'
          s.text = 'Load default translation'
        })
        .onClick(() => vm.loadTranslation())

      BlueBtn()
        .react(s => {
          s.text = 'Quit'
          s.popUp = 'ESC'
        })
        .onClick(() => vm.quit())
    })
}

const BlueBtn = () => {
  return btn()
    .react(s => {
      s.fontFamily = FontFamily.APP
      s.fontSize = theme().defMenuFontSize
      s.minHeight = '25px'
      s.gap = '2px'
      s.textColor = theme().btn + 'cc'
      s.cornerRadius = '4px'
    })
    .whenHovered(s => {
      s.textColor = theme().btn
    })
    .whenSelected(s => {
      s.textColor = theme().accent
      s.bgColor = theme().header
    })
}