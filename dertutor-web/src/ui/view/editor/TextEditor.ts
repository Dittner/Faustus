import { textarea } from "flinker-dom"
import { TextEditorController } from "./TextEditorController"
import { TextFormatter } from "./TextFormatter"
import { theme } from "../../theme/ThemeManager"
import { FontFamily } from "../../controls/Font"

export const TextEditor = (formatter: TextFormatter) => {
  console.log('new TextEditor')

  const keyDownFn = (e: KeyboardEvent) => {
    const ta = e.currentTarget as HTMLTextAreaElement
    //console.log('e.keyCode = ', e.keyCode)

    // Ctrl+Shift+U
    if (e.ctrlKey && e.shiftKey && e.keyCode === 85) {
      e.preventDefault()
      e.stopPropagation()
      TextEditorController.uppercase(ta)
    }
    // Ctrl+Shift+X
    if (e.ctrlKey && e.shiftKey && e.keyCode === 88) {
      e.preventDefault()
      e.stopPropagation()
      TextEditorController.removeSentenceUnderCursor(ta)
    }
    // Ctrl+Shift+L
    else if (e.ctrlKey && e.shiftKey && e.keyCode === 76) {
      e.preventDefault()
      e.stopPropagation()
      TextEditorController.lowercase(ta)
    } // Ctrl+Shift+`
    else if (e.ctrlKey && e.shiftKey && e.keyCode === 192) {
      if (ta) {
        e.preventDefault()
        e.stopPropagation()
        TextEditorController.wrapAsMultilineCode(ta)
        TextEditorController.scrollToCursor(ta)
      }
    } // Ctrl+Shift+R
    else if (e.ctrlKey && e.shiftKey && e.keyCode === 82) {
      e.preventDefault()
      e.stopPropagation()
      TextEditorController.removeNewLines(ta)
    } // Ctrl+Shift+D
    else if (e.ctrlKey && e.shiftKey && e.keyCode === 68) {
      e.preventDefault()
      e.stopPropagation()
      TextEditorController.duplicateLine(ta)
    } //Ctrl+Shift+F
    else if (e.ctrlKey && e.shiftKey && e.keyCode === 70) {
      e.preventDefault()
      e.stopPropagation()
      formatter.format(ta)
    }
    // Tab
    else if (e.keyCode === 9) {
      e.preventDefault()
      e.stopPropagation()
      TextEditorController.tabulate(ta)
    } // Enter
    else if (e.keyCode === 13) {
      e.stopPropagation()
      e.preventDefault()
      TextEditorController.newLine(ta)
      TextEditorController.adjustScroller(ta)
    }
    // PageUp key
    else if (e.keyCode === 33) {
      e.preventDefault()
      e.stopPropagation()
      ta.setSelectionRange(0, 0)
      TextEditorController.scrollToCursor(ta)
    }
    // PageDown key
    else if (e.keyCode === 34) {
      e.preventDefault()
      e.stopPropagation()
      const length = ta.value.length
      ta.setSelectionRange(length, length)
      TextEditorController.scrollToCursor(ta)
    }
    // Home key
    else if (e.keyCode === 36) {
      e.preventDefault()
      e.stopPropagation()
      TextEditorController.moveCursorToBeginLine(ta)
    }
    // End key
    else if (e.keyCode === 35) {
      e.preventDefault()
      e.stopPropagation()
      TextEditorController.moveCursorToEndLine(ta)
    }
  }

  return textarea()
    .react(s => {
      s.className = 'listScrollbar'
      s.width = '100%'
      s.bgColor = theme().appBg
      s.caretColor = theme().isLight ? '#000000' : theme().red
      s.fontFamily = FontFamily.ARTICLE
      s.fontSize = theme().defFontSize
      s.textColor = theme().editor
      s.textAlign = 'left'
      s.autoCorrect = 'off'
      s.autoFocus = true
      s.spellCheck = false
      s.paddingHorizontal = '5px'
      s.disableHorizontalScroll = true
    })
    .onKeyDown(keyDownFn)
}