import { RXObservableValue } from 'flinker';
import { IndexContext } from '../../app/IndexContext';
import { Page } from '../../domain/DomainModel';

export interface NumberProtocol {
  value: number
}

export interface InputProtocol {
  value: string;
}

export class Editor {
  readonly $inputBuffer = new RXObservableValue('')
  readonly $selectedPage = new RXObservableValue<Page | undefined>(undefined)
  readonly $isTextReplacing = new RXObservableValue(false)
  readonly $replaceSubstring = new RXObservableValue('')
  readonly $replaceWith = new RXObservableValue('')

  private readonly ctx: IndexContext

  constructor(ctx: IndexContext) {
    this.ctx = ctx

    ctx.$selectedFile.pipe()
      .skipNullable()
      .flatMap(f => f)
      .map(f => f.isEditing)
      .removeDuplicates()
      .onReceive(isEditing => {
        if (isEditing) {
          if (this.selectedPage?.file !== ctx.$selectedFile.value) {
            this.selectedPage = ctx.$selectedFile.value.info
          }
        } else {
          this.applyTextChanges()
        }
      })
      .subscribe()

    this.$inputBuffer.pipe()
      .debounce(500)
      .onReceive(_ => this.applyTextChanges())

    document.addEventListener('keydown', this.onKeyDown.bind(this))
  }

  private applyTextChanges() {
    if (this.selectedPage) {
      this.selectedPage.text = this.$inputBuffer.value
    }
  }

  //--------------------------------------
  //  selectedPage
  //--------------------------------------
  get selectedPage(): Page | undefined { return this.$selectedPage.value }
  set selectedPage(value: Page | undefined) {
    if (this.$selectedPage.value !== value) {
      this.applyTextChanges()
      if (this.$selectedPage.value) this.$selectedPage.value.isSelected = false
      this.$selectedPage.value = value
      if (value) value.isSelected = true
      this.$inputBuffer.value = this.$selectedPage.value?.text ?? ''
      console.log('Editor:selectedPage:', value)
    }
  }

  private onKeyDown(e: KeyboardEvent) {
    //Ctrl + Shift + P
    //console.log(e.keyCode)
    //Ignore TAB key
    if (e.keyCode === 9) {
      e.preventDefault()
      e.stopPropagation()
    }
    if (e.ctrlKey && e.shiftKey) {
      //Ctrl + Shift + P
      if (e.keyCode === 80) {
        e.preventDefault()
        e.stopPropagation()
        this.createPage()
      }
      //Ctrl + Shift + S
      else if (e.keyCode === 83) {
        e.preventDefault()
        e.stopPropagation()
        this.ctx.storeService.store()
      }
      //Ctrl + Shift + E
      else if (e.keyCode === 69) {
        e.preventDefault()
        e.stopPropagation()
        if (this.ctx.$selectedFile.value) {
          this.ctx.$selectedFile.value.isEditing = !this.ctx.$selectedFile.value.isEditing
        }
      }
      //Ctrl + Shift + I
      else if (e.keyCode === 73) {
        e.preventDefault()
        e.stopPropagation()
        if (!this.ctx.$selectedFile.value.isEditing) {
          this.ctx.$isFileTreeShown.value = !this.ctx.$isFileTreeShown.value
        }
      }
      //Ctrl + Shift + F
      else if (this.ctx.$selectedFile.value?.isEditing && e.keyCode === 70) {
        e.preventDefault()
        e.stopPropagation()
        this.$inputBuffer.value = this.startFormatting(this.$inputBuffer.value)
      }
    }
  }

  //--------------------------------------
  //  create, move page
  //--------------------------------------

  createPage() {
    const f = this.ctx.$selectedFile.value
    if (f?.isEditing) {
      if (this.selectedPage) {
        const curPageIndex = f.pages.findIndex(p => p.uid === this.selectedPage?.uid)
        this.selectedPage = (f.createPage(curPageIndex + 1))
      } else {
        this.selectedPage = f.createPage(f.pages.length)
        window.scroll(0, document.documentElement.scrollHeight)
      }
    }
  }

  movePageUp() {
    if (this.ctx.$selectedFile.value?.isEditing && this.selectedPage) {
      this.selectedPage?.file?.movePageUp(this.selectedPage)
    }
  }

  movePageDown() {
    if (this.ctx.$selectedFile.value?.isEditing && this.selectedPage?.file) {
      this.selectedPage?.file.movePageDown(this.selectedPage)
    }
  }

  deletePage() {
    console.log('---Deleting page!')
    const f = this.ctx.$selectedFile.value
    if (f?.isEditing && this.selectedPage && f?.remove(this.selectedPage)) {
      this.selectedPage = undefined
    }
  }

  //--------------------------------------
  //  maxEmptyLines
  //--------------------------------------
  readonly MAX_EMPTY_LINES = 2

  startFormatting(value: string): string {
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
      .replace(/[-–]$/gm, '—')
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

  replaceWith() {
    const substr = this.$replaceSubstring.value
    const replaceValue = this.$replaceWith.value

    const f = this.ctx.$selectedFile.value
    if (f?.isEditing && substr) {
      f.replaceWith(substr, replaceValue)
      this.$inputBuffer.value = this.selectedPage?.text ?? ''
    }
  }
}
