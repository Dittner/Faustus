import { theme } from "../../../global/ThemeManager"
import { CodeHighlighter } from "./CodeHighlighter"

export const codeHighlighter = new CodeHighlighter()
const highlight = (code: string): string => {
  let tokenRoot = codeHighlighter.tokenize(code, true)
  return codeHighlighter.htmlize(tokenRoot)
}

const highlightMultilineCode = (code: string): string => {
  return '<pre class="code-' + theme().id + '"><code class="md-' + theme().id + '">' + highlight(code) + '</code></pre>'
}

class MDInlineGrammarRule {
  matcher: [RegExp, any] = [new RegExp(''), '']
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

    const code = new MDInlineGrammarRule()
    //to prevent formating underscores by bold, italic
    code.matcher = [/``([^`]+)``/g, (line: string, s: string) => {
      return '<code>' + s.replaceAll('_', '&#x5f;') + '</code>'
    }]

    const imgAndLegend = new MDInlineGrammarRule()
    imgAndLegend.matcher = [/!\[([^\]]+)\]\(([^)]+)\)\(([^)]+)\)/gm, '<img alt="$1" src="$2"/><p class="md-legend">$3</p>']

    const img = new MDInlineGrammarRule()
    img.matcher = [/!\[([^\]]+)\]\(([^)]+)\)/gm, '<img alt="$1" src="$2"/>']

    const link = new MDInlineGrammarRule()
    link.matcher = [/\[([^\]]*)\]\(([^)]+)\)/, (line: string, descr: string, url: string) => {
      return '<a href="' + url + '">' + (descr || url) + '</a>'
    }]

    this.globalRule.childrenInlineRules = [code, strong, bold, em, imgAndLegend, img, link, italic]

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
    bash.postProccessing = highlightMultilineCode

    const quote = new MDLineGrammarRule()
    quote.matcher = [/^> (.*)$/, '<blockquote><p>$1</p></blockquote>']
    quote.childrenInlineRules = [code, strong, bold, em, imgAndLegend, img, link, italic]
    quote.preProccessing = defLinePreproccessing

    const alignRight = new MDLineGrammarRule()
    alignRight.matcher = [/^==> (.*)$/, '<div class="md-right">$1</div>']
    alignRight.childrenInlineRules = [code, strong, bold, em, imgAndLegend, img, link, italic]
    alignRight.preProccessing = defLinePreproccessing

    const alignCenter = new MDLineGrammarRule()
    alignCenter.matcher = [/^=> (.*)$/, '<div class="md-center">$1</div>']
    alignCenter.childrenInlineRules = [code, strong, bold, em, imgAndLegend, img, link, italic]
    alignCenter.preProccessing = defLinePreproccessing

    const stars = new MDLineGrammarRule()
    stars.matcher = [/^(\*{3,})/, '<p class="md-delim">$1</p>']

    const p = new MDLineGrammarRule()
    p.matcher = [/^(.*)$/, '<p>$1</p>']
    p.childrenInlineRules = [code, strong, bold, em, imgAndLegend, img, link, italic]
    p.preProccessing = defLinePreproccessing

    const br = new MDLineGrammarRule()
    br.matcher = [/^\n$/, '<br/>']

    const oli = new MDLineGrammarRule()
    oli.matcher = [/^\d+\. (.*)$/, '<li>$1</li>']
    oli.childrenInlineRules = [code, strong, bold, em, imgAndLegend, img, link, italic]
    oli.preProccessing = defLinePreproccessing

    const uli = new MDLineGrammarRule()
    uli.matcher = [/^\+ (.*)$/, '<li>$1</li>']
    uli.childrenInlineRules = [code, strong, bold, em, imgAndLegend, img, link, italic]
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
    ol.childrenInlineRules = [code, strong, bold, em, imgAndLegend, img, link, italic]
    ol.childrenMultilineRules = [ol, ul]

    ul.startMatcher = [/^```ul *$/, '<ul>']
    ul.endMatcher = [/^``` *$/, '</ul>']
    ul.childrenLineRules = [uli, bash, br, p]
    ul.childrenInlineRules = [code, strong, bold, em, imgAndLegend, img, link, italic]
    ul.childrenMultilineRules = [ol, ul]

    const div = new MDMultilineGrammarRule()
    div.startMatcher = [/^```([a-zA-Z]+) */, '<div class="$1"><div>']
    div.endMatcher = [/^``` *$/, '</div></div>']
    div.childrenInlineRules = [code, strong, bold, em, imgAndLegend, img, link, italic]
    div.childrenLineRules = [quote, alignCenter, alignRight, br, p]
    div.childrenMultilineRules = [div]

    this.globalRule.childrenMultilineRules = [mc, ol, ul, div]

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

  private parseLine(text: string, inlineRules: MDInlineGrammarRule[]): string {
    let res = text
    for (let i = 0; i < inlineRules.length; i++) {
      const r = inlineRules[i]
      res = res.replace(r.matcher[0], r.matcher[1])
    }
    return res
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

      console.warn('Line not handled by any rule, line: <', row, '>', 'parent rule:', rule)
      res += this.parseLine(row, rule.childrenInlineRules)
    }

    if (rule.postProccessing) res = rule.postProccessing(res)
    return res
  }
}

const mdGrammar = new MDGrammar()
export const md = (text: string, apiUrl?: string) => {
  const parser = new MDParser(mdGrammar)
  let res = parser.run(text)
  // allow images relative path
  if (apiUrl)
    res = res.replace(/src="((?!https?:)[^"]+)"/gm, 'src="' + apiUrl + '$1"')
  return res
}