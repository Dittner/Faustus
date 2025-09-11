import { theme } from "../../../global/ThemeManager"
import { BashCodeHighlighter } from "../highlight/BashHighlighter"
import { UniversalCodeHighlighter } from "../highlight/UniversalCodeHighlighter"

export const universalCodeHighlighter = new UniversalCodeHighlighter()
export const bashCodeHighlighter = new BashCodeHighlighter()

const highlightMultilineCode = (code: string): string => {
  const tokenRoot = universalCodeHighlighter.tokenize(code)
  const res = universalCodeHighlighter.htmlize(tokenRoot)
  return '<pre class="code-' + theme().id + '"><code class="md-' + theme().id + '">' + res + '</code></pre>'
}

const highlightBashCode = (code: string): string => {
  const tokenRoot = bashCodeHighlighter.tokenize(code)
  const res = bashCodeHighlighter.htmlize(tokenRoot)
  return '<pre class="code-' + theme().id + '"><code class="md-' + theme().id + '">' + res + '</code></pre>'
}

class MDInlineGrammarRule {
  matcher: [RegExp, any] = [new RegExp(''), '']
  childrenInlineRules: MDInlineGrammarRule[] = []
}

class MDLineGrammarRule {
  matcher: [RegExp, any] = [new RegExp(''), '']
  preProccessing?: (v: string) => string
  postProccessing?: (v: string) => string
  childrenInlineRules: MDInlineGrammarRule[] = []
}

class GlobalGrammarRule {
  postProccessing?: (v: string) => string
  childrenMultilineRules: MDMultilineGrammarRule[] = []
  childrenLineRules: MDLineGrammarRule[] = []
  childrenInlineRules: MDInlineGrammarRule[] = []
}

class MDMultilineGrammarRule {
  startMatcher: [RegExp, any] = [new RegExp(''), '']
  endMatcher: [RegExp, any] = [new RegExp(''), '']
  postProccessing?: (v: string) => string
  childrenMultilineRules: MDMultilineGrammarRule[] = []
  childrenLineRules: MDLineGrammarRule[] = []
  childrenInlineRules: MDInlineGrammarRule[] = []
}

