import { GlobalTheme, theme } from "../../../global/ThemeManager"
import { div, TextProps } from "flinker-dom"
import { Grammar, Lexema, MDToken } from "./Grammar"

const rules: any[] = [
  //character escaping
  [/\\`/gm, '&#x60'],
  [/\\#/gm, '&#x23'],
  [/</g, '&lt;'],

  //blockquote
  [/^> +(.*)\n?/gm, '<blockquote><p>$1</p></blockquote>'],

  //p
  //[/^([^<].*)\s*/gm, '<p>$1</p>'],
  //align center
  [/^==>\s?([^\n]+)\n?/gm, '<p class="md-right">$1</p>'],
  [/^=>\s?([^\n]+)\n?/gm, '<p class="md-center">$1</p>'],

  //list
  [/^\+ +(.*)\n?/gm, '<li>$1</li>'],
  [/^(<li>.+<\/li>)/gm, '<ul>$1</ul>\n'],
  [/^\d+\. +((.|\n(?!(\d+\. |\n|`)))*)\n?/gm, '<li>$1</li>'],
  [/^```ol\n/gm, '<ol>'],
  [/<\/li>```/gm, '</li></ol>'],
  [/<\/ul>\n/gm, '<\/ul>'],

  //div (code)
  [/```([a-zA-Z]+)\n/gm, '<div class="$1"><div>'],
  [/^``` *\n/gm, '</div></div>'],
  [/``` *$/gm, '</div></div>'],
  [/`([^`]+)`/g, '<em>$1</em>'],

  //image
  [/!\[([^\]]+)\]\(([^)]+)\)\(([^)]+)\)\n?/gm, '<img alt="$1" src="$2"/><p class="md-legend">$3</p>'],
  [/!\[([^\]]+)\]\(([^)]+)\)\n?/gm, '<img alt="$1" src="$2"/>\n'],

  //links
  [/\[\]\(([^)]+)\)/g, '<a href="$1">$1</a>'],
  [/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>'],

  //headers
  [/\$?#{6} +(.+)\n?/gm, '<h6>$1</h6>'],
  [/\$?#{5} +(.+)\n?/gm, '<h5>$1</h5>'],
  [/\$?#{4} +(.+)\n?/gm, '<h4>$1</h4>'],
  [/\$?#{3} +(.+)\n?/gm, '<h3>$1</h3>'],
  [/\$?#{2} +(.+)\n?/gm, '<h2>$1</h2>'],
  [/\$?#{1} +(.+)\n?/gm, '<h1>$1</h1>'],

  //strong
  [/_{3,}([^_\n]+)_{3,}/g, '<strong>$1</strong>'],

  //bold
  [/_{2,}([^_\n]+)_{2,}/g, '<b>$1</b>'],

  //italic
  [/([^\/])_([^_\n]+)_/g, '$1<i>$2</i>'],
  [/^_([^_\n]+)_/g, '<i>$1</i>'], //ignoring formatting with slash
  [/\/_/g, '_'],

  //stars
  [/^(\*{3,})\n/gm, '<p class="md-delim">$1</p>'],

  //br
  [/\n{3,}/g, '\n\n'],
  [/\n/g, '<br/>'],
]

const md = (text: string, replaceEmTagWithCode: boolean, apiUrl?: string) => {
  let blocks = text.replace(/^```code\s*\n(((?!```)(.|\n))+)\n```\n?/gm, '<CODE>$1<CODE>').split('<CODE>')

  blocks = blocks.map((b, i) => {
    if (i % 2 === 0) {
      let res = mdToTags(b)

      if (replaceEmTagWithCode) {
        res = res.split(/<em>|<\/em>/).map((s, j) => {
          if (j % 2 !== 0) {
            return '<code>' + s.replace(/<b>|<\/b>/gm, '__').replace(/<i>|<\/i>/g, '_') + '</code>'
          } else {
            return s
          }
        }).join('')
      }

      if (apiUrl)
        res = res.replace(/src="((?!https?:)[^"]+)"/gm, 'src="' + apiUrl + '$1"')
      return res
    } else {
      return highlightMultilineCode(b, theme())
    }
  })
  return blocks.join('')
}

interface MarkdownProps extends TextProps {
  replaceEmTagWithCode?: boolean
  apiUrl?: string
}

export const Markdown = () => {
  return div<MarkdownProps>()
    .map(s => {
      s.htmlText = s.text ? md(s.text, s.replaceEmTagWithCode ?? false, s.apiUrl) : ''
      s.text = ''
    })
}

const highlightMultilineCode = (code: string, t: GlobalTheme): string => {
  return '<pre class="code-' + t.id + '"><code class="md-' + t.id + '">' + highlight(code) + '</code></pre>'
}

const mdToTags = (code: string): string => {
  let res = code
  rules.forEach((item) => {
    res = res.replace(item[0], item[1])
  })
  return res
}

export const grammar = new Grammar()
const highlight = (code: string): string => {
  let tokenRoot = grammar.tokenize(code)
  return htmlize(tokenRoot)
}

const htmlize = (root: MDToken): string => {
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
      case Lexema.Regex: res += '<span class="rx">' + text + '</span>'; break
      case Lexema.Keyword: res += '<span class="kw">' + text + '</span>'; break
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