import { globalContext } from "../../App"
import { LayoutLayer } from "../../global/Application"
import { MaterialIcon } from "../../global/MaterialIcon"
import { theme } from "../../global/ThemeManager"
import { link, spacer, span, vlist, vstack } from "flinker-dom"
import { TextFile } from "../domain/IndexModel"
import { IndexContext } from "../IndexContext"
import { Icon, RedBtn } from "./controls/Button"

export const FileTreeView = () => {
  const ctx = IndexContext.self
  console.log('new FileTreeView, selectedFile:', ctx.$selectedFile.value?.link)

  const $isFileLoaded = ctx.$selectedFile.pipe()
    .skipNullable()
    .flatMap(f => f)
    .map(f => f.filesLoaded)
    .removeDuplicates()
    .fork()

  const createDir = () => {
    const res = ctx.root.createAndAddDirectory()
    if (res) globalContext.app.navigate(res.link)
  }

  return vstack()
    .react(s => {
      s.width = '100%'
      s.gap = '8px'
      s.fontSize = '1rem'
      s.paddingLeft = '20px'
      s.paddingRight = '20px'
      s.paddingBottom = '20px'
      s.layer = LayoutLayer.MODAL
    }).children(() => {
      vlist<Node>()
        .observe(ctx.$selectedFile)
        .observe($isFileLoaded)
        .items(() => {
          const selectedFile = ctx.$selectedFile.value
          const openedDirectoriesIds = selectedFile?.link.split('/').filter(s => s) ?? []
          console.log('FileTreeView:openedDirectoriesIds:', openedDirectoriesIds)
          return fileToNodes(ctx.root, openedDirectoriesIds, 0, selectedFile)
        })
        .itemRenderer(FileLink)
        .equals((a, b) => a.key === b.key)
        .react(s => {
          s.width = '100%'
          s.gap = '0'
          s.fontSize = '1rem'
        })

      spacer()
        .react(s => s.height = '25px')

      RedBtn()
        .react(s => s.text = 'Add Directory')
        .onClick(() => createDir())
    })
}

interface Node {
  key: string
  type: 'author' | 'dir' | 'file' | 'page'
  depth: number
  isSelected: boolean
  title: string
  link: string
}

const FileLink = (n: Node) => {
  return link()
    .react(s => {
      s.href = n.link
      s.width = '100%'
      s.textColor = n.isSelected ? theme().menuSelectedItem : n.type === 'page' ? theme().blue : theme().menuItem
      s.fontWeight = n.isSelected ? 'bold' : theme().defFontWeight
      s.paddingLeft = ((n.depth - 1) * 25) + 'px'
      s.paddingVertical = '5px'
      s.lineHeight = '1.1'
      s.textDecoration = 'none'
      s.minHeight = '0'
      s.display = 'flex'
      s.flexDirection = 'row'
      s.alignItems = 'center'
      s.justifyContent = 'left'
      s.gap = '7px'
      s.wrap = false
      s.boxSizing = 'border-box'
    })
    .whenHovered(s => {
      s.textColor = n.isSelected ? theme().menuSelectedItem : theme().menuHoveredItem
    })
    .onClick((e) => {
      e.preventDefault() //avoid page reloading
      globalContext.app.navigate(n.link)
    }).children(() => {

      //icon
      n.type === 'dir' && Icon()
        .react(s => {
          s.textColor = 'inherit'
          s.fontSize = '1.1rem'
          s.value = MaterialIcon.folder
        })

      //text
      span()
        .react(s => {
          s.text = n.title
          s.textColor = 'inherit'
          s.fontSize = 'inherit'
          s.fontFamily = 'inherit'
        })
    })
}

const PAGE_HEADER_SEARCH_REG = /\$#+ *(.+)/i
const fileToNodes = (from: TextFile, openedDirectoriesIds: string[], openedDirectoryDepth: number, selectedFile?: TextFile) => {
  const res: Node[] = []
  from.children.forEach(f => {
    const isSelected = selectedFile?.uid === f.uid
    const isDirOpened = f.isDirectory && openedDirectoriesIds[openedDirectoryDepth + 1] === f.id
    const n = {} as Node
    n.key = isSelected ? f.uid + 'S' : f.uid + ''
    n.isSelected = isSelected
    n.depth = openedDirectoryDepth + 1
    n.link = f.link
    n.title = f.info.author?.shortName ?? (f.info.year ? f.info.name + '. ' + f.info.year : f.info.name)
    n.type = f.info.author ? 'author' : f.isDirectory ? 'dir' : 'file'

    res.push(n)

    if (isDirOpened) {
      res.push(...fileToNodes(f, openedDirectoriesIds, openedDirectoryDepth + 1, selectedFile))
    }
    else if (isSelected) {
      f.pages.forEach((p, index) => {
        if (p.text.startsWith('$#')) {
          let headerLevel = -1
          let i = 1
          while (p.text.length > i && p.text.at(i) === '#') {
            headerLevel++
            i++
          }

          const pageTitleMatch = p.text.match(PAGE_HEADER_SEARCH_REG)
          const pageTitle = pageTitleMatch && pageTitleMatch.length > 0 ? pageTitleMatch[1] : 'Unknown'

          const pn = {} as Node
          pn.key = p.uid
          pn.isSelected = false
          pn.depth = openedDirectoryDepth + 1 + headerLevel
          pn.link = f.link + '#' + index
          pn.title = pageTitle
          pn.type = 'page'

          res.push(pn)
        }
      })
    }
  })
  return res
}