class MDGrammar {
  readonly globalRule: GlobalGrammarRule
  constructor() {
    this.globalRule = new GlobalGrammarRule()
    const defLinePreproccessing = (v: string): string => {
      let res = v
      res = res.replace(/</g, '&lt;')
      //character escaping
      res = res.replace(/\/`/gm, '&#x60;')
      res = res.replace(/\/#/gm, '&#x23;')
      res = res.replace(/\/_/g, '&#x5f;')
      return res
    }

    // 
    // INLINE GRAMMAR RULES
    //

    const strong = new MDInlineGrammarRule()
    strong.matcher = [/_{3,}([^_]+)_{3,}/g, '<strong>$1</strong>']

    const bold = new MDInlineGrammarRule()
    bold.matcher = [/_{2,}([^_]+)_{2,}/g, '<b>$1</b>']

    const italic = new MDInlineGrammarRule()
    italic.matcher = [/_([^_]+)_/g, '<i>$1</i>']

    const em = new MDInlineGrammarRule()
    em.matcher = [/`([^`]+)`/g, '<em>$1</em>']
    em.childrenInlineRules = [strong, bold, italic]

    const code = new MDInlineGrammarRule()
    code.matcher = [/``([^`]+)``/g, '<code>$1</code>']

    const figure = new MDInlineGrammarRule()
    figure.matcher = [/!\[([^\]]+)\]\(([^)]+)\)\(([^)]+)\)/gm, '<figure><img alt="$1" src="$2"/><figcaption>$3</figcaption></figure>']

    const img = new MDInlineGrammarRule()
    img.matcher = [/!\[([^\]]+)\]\(([^)]+)\)/gm, '<img alt="$1" src="$2"/>']

    const link = new MDInlineGrammarRule()
    link.matcher = [/\[([^\]]*)\]\(([^)]+)\)/, (line: string, descr: string, url: string) => {
      return '<a href="' + url + '">' + (descr || url) + '</a>'
    }]

    this.globalRule.childrenInlineRules = [code, figure, img, link, strong, bold, em, italic]

    // 
    // LINE GRAMMAR RULES
    //

    const header = new MDLineGrammarRule()
    header.matcher = [/^\$?(#{1,6}) (.*)$/, (line: string, signs: string, header: string) => {
      const count = signs.length
      return '<h' + count + '>' + header + '</h' + count + '>'
    }]
    header.childrenInlineRules = [strong, bold, italic]
    header.preProccessing = defLinePreproccessing

    const bash = new MDLineGrammarRule()
    bash.matcher = [/^>>> /, '$ ']
    bash.postProccessing = highlightBashCode

    const quote = new MDLineGrammarRule()
    quote.matcher = [/^> (.*)$/, '<blockquote><p>$1</p></blockquote>']
    quote.childrenInlineRules = this.globalRule.childrenInlineRules
    quote.preProccessing = defLinePreproccessing

    const alignRight = new MDLineGrammarRule()
    alignRight.matcher = [/^==> (.*)$/, '<div class="md-right">$1</div>']
    alignRight.childrenInlineRules = this.globalRule.childrenInlineRules
    alignRight.preProccessing = defLinePreproccessing

    const alignCenter = new MDLineGrammarRule()
    alignCenter.matcher = [/^=> (.*)$/, '<div class="md-center">$1</div>']
    alignCenter.childrenInlineRules = this.globalRule.childrenInlineRules
    alignCenter.preProccessing = defLinePreproccessing

    const stars = new MDLineGrammarRule()
    stars.matcher = [/^(\*{3,})/, '<p class="md-delim">$1</p>']

    const p = new MDLineGrammarRule()
    p.matcher = [/^(.*)$/, '<p>$1</p>']
    p.childrenInlineRules = this.globalRule.childrenInlineRules
    p.preProccessing = defLinePreproccessing

    const br = new MDLineGrammarRule()
    br.matcher = [/^\n$/, '<br/>']

    const oli = new MDLineGrammarRule()
    oli.matcher = [/^\d+\. (.*)$/, '<li>$1</li>']
    oli.childrenInlineRules = this.globalRule.childrenInlineRules
    oli.preProccessing = defLinePreproccessing

    const uli = new MDLineGrammarRule()
    uli.matcher = [/^\+ (.*)$/, '<li>$1</li>']
    uli.childrenInlineRules = this.globalRule.childrenInlineRules
    uli.preProccessing = defLinePreproccessing

    this.globalRule.childrenLineRules = [header, bash, quote, alignCenter, alignRight, stars, br, p]

    //
    // MULTILINE GRAMMAR RULES
    //

    const mc = new MDMultilineGrammarRule()
    mc.startMatcher = [/^```code *$/, '']
    mc.endMatcher = [/^``` *$/, '']
    const mcLinebreak = new MDLineGrammarRule()
    mcLinebreak.matcher = [/^(.*)$/, '$1\n']
    mc.endMatcher = [/^``` *$/, '']
    const mcBr = new MDLineGrammarRule()
    mcBr.matcher = [/^\n$/, '\n']
    mc.childrenLineRules = [mcBr, mcLinebreak]
    mc.postProccessing = highlightMultilineCode

    const ol = new MDMultilineGrammarRule()
    const ul = new MDMultilineGrammarRule()
    ol.startMatcher = [/^```ol *$/, '<ol>']
    ol.endMatcher = [/^``` *$/, '</ol>']
    ol.childrenLineRules = [oli, bash, br, p]
    ol.childrenInlineRules = this.globalRule.childrenInlineRules
    ol.childrenMultilineRules = [ol, ul]

    ul.startMatcher = [/^```ul *$/, '<ul>']
    ul.endMatcher = [/^``` *$/, '</ul>']
    ul.childrenLineRules = [uli, bash, br, p]
    ul.childrenInlineRules = this.globalRule.childrenInlineRules
    ul.childrenMultilineRules = [ol, ul]

    const table = new MDMultilineGrammarRule()
    table.startMatcher = [/^```tbl *$/, '<table>']
    table.endMatcher = [/^``` *$/, '</table>']
    const tableRow = new MDLineGrammarRule()
    tableRow.matcher = [/^(.*)$/, (line: string) => {
      return '<tr>' + line.split(/,(?! )/).map(v => '<td>' + v + '</td>').join('') + '</tr>'
    }]
    tableRow.childrenInlineRules = this.globalRule.childrenInlineRules
    tableRow.preProccessing = defLinePreproccessing
    table.childrenLineRules = [tableRow]

    const div = new MDMultilineGrammarRule()
    div.startMatcher = [/^```([a-zA-Z]+) */, '<div class="$1"><div>']
    div.endMatcher = [/^``` *$/, '</div></div>']
    div.childrenInlineRules = this.globalRule.childrenInlineRules
    div.childrenLineRules = [quote, alignCenter, alignRight, br, p]
    div.childrenMultilineRules = [div]

    this.globalRule.childrenMultilineRules = [mc, ol, ul, table, div]

    console.log('this.globalRule.=', this.globalRule)
  }
}


class MDParserContext {
  readonly rows: string[]

  constructor(text: string) {
    this.rows = text.split('\n')
  }

  private _rowIndex: number = -1

  nextRow(): string | undefined {
    this._rowIndex++
    return this._rowIndex < this.rows.length ? this.rows[this._rowIndex] : undefined
  }
}

class MDParser {
  readonly globalRule: GlobalGrammarRule
  constructor(grammar: MDGrammar) {
    this.globalRule = grammar.globalRule
  }

  run(text: string): string {
    const ctx = new MDParserContext(text)
    return this.parseMultiline(ctx, this.globalRule)
  }

  private parseMultiline(ctx: MDParserContext, rule: MDMultilineGrammarRule | GlobalGrammarRule): string {
    let res = ''
    let exactlyMatched = false
    while (true) {
      let row = ctx.nextRow()
      if (row === undefined) break
      if (!row) row = '\n'

      exactlyMatched = false

      if (!(rule instanceof GlobalGrammarRule) && row.match(rule.endMatcher[0])) {
        res += row.replace(rule.endMatcher[0], rule.endMatcher[1])
        break
      }

      for (let i = 0; i < rule.childrenMultilineRules.length; i++) {
        const r = rule.childrenMultilineRules[i]
        if (row.match(r.startMatcher[0])) {
          exactlyMatched = true
          res += row.replace(r.startMatcher[0], r.startMatcher[1])
          res += this.parseMultiline(ctx, r)
          break
        }
      }

      if (exactlyMatched) continue

      for (let i = 0; i < rule.childrenLineRules.length; i++) {
        const r = rule.childrenLineRules[i]
        if (row.match(r.matcher[0])) {
          exactlyMatched = true
          let line = r.preProccessing ? r.preProccessing(row) : row
          line = line.replace(r.matcher[0], r.matcher[1])
          line = this.parseLine(line, r.childrenInlineRules)
          if (r.postProccessing) line = r.postProccessing(line)

          res += line
          break
        }
      }

      if (exactlyMatched) continue

      console.warn('Line is not handled by any rule, line: <', row, '>', 'parent rule:', rule)
      res += this.parseLine(row, rule.childrenInlineRules)
    }

    if (rule.postProccessing) res = rule.postProccessing(res)
    return res
  }

  // private parseLineOld(text: string, inlineRules: MDInlineGrammarRule[]): string {
  //   let res = text
  //   for (let i = 0; i < inlineRules.length; i++) {
  //     const r = inlineRules[i]
  //     res = res.replace(r.matcher[0], r.matcher[1])
  //   }
  //   return res
  // }

  private parseLine(text: string, inlineRules: MDInlineGrammarRule[]): string {
    if (!text || inlineRules.length === 0) return text
    if (inlineRules.length === 1) {
      return text.replace(inlineRules[0].matcher[0], inlineRules[0].matcher[1])
    }

    const buffer: string[] = []
    let rules = [...inlineRules]
    let value = text

    while (value) {
      const candidateRules = []
      let matchedRule: MDInlineGrammarRule | undefined
      let matchedRuleMinSearchIndex = value.length
      for (let i = 0; i < rules.length; i++) {
        const r = rules[i]
        const si = value.search(r.matcher[0])
        if (si !== -1) {
          candidateRules.push(r)
          if (si < matchedRuleMinSearchIndex) {
            matchedRuleMinSearchIndex = si
            matchedRule = r
          }
        }
      }

      if (!matchedRule) {
        buffer.push(value)
        break
      }

      buffer.push(value.substring(0, matchedRuleMinSearchIndex))
      value = value.substring(matchedRuleMinSearchIndex)

      let replacingSubstring = value.match(matchedRule.matcher[0])?.[0] ?? ''
      value = value.substring(replacingSubstring.length)

      replacingSubstring = replacingSubstring.replace(matchedRule.matcher[0], matchedRule.matcher[1])
      if (matchedRule.childrenInlineRules.length > 0)
        replacingSubstring = this.parseLine(replacingSubstring, matchedRule.childrenInlineRules)

      buffer.push(replacingSubstring)
      rules = candidateRules
    }

    return buffer.join('')
  }
}

const mdGrammar = new MDGrammar()
export const md = (text: string, apiUrl?: string) => {
  const parser = new MDParser(mdGrammar)
  let res = parser.run(text)
  // allow images to have a relative path
  if (apiUrl)
    res = res.replace(/src="((?!https?:)[^"]+)"/gm, 'src="' + apiUrl + '$1"')
  return res
}