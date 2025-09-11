import { CodeHighlighter, Lexema, MDToken } from "./CodeHighlighter"

const multilineGrammar = [
  'STR(""")(""")',
  "STR(''')(''')",
  'CMT(/*)(*/)',
  'CMT(#)(\n)',
  'CMT(//)(\n)',
  'STR(")(")',
  "STR(')(')",
  'STR(`)(`)'
]

const grammar = [
  //Replace IDs token with Decorators(D)
  'O(^@$:D) ID(:D)',
  'D(:) O(^[.]$:) ID(:D)',
  //Replace IDs token with Keywords
  'ID(^(extends|default|implements|catch|switch|static|override|internal|void|null|protected|abstract|export|public|readonly|private|var|const|let|final|throws|throw|new|instanceof|and|as|assert|case|match|async|await|break|interface|class|continue|def|del|elif|else|except|finally|for|from|global|if|import|in|is|lambda|nonlocal|not|or|get|set|pass|raise|return|try|while|with|yield)$:KW)',
  //Replace IDs token with Standad types(K) 
  'ID(^(object|void|null|undefined|self|this|dict|string|list|double|False|false|None|bool|int|str|enum|number|float|never|True|true)$:KT)',
  //Supports numbers with undescores
  'ID(^[_0-9]+$:N)',
  //Identifiers can have numbers(N)
  'ID(:) N(:ID)',
  //Replace IDs token separated with Spaces with Class
  'KW(^(class|interface|new)$:) SPA(:) ID(:CLS)',
  //Replace IDs or Keytypes or Keywords tokens with Functions
  'ID|KT|KW(:F) O(^[(<](?!\/):)',
  //Supports complex numbers
  'N(:) ID(^j$:N)',
  //Supports html tags
  'O(</?:) ID(:TAG)',
  //Supports hex numbers
  'N(^0$:) ID(^x:N)',
  //Supports strings formating
  'ID(^[fbr]$:STR) STR(:)',
]


export class UniversalCodeHighlighter {
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
        case Lexema.Comment: res += '<span class="cmt">' + text + '</span>'; break
        case Lexema.Keyword: res += '<span class="kw">' + text + '</span>'; break
        case Lexema.Keytype: res += '<span class="kt">' + text + '</span>'; break
        case Lexema.Class: res += '<span class="cl">' + text + '</span>'; break
        case Lexema.Function: res += '<span class="fn">' + text + '</span>'; break
        case Lexema.Decorator: res += '<span class="dec">' + text + '</span>'; break
        case Lexema.Tag: res += '<span class="tag">' + text + '</span>'; break
        case Lexema.Empty: break
        default: res += text
      }
      t = t.next()
    }
    return res
  }
}
