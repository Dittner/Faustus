import { textarea } from "flinker-dom"
import { IndexContext } from "../../IndexContext"
import { theme } from "../../theme/ThemeManager"
import { FontFamily } from "../../controls/Font"
import { Page } from "../../../domain/DomainModel"
import { log, logErr } from "../../../app/Logger"

export const EditorView = () => {
  log('new EditorView')
  const reader = IndexContext.self.reader
  let pageInFocus: Page | undefined = undefined
  const formatter = new TextFormatter()

  // const onFocus = (e: FocusEvent) => {
  //   if (pageInFocus !== reader.$selectedPage.value) {
  //     pageInFocus = reader.$selectedPage.value
  //     const ta = e.currentTarget as HTMLTextAreaElement
  //     //scroll to first line
  //     ta.setSelectionRange(0, 0)
  //     ta.blur()
  //     ta.focus()
  //   }
  // }

  return TextEditor(formatter)
    .bind(reader.$inputBuffer)
    //.onFocus(onFocus)
}

/*
*
* TextArea
*
* */

const TextEditor = (formatter:TextFormatter) => {
  log('new EditorView.TextArea')

  const keyDownFn = (e: KeyboardEvent) => {
    const ta = e.currentTarget as HTMLTextAreaElement
    //log('e.keyCode = ', e.keyCode)

    // Ctrl+Shift+U
    if (e.ctrlKey && e.shiftKey && e.keyCode === 85) {
      e.preventDefault()
      e.stopPropagation()
      TextEditorController.uppercase(ta)
    }
    // Ctrl+Shift+X or Cmd + Backspace
    if ((e.ctrlKey && e.shiftKey && e.keyCode === 88) || (e.metaKey && e.keyCode === 8)) {
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
    } //Ctrl + Shift + F
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
      s.textColor = theme().editorText
      s.textAlign = 'left'
      s.autoCorrect = 'off'
      s.autoFocus = true
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

    //log('Row:' + 'BEGIN' + row + 'END, beginRowSpaces:', beginRowSpaces)

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
      log('TextEditorController:uppercase: ', e)
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
      log('TextEditorController:removeNewLines: ', e)
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
      log('TextEditorController:lowercase: ', e)
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
      log('TextEditorController:wrapAsMultilineCode: ', e)
    }
  }
}

class TextFormatter {
  constructor() {}

  //--------------------------------------
  //  maxEmptyLines
  //--------------------------------------
  readonly MAX_EMPTY_LINES = 2

  format(ta: HTMLTextAreaElement) {
    try {
      const cursorPos = ta.selectionStart
      let startAt = ta.selectionStart
      let stopAt = ta.selectionEnd
      if (ta.selectionStart === ta.selectionEnd) {
        startAt = 0
        stopAt = ta.value.length
      }

      const text = ta.value.slice(startAt, stopAt)
      const formattedText = this.startFormating(text)
      if (formattedText !== text) {
        ta.selectionStart = startAt
        ta.selectionEnd = stopAt
        document.execCommand('insertText', false, formattedText)
        ta.setSelectionRange(cursorPos, cursorPos)
        ta.blur()
        ta.focus()
      }

    } catch (e) {
      logErr('TextFormatter:format: ', e)
    }
  }

  startFormating(value: string): string {
    let text = this.removeExtraSpacesAtTheBeginning(value)
    text = this.removeExtraSpacesAtTheEnd(text)
    text = this.reduceEmptyLines(text)

    const res: string[] = []
    const textBuffer: string[] = []
    const codeBuffer: string[] = []
    let codeCounter = 0

    const realizeBuffers = () => {
      if (textBuffer.length > 0) {
        let blockText = textBuffer.join('\n')
        blockText = this.removeExtraSpacesInTheMiddle(blockText)
        blockText = this.replaceHyphenWithDash(blockText)
        blockText = this.removeHyphenAndSpace(blockText)
        blockText = this.replaceQuotes(blockText)
        res.push(blockText)
        textBuffer.length = 0
      }
      if (codeBuffer.length > 0) {
        let code = codeBuffer.join('\n')
        code = this.replaceQuotes(code)
        res.push(code)
        codeBuffer.length = 0
      }
    }

    const rows = text.split('\n')
    rows.forEach(r => {
      if (r.match(/^```code *$/)) {
        codeCounter++
        codeBuffer.push(r)
        if (codeCounter === 1) realizeBuffers()
      }
      else if (r.match(/^``` *$/) && codeCounter > 0) {
        codeCounter--
        codeBuffer.push(r)
        if (codeCounter === 0) realizeBuffers()
      } else if (r.match(/^>>> */) && codeCounter === 0) {
        realizeBuffers()
        codeBuffer.push(r)
        realizeBuffers()
      } else if (codeCounter > 0) {
        codeBuffer.push(r)
      } else {
        textBuffer.push(r)
      }
    })

    realizeBuffers()
    return res.join('\n')
  }

  removeExtraSpacesAtTheBeginning(s: string): string {
    return s.replace(/^[\n ]+/, '')
  }

  removeExtraSpacesAtTheEnd(s: string): string {
    return s.replace(/[\n ]+$/, '')
  }

  removeExtraSpacesInTheMiddle(s: string): string {
    return s
      .replace(/\n +/g, '\n')
      .replace(/ +/g, ' ')
      .replace(/ +,/g, ',')
  }

  replaceHyphenWithDash(s: string): string {
    return s
      .replace(/ -- /g, ' — ')
      .replace(/\n-- /g, '\n— ')
      .replace(/([,.])- /g, '$1 — ')
      .replace(/ [-–] /g, ' — ')
  }

  removeHyphenAndSpace(s: string): string {
    return s
      .replace(/^[-–] /gm, '— ')
      .replace(/ [-–]$/gm, '—')
      .replaceAll('\n- ', '\n— ')
      .replace(/([А-я])- \n/g, '$1')
  }

  replaceQuotes(s: string): string {
    return s
      .replace(/[”„“]/g, '"')
      .replace(/…/g, '...')
  }

  reduceEmptyLines(s: string): string {
    return s
      .replace(/\n\s+\n/g, '\n\n')
      .replace(new RegExp(`\n{${this.MAX_EMPTY_LINES},}`, 'g'), '\n'.repeat(this.MAX_EMPTY_LINES))
  }

  // replaceWith() {
  //   const substr = this.$replaceSubstring.value
  //   const replaceValue = this.$replaceWith.value

  //   const f = this.ctx.$selectedFile.value
  //   if (f?.isEditing && substr) {
  //     f.replaceWith(substr, replaceValue)
  //     this.$inputBuffer.value = this.selectedPage?.text ?? ''
  //   }
  // }
}
