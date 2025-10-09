import { div, observer, textarea } from "flinker-dom"
import { IndexContext } from "../../app/IndexContext"
import { theme } from "../../app/ThemeManager"
import { FontFamily } from "../controls/Font"
import { FileTextReplacer } from "./FileTextReplacer"

export const EditorView = () => {
  console.log('new EditorView')
  const ctx = IndexContext.self

  return div().children(() => {
    TextArea()
      .bind(ctx.editor.$inputBuffer)
      .observe(ctx.editor.$isTextReplacing)
      .observe(ctx.editor.$selectedPage)
      .react(s => {
        console.log('EditorView.TextArea: propsDidUpdate, props:', s)
        s.visible = !ctx.editor.$isTextReplacing.value
        s.mouseEnabled = ctx.editor.selectedPage !== undefined
        s.height = window.innerHeight - 40 + 'px'
        s.top = '40px'
        s.position = 'relative'
      })

    observer(ctx.editor.$isTextReplacing)
      .onReceive(isTextReplacing => {
        return isTextReplacing && FileTextReplacer()
          .react(s => {
            s.height = window.innerHeight - 40 + 'px'
            s.top = '40px'
            s.position = 'relative'
            s.bgColor = theme().appBg
          })
      })
  })
}

/*
*
* TextArea
*
* */

const TextArea = () => {
  console.log('new EditorView.TextArea')

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
    } // Tab
    else if (e.keyCode === 9) {
      e.preventDefault()
      e.stopPropagation()
      TextEditorController.tabulate(ta)
    }
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
      s.textColor = theme().editorText
      s.textAlign = 'left'
      s.autoCorrect = 'off'
      s.spellCheck = false
      s.paddingHorizontal = '20px'
      s.disableHorizontalScroll = true
    })
    .onKeyDown(keyDownFn)
}

class TextEditorController {
  static scrollToCursor(ta: HTMLTextAreaElement) {
    ta.blur()
    ta.focus()
  }

  static newLine(ta: HTMLTextAreaElement) {
    const value = ta.value
    const selectionStart = ta.selectionStart

    let beginRowIndex = value.lastIndexOf('\n', selectionStart - 1)
    beginRowIndex = beginRowIndex !== -1 ? beginRowIndex + 1 : 0

    const row = value.slice(beginRowIndex, selectionStart)
    const beginRowSpaces = TextEditorController.calcSpaceBefore(row)

    //console.log('Row:' + 'BEGIN' + row + 'END, beginRowSpaces:', beginRowSpaces)

    const spaces = '\n' + ' '.repeat(beginRowSpaces)
    // func setRangeText unfortunately clears browser history
    // ta.current.setRangeText(spaces, selectionStart, selectionStart, 'end')
    document.execCommand('insertText', false, spaces)
    TextEditorController.scrollToCursor(ta)
  }

  static calcSpaceBefore(row: string): number {
    if (!row) return 0
    for (let i = 0; i < row.length; i++) {
      if (row.charAt(i) !== ' ') {
        return i
      }
    }
    return row.length
  }

  static adjustScroller(ta: HTMLTextAreaElement) {
    ta.style.height = 'inherit'
    ta.style.height = `${ta.scrollHeight + 5}px`
  }

  static moveCursorToEndLine(ta: HTMLTextAreaElement) {
    const endOfTheLineIndex = ta.value.indexOf('\n', ta.selectionStart)
    if (endOfTheLineIndex !== -1) {
      ta.setSelectionRange(endOfTheLineIndex, endOfTheLineIndex)
    } else {
      ta.setSelectionRange(ta.value.length, ta.value.length)
    }
  }

  static moveCursorToBeginLine(ta: HTMLTextAreaElement) {
    let beginOfTheLineIndex = ta.value.lastIndexOf('\n', ta.selectionStart - 1)
    if (beginOfTheLineIndex !== -1) {
      for (let i = beginOfTheLineIndex + 1; i < ta.value.length; i++) {
        if (ta.value.at(i) !== ' ') {
          beginOfTheLineIndex = i
          break
        }
      }
      ta.setSelectionRange(beginOfTheLineIndex, beginOfTheLineIndex)
    } else {
      ta.setSelectionRange(0, 0)
    }
  }

