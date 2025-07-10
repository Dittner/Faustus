import { globalContext } from "../../App"
import { MaterialIcon } from "../../global/MaterialIcon"
import { theme, themeManager } from "../../global/ThemeManager"
import { btn, hstack, link, spacer, span } from "flinker-dom"
import { TextFile } from "../domain/IndexModel"
import { IndexContext } from "../IndexContext"
import { IconBtn, RedBtn } from "./controls/Button"

export function NavBar() {
  console.log('new NavBar')
  const ctx = IndexContext.self

  return hstack()
    .react(s => {
      s.bgColor = theme().appBg + '50'
      s.halign = 'left'
      s.valign = 'center'
      s.blur = '15px'
      s.gap = "8px"
    })
    .children(() => {

      IconBtn()
        .observe(ctx.$isFileTreeShown)
        .react(s => {
          s.icon = MaterialIcon.menu
          s.iconSize = '24px'
          s.isSelected = ctx.$isFileTreeShown.value
          s.textColor = theme().menuItem
          s.minHeight = '25px'
        })
        .whenHovered(s => {
          s.textColor = ctx.$isFileTreeShown.value ? theme().menuItem : theme().red
        })
        .whenSelected(s => {
          s.textColor = theme().menuSelectedItem
        })
        .onClick(() => ctx.$isFileTreeShown.value = !ctx.$isFileTreeShown.value)


      hstack()
        .observe(ctx.$selectedFile, 'recreateChildren')
        .react(s => {
          s.halign = 'left'
          s.valign = 'center'
          s.gap = '8px'
        }).children(() => {
          createFileLinks()
        })

      spacer()

      btn()
        .observe(ctx.storeService)
        .react(s => {
          s.text = 'Save'
          s.popUp = 'Save Changes (Ctrl + Shift + S)'
          s.visible = ctx.storeService.isStorePending
          s.isDisabled = !ctx.storeService.isStorePending
          s.textColor = '#ffFFff'
          s.bgColor = theme().red + 'dd'
          s.position = 'absolute'
          s.left = (window.innerWidth - 170 >> 1) + 'px'
          s.paddingHorizontal = '50px'
          s.cornerRadius = '4px'
          s.width = '150px'
          s.height = '35px'
        })
        .whenHovered(s => {
          s.bgColor = theme().red
        })
        .onClick(() => ctx.storeService.store())

      spacer()

      ToolsPanel()
        .observe(ctx.$isSelectedFileEditing)
        .react(s => {
          s.visible = ctx.$isSelectedFileEditing.value
        })

      spacer().react(s => s.width = '50px')

      IconBtn()
        .react(s => {
          s.icon = theme().isLight ? MaterialIcon.light_mode : MaterialIcon.brightness_1
          s.textColor = theme().id === 'night' ? theme().white : theme().red
          s.iconSize = theme().isLight ? '1.2rem' : '0.8rem'
        })
        .onClick(() => {
          if (theme().id === 'light') themeManager.setDarkTheme()
          else if (theme().id === 'dark') themeManager.setNightTheme()
          else themeManager.setLightTheme()
        })
    })
}

const createFileLinks = () => {
  let f: TextFile | undefined = IndexContext.self.$selectedFile.value
  let files = []
  while (f) {
    files.push(f)
    f = f.parent
  }

  files.reverse().forEach((f, i) => {
    if (i !== 0)
      span().react(s => {
        s.text = '>'
        s.textColor = theme().h1
        s.fontWeight = '800'
        s.fontSize = '0.5rem'
        s.opacity = '0.5'
      })

    NavLink()
      .react(s => {
        s.href = f.link
        s.text = f.name
      })
      .onClick((e) => {
        e.preventDefault() //avoid page reloading
        globalContext.app.navigate(f.link)
      })
  })
}

const NavLink = () => {
  return link()
    .react(s => {
      s.textColor = theme().menuItem
      s.fontWeight = theme().defFontWeight
      s.lineHeight = '1.1'
      s.textDecoration = 'none'
    })
    .whenHovered(s => {
      s.textColor = theme().red
    })
}

const ToolsPanel = () => {
  const ctx = IndexContext.self

  return hstack()
    .react(s => {
      s.valign = 'center'
      s.halign = 'left'
      s.height = '40px'
      s.gap = '8px'
    }).children(() => {
      //Add Page
      RedBtn()
        .react(s => {
          s.text = 'Add Page'
          s.popUp = 'Add new page (Ctrl + Shift + P)'
        })
        .onClick(() => ctx.editor.createPage())

      //Replace
      RedBtn()
        .observe(ctx.editor.$isTextReplacing)
        .react(s => {
          s.text = 'Replace'
          s.popUp = 'Rwplace with (Ctrl + Shift + R)'
          s.isSelected = ctx.editor.$isTextReplacing.value
        })
        .onClick(() => ctx.editor.$isTextReplacing.value = !ctx.editor.$isTextReplacing.value)

      //Up
      RedBtn()
        .observe(ctx.editor.$selectedPage)
        .react(s => {
          s.icon = MaterialIcon.arrow_upward
          s.popUp = 'Move page up'
          s.isDisabled = !ctx.editor.selectedPage || !ctx.editor.selectedPage.movable
        })
        .onClick(() => ctx.editor.movePageUp())

      //Down
      RedBtn()
        .observe(ctx.editor.$selectedPage)
        .react(s => {
          s.icon = MaterialIcon.arrow_downward
          s.popUp = 'Move page down'
          s.isDisabled = !ctx.editor.selectedPage || !ctx.editor.selectedPage.movable
        })
        .onClick(() => ctx.editor.movePageDown())

      //Delete selected page
      RedBtn()
        .observe(ctx.editor.$selectedPage)
        .react(s => {
          s.icon = MaterialIcon.delete
          s.popUp = 'Delete selected page'
          s.isDisabled = !ctx.editor.selectedPage || !ctx.editor.selectedPage.movable
        })
        .onClick(() => ctx.editor.deletePage())

      spacer().react(s => s.height = '20px')

      //Quit
      RedBtn()
        .react(s => {
          s.text = 'Quit'
          s.popUp = 'Finish editing (Ctrl + Shift + E)'
        })
        .onClick(() => ctx.$selectedFile.value.isEditing = false)
    })
}
