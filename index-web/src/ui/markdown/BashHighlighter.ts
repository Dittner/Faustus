import { CodeHighlighter, Lexema, MDToken } from "./CodeHighlighter"

const multilineGrammar = [
  'STR(")(")',
  "STR(')(')",
  'STR(`)(`)'
]

const grammar = [
  //Supports numbers with undescores
  'ID(^[_0-9]+$:N)',
  //Identifiers can have numbers(N)
  'ID(:) N(:ID)',
  //Supports complex numbers
  'N(:) ID(^j$:N)',
  //Supports hex numbers
  'N(^0$:) ID(^x:N)',
]

export class BashCodeHighlighter {
  private readonly highlighter: CodeHighlighter
  constructor() {
    this.highlighter = new CodeHighlighter(grammar, multilineGrammar)
  }

  tokenize(code: string): MDToken {
    return this.highlighter.tokenize(code, true)
  }

  htmlize(root: MDToken): string {
    let res = ''
    let t: MDToken | undefined = root
    while (t) {
      const text = t.value.replaceAll('<', '&lt;')
      if (text.length === 0) return ''
      switch (t.lex) {
        case Lexema.LineBreak: res += text; break
        case Lexema.Number: res += '<span class="num">' + text + '</span>'; break
        case Lexema.Operator: res += '<span class="op">' + text + '</span>'; break
        case Lexema.String: res += '<span class="str">' + text + '</span>'; break
        case Lexema.Empty: break
        default: res += '<span class="bash">' + text + '</span>'; break
      }
      t = t.next()
    }
    return res
  }
}
