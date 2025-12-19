export class TextFormatter {
  constructor() { }

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
      ta.selectionStart = startAt
      ta.selectionEnd = stopAt
      let text = ta.value.slice(startAt, stopAt)
      document.execCommand('insertText', false, this.startFormating(text))
      ta.setSelectionRange(cursorPos, cursorPos)
    } catch (e) {
      console.log('TextFormatter:format: ', e)
    }
  }

  startFormating(value: string): string {
    let text = this.removeExtraSpacesAtTheBeginning(value)
    text = this.removeExtraSpacesAtTheEnd(text)
    text = this.reduceEmptyLines(text)
    text = this.removeExtraSpacesInTheMiddle(text)
    text = this.replaceHyphenWithDash(text)
    text = this.removeHyphenAndSpace(text)
    text = this.replaceQuotes(text)

    return text
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
      .replace(/[-–]$/gm, '—')
      .replaceAll('\n- ', '\n— ')
      .replace(/([А-я])- \n/g, '$1')
  }

  replaceQuotes(s: string): string {
    return s
      .replace(/[”„“]/g, '"')
      .replace(/[’´]/g, "'")
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