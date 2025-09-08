import { div, hstack, image, observer, p, spacer, vlist, vstack } from "flinker-dom"
import { globalContext } from "../../App"
import { MaterialIcon } from "../../global/MaterialIcon"
import { theme } from "../../global/ThemeManager"
import { InfoPage, Page, TextFile } from "../domain/IndexModel"
import { IndexContext } from "../IndexContext"
import { RedBtn } from "./controls/Button"
import { FontFamily } from "./controls/Font"
import { Markdown } from "./controls/Markdown"

export const FileView = () => {
  console.log('new FileView')
  const ctx = IndexContext.self

  return vstack()
    .observe(ctx.$selectedFile, 'recreateChildren')
    .react(s => {
      s.fontFamily = FontFamily.ARTICLE
      s.textColor = theme().text
      s.gap = '0'
      s.valign = 'top'
      s.halign = 'left'
      s.paddingVertical = '40px'
      s.width = '100%'
    }).children(() => {
      const file = ctx.$selectedFile.value

      FileBtnBar(file)
      FileInfo(file)
      !file.isDirectory && spacer().react(s => s.height = '50px')
      PageList(file)

    })
}

const FileBtnBar = (file: TextFile) => {
  console.log('new FileBtnBar')
  const ctx = IndexContext.self

  return vstack()
    .observe(file)
    .react(s => {
      s.visible = !file.isEditing
      s.halign = 'right'
      s.width = '200px'
      s.position = 'fixed'
      s.top = '40px'
      s.gap = '0'
      s.right = '20px'
    }).children(() => {
      RedBtn()
        .react(s => {
          s.icon = MaterialIcon.edit
          s.iconSize = '12px'
          s.text = 'Edit'
        })
        .onClick(() => {
          file.isEditing = true
        })

      RedBtn()
        .react(s => {
          s.icon = MaterialIcon.add
          s.iconSize = '18px'
          s.visible = file.isDirectory
          s.text = 'Add Directory'
        })
        .onClick(() => ctx.createNewDir())

      RedBtn()
        .react(s => {
          s.icon = MaterialIcon.add
          s.iconSize = '18px'
          s.visible = file.isDirectory
          s.text = 'Add File'
        })
        .onClick(() => ctx.createNewFile())

      RedBtn()
        .observe(file)
        .react(s => {
          s.text = 'Raw'
          s.popUp = 'Switch to raw/markdown mode'
          s.isSelected = file.showRawText
        })
        .onClick(() => file.showRawText = !file.showRawText)
    })
}

const FileInfo = (file: TextFile) => {
  console.log('new FileInfo')
  const ctx = IndexContext.self
  const toggleSelection = (e: any) => {
    e.stopPropagation()
    ctx.editor.selectedPage = ctx.editor.selectedPage === file.info ? undefined : file.info
  }

  return div()
    .observe(ctx.$isSelectedFileEditing)
    .observe(file.info)
    .react(s => {
      const isEditing = ctx.$isSelectedFileEditing.value
      const isSelected = file.info.isSelected
      s.textSelectable = !isEditing
      s.width = '100%'
      s.maxWidth = theme().maxBlogTextWidth
      s.paddingTop = '40px'
      s.gap = '0'
      s.right = '20px'
      s.paddingLeft = isEditing && isSelected ? '74px' : '80px'
      s.borderLeft = isEditing && isSelected ? '6px solid ' + theme().red : undefined
      s.bgColor = isEditing && isSelected ? theme().selectedBlockBg : undefined
    })
    .whenHovered(s => {
      const isSelected = file.info.isSelected
      if (file.isEditing) {
        s.bgColor = isSelected ? theme().selectedBlockBg : theme().hoveredBlockBg
      } else {
        s.bgColor = undefined
      }
    })
    .onMouseDown((e) => ctx.$isSelectedFileEditing.value && toggleSelection(e))
    .children(() => {

      observer(file.info.pipe().map(info => (info as InfoPage).author !== undefined).removeDuplicates().fork())
        .onReceive(isAuthor => {
          return isAuthor ? AuthorFileInfo(file.info) : ArticleFileInfo(file.info)
        })
    })
}