  static removeSentenceUnderCursor(ta: HTMLTextAreaElement) {
    let beginOfTheLineIndex = ta.value.lastIndexOf('\n', ta.selectionStart - 1)
    if (beginOfTheLineIndex === -1) beginOfTheLineIndex = 0
    let endOfTheLineIndex = ta.value.indexOf('\n', ta.selectionStart)
    if (endOfTheLineIndex === -1) endOfTheLineIndex = ta.value.length

    ta.setSelectionRange(beginOfTheLineIndex, endOfTheLineIndex)
    document.execCommand('insertText', false, '')
    ta.setSelectionRange(beginOfTheLineIndex, endOfTheLineIndex)

    if (beginOfTheLineIndex < ta.value.length - 1) beginOfTheLineIndex++
    ta.setSelectionRange(beginOfTheLineIndex, beginOfTheLineIndex)
    this.moveCursorToEndLine(ta)
  }

  static uppercase(ta: HTMLTextAreaElement) {
    try {
      if (ta.selectionStart === ta.selectionEnd) return
      let text = ta.value.slice(ta.selectionStart, ta.selectionEnd)
      document.execCommand('insertText', false, text.toUpperCase())
    } catch (e) {
      console.log('TextEditorController:uppercase: ', e)
    }
  }

  static removeNewLines(ta: HTMLTextAreaElement) {
    try {
      if (ta.selectionStart === ta.selectionEnd) return
      let text = ta.value.slice(ta.selectionStart, ta.selectionEnd)
      text = text.replace(/[-–—]\n/g, '')
      text = text.replace(/\n/g, ' ').replace('  ', ' ')
      document.execCommand('insertText', false, text)
    } catch (e) {
      console.log('TextEditorController:removeNewLines: ', e)
    }
  }

  static duplicateLine(ta: HTMLTextAreaElement) {
    let beginOfTheLineIndex = ta.value.lastIndexOf('\n', ta.selectionStart - 1)
    if (beginOfTheLineIndex === -1) beginOfTheLineIndex = 0
    let endOfTheLineIndex = ta.value.indexOf('\n', ta.selectionStart)
    if (endOfTheLineIndex === -1) endOfTheLineIndex = ta.value.length

    const line = beginOfTheLineIndex === 0 ?
      '\n' + ta.value.slice(beginOfTheLineIndex, endOfTheLineIndex) :
      ta.value.slice(beginOfTheLineIndex, endOfTheLineIndex)

    if (!line) return

    ta.setSelectionRange(endOfTheLineIndex, endOfTheLineIndex)
    document.execCommand('insertText', false, line)
  }

  static tabulate(ta: HTMLTextAreaElement) {
    document.execCommand('insertText', false, '    ')
  }

  static lowercase(ta: HTMLTextAreaElement) {
    try {
      if (ta.selectionStart === ta.selectionEnd) return
      let text = ta.value.slice(ta.selectionStart, ta.selectionEnd)
      document.execCommand('insertText', false, text.toLowerCase())
    } catch (e) {
      console.log('TextEditorController:lowercase: ', e)
    }
  }

  static wrapAsMultilineCode(ta: HTMLTextAreaElement) {
    try {
      if (ta.selectionStart === ta.selectionEnd) {
        document.execCommand('insertText', false, '```\n```')
        ta.setSelectionRange(ta.selectionStart - 4, ta.selectionStart - 4)
        return
      }
      let selectionStart = ta.selectionStart
      let text = ta.value.slice(ta.selectionStart, ta.selectionEnd)
      document.execCommand('insertText', false, '```\n' + text + '\n```')
      ta.setSelectionRange(selectionStart + 3, selectionStart + 3)
    } catch (e) {
      console.log('TextEditorController:wrapAsMultilineCode: ', e)
    }
  }
}