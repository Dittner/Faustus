import { observer, p, span, vstack } from "flinker-dom"
import { theme } from "../../theme/ThemeManager"
import { FileSearcher } from "./FileSearch"
import { IndexContext } from "../../IndexContext"
import { FontFamily } from "../../controls/Font"
import { LayoutLayer } from "../../../app/Application"
import { LineInput } from "../../controls/Input"
import { FileNode } from "../FileNode"

export const FileSearchView = () => {
  const ctx = IndexContext.self

  return observer(ctx.$mode)
    .onReceive(mode => {
      return mode === ctx.searcher && vstack()
        .react(s => {
          s.position = 'fixed'
          s.width = '100%'
          s.height = '100vh'
          s.paddingBottom = theme().statusBarHeight + 'px'
          s.layer = LayoutLayer.MODAL
        }).children(() => {

          SearchResults(ctx.searcher)
            .react(s => {
              s.width = '100%'
              s.height = '100%'
              s.gap = '0'
              s.className = 'listScrollbar'
              s.enableOwnScroller = true
            })

          LineInput(ctx.searcher.$buffer, ctx.searcher.$cursorPos)
            .observe(ctx.explorer.$mode)
            .react(s => {
              s.title = '/'
              s.position = 'fixed'
              s.width = '100%'
              s.height = theme().statusBarHeight + 'px'
              s.bottom = '0'
              s.layer = LayoutLayer.MODAL
            })

          FoundTotalBar(ctx.searcher)
            .react(s => {
              s.position = 'fixed'
              s.bottom = '0'
              s.right = '20px'
              s.layer = LayoutLayer.MODAL
            })
        })
    })
}


const SearchResults = (searcher: FileSearcher) => {
  return vstack()
    .observe(searcher.$buffer, "recreateChildren")
    .observe(searcher.$availableFiles, "recreateChildren")
    .children(() => {
      console.log('Recreating children of search results')
      const ss = searcher.$buffer.value
      const files = searcher.$availableFiles.value
      files.forEach(f => {
        SearchResultItem(f, ss)
      })
    })
}


const SearchResultItem = (f: FileNode, searchValue: string) => {
  const textColor = f.isDir ? theme().menuDir : theme().menuFile
  const searcher = IndexContext.self.searcher
  const host = p()
  return host
    .observe(searcher.$selectedFilePath, 'affectsChildrenProps')
    .react(s => {
      s.fontSize = theme().defMenuFontSize
      s.fontFamily = FontFamily.MONO
      s.width = '100%'
      s.wrap = false
      s.className = theme().id
    })
    .children(() => {
      span()
        .react(s => {
          const underCurser = searcher.$selectedFilePath.value === f.path
          if (underCurser) {
            host.dom.scrollIntoView({
              behavior: 'instant',
              block: 'center'
            })
          }
          const text = f.isDir ? f.id + '/' : searcher.filesAliasVoc.get(f.path) ?? f.id
          s.fontFamily = 'inherit'
          s.textColor = underCurser ? theme().white : textColor
          s.bgColor = underCurser ? theme().black : theme().transparent
          s.padding = '5px'
          s.paddingLeft = '20px'
          s.htmlText = searchValue ? text.replace(new RegExp('(' + searchValue + ')', 'gi'),
            (_: string, found: string) => {
              return '<mark>' + found + '</mark>'
            }) : text
        })

      span().react(s => {
        const underCurser = searcher.$selectedFilePath.value === f.path
        const text = '~' + f.path
        s.fontFamily = 'inherit'
        s.paddingLeft = '25px'
        s.textColor = underCurser ? theme().white : theme().menuPath
        s.bgColor = underCurser ? theme().black : theme().transparent
        s.fontStyle = 'italic'
        s.padding = '5px'
        s.htmlText = searchValue ? text.replaceAll(searchValue, '<mark>' + searchValue + '</mark>') : text
      })
    })
}

const FoundTotalBar = (searcher: FileSearcher) => {
  return p()
    .observe(searcher.$availableFiles)
    .observe(searcher.$allFiles)
    .react(s => {
      s.text = searcher.$availableFiles.value.length + '/' + searcher.$allFiles.value.length
      s.lineHeight = theme().statusBarHeight + 'px'
      s.height = theme().statusBarHeight + 'px'
      s.fontFamily = FontFamily.MONO
      s.fontSize = theme().defMenuFontSize
      s.textColor = theme().black
    })
}