const AuthorFileInfo = (info: InfoPage) => {
  console.log('new ArticleFileInfo')

  return vstack()
    .react(s => {
      s.width = '100%'
      //s.minHeight = info.cover ? '100vh' : '0'
      s.valign = 'top'
      s.halign = 'center'
      s.bgColor = theme().isLight ? '#ffFFff50' : '#ffFFff05'
      s.gap = '0px'
      s.padding = "40px"
      s.paddingVertical = '50px'
    })
    .children(() => {

      hstack()
        .react(s => {
          s.halign = 'center'
          s.valign = 'center'
          s.gap = '10px'
          s.width = '100%'
        }).children(() => {
          //surname
          p()
            .observe(info)
            .react(s => {
              s.textAlign = 'left'
              s.className = 'def'
              s.textColor = theme().h1
              s.fontWeight = 'bold'
              s.letterSpacing = '2px'
              s.fontSize = '2.5rem'
              s.text = info.author?.surname
            })

          //firstname
          p()
            .observe(info)
            .react(s => {
              s.textAlign = 'left'
              s.className = 'def'
              s.textColor = theme().h1
              s.fontWeight = '100'
              s.letterSpacing = '2px'
              s.fontSize = '2.5rem'
              s.text = info.author?.firstname
            })
        })

      //years
      p()
        .observe(info)
        .react(s => {
          s.width = '100%'
          s.textAlign = 'center'
          s.className = 'def'
          s.textColor = theme().text
          s.fontWeight = '100'
          s.letterSpacing = '2px'
          s.fontSize = '1.1rem'
          s.text = info.author?.years
        })

      //photo
      info.photo && image()
        .observe(info)
        .react(s => {
          s.overflow = 'hidden'
          s.maxWidth = '600px'
          s.opacity = '0.8'
          s.paddingVertical = '50px'
          s.alt = "Author's photo"
          s.src = globalContext.restApi.assetsUrl + info.photo
        })

      //about
      Markdown()
        .observe(info)
        .react(s => {
          s.className = 'article'
          s.textAlign = 'left'
          s.textColor = theme().h1 + 'aa'
          s.paddingVertical = '20px'
          s.fontSize = '1.3rem'
          s.text = info.about
        })
    })
}

const ArticleFileInfo = (info: InfoPage) => {
  console.log('new ArticleFileInfo')
  const parent = info.file.parent

  return vstack()
    .react(s => {
      s.width = '100%'
      s.valign = 'top'
      s.halign = 'left'
      s.gap = '0px'
      s.paddingVertical = '50px'
    })
    .children(() => {

      //name
      p()
        .observe(info)
        .react(s => {
          s.width = '100%'
          s.textAlign = 'left'
          s.className = 'article'
          s.textColor = theme().h1
          s.fontWeight = 'bold'
          s.textTransform = 'uppercase'
          s.letterSpacing = '2px'
          s.fontSize = '2.5rem'
          s.text = info.name
        })

      //author
      if (info.textAuthor || parent?.info.author)
        p()
          .observe(info)
          .react(s => {
            s.className = 'article'
            s.textColor = theme().h1 + '50'
            s.fontSize = '1.2rem'
            s.whiteSpace = 'nowrap'
            s.paddingBottom = '10px'
            if (info.textAuthor) s.text = info.textAuthor
            else if (parent?.info.author) s.text = info.year ? parent.info.author.shortName + ', ' + info.year : parent.info.author.shortName
          })

      //about
      Markdown()
        .observe(info)
        .react(s => {
          s.textAlign = 'left'
          s.className = theme().id
          s.width = '100%'
          s.textColor = theme().h1 + 'aa'
          s.paddingVertical = '20px'
          s.fontSize = '1.3rem'
          s.text = info.about
        })
    })
}


const PageList = (file: TextFile) => {
  return vlist<Page>()
    .observe(file, "affectsChildrenProps")
    .react(s => {
      s.className = 'article'
      s.textColor = theme().text
      s.gap = "0px"
      s.width = "100%"
    })
    .items(() => file.pages)
    .itemRenderer(PageView)
    .equals((a, b) => a.uid === b.uid)
}

const PageView = (page: Page, index: number) => {
  console.log('new PageView')
  const ctx = IndexContext.self
  const editor = ctx.editor

  const toggleSelection = (e: any) => {
    e.stopPropagation()
    editor.selectedPage = editor.selectedPage === page ? undefined : page
  }

  return div()
    .observe(page)
    .observe(ctx.$isSelectedFileEditing)
    .react(s => {
      console.log('PageView, updated props')
      const isEditing = ctx.$isSelectedFileEditing.value
      s.id = '#' + index
      s.className = theme().id
      s.textSelectable = !isEditing
      s.maxWidth = theme().maxBlogTextWidth
      s.width = "100%"
      s.minHeight = "30px"
      s.paddingBottom = '50px'
      s.paddingLeft = isEditing && page.isSelected ? '74px' : '80px'
      s.borderLeft = isEditing && page.isSelected ? '6px solid ' + theme().red : undefined
      s.bgColor = isEditing && page.isSelected ? theme().selectedBlockBg : undefined
    })
    .whenHovered(s => {
      const isEditing = ctx.$isSelectedFileEditing.value
      s.bgColor = isEditing && page.isSelected ? theme().selectedBlockBg : isEditing ? theme().hoveredBlockBg : undefined
    })
    .onMouseDown((e) => ctx.$isSelectedFileEditing.value && toggleSelection(e))
    .children(() => {

      Markdown()
        .observe(page)
        .react(s => {
          s.width = '100%'
          s.text = page.text
          s.fontSize = page.file && (page.file.info.fontSize || theme().defFontSize)
          s.apiUrl = globalContext.restApi.assetsUrl
          s.showRawText = page.file.showRawText
          //s.fontFamily = isCode ? 'var(--font-family)' : 'var(--font-family-article)'
        })
    })
}