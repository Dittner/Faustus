import { div, TextProps } from "flinker-dom"
import { UniversalCodeHighlighter } from "../highlight/UniversalCodeHighlighter"
import { BashCodeHighlighter } from "../highlight/BashHighlighter"
import { theme } from "../theme/ThemeManager"
import { md, MDGrammar, MDLineGrammarRule, MDMultilineGrammarRule, MDParser } from "flinker-markdown"

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

// CUSTOM GRAMMAR RULES
const grammar = new MDGrammar()

const bash = new MDLineGrammarRule()
bash.matcher = [/^>>> /, '> ']
bash.postProccessing = highlightBashCode
grammar.globalRule.childrenLineRules.splice(0, 0, bash)
grammar.ol.childrenLineRules.splice(0, 0, bash)
grammar.ul.childrenLineRules.splice(0, 0, bash)

const mc = new MDMultilineGrammarRule()
mc.startMatcher = [/^```code *$/, '']
mc.endMatcher = [/^``` *$/, '']
const mcLinebreak = new MDLineGrammarRule()
mcLinebreak.matcher = [/^(.*)$/, '$1\n']
const mcBr = new MDLineGrammarRule()
mcBr.matcher = [/^\n$/, '\n']
mc.childrenLineRules = [mcBr, mcLinebreak]
mc.postProccessing = highlightMultilineCode
grammar.globalRule.childrenMultilineRules.splice(0, 0, mc)


interface MarkdownProps extends TextProps {
  absolutePathPrefix?: string
  showRawText?: boolean
}

const parser = new MDParser(grammar)
export const Markdown = () => {
  return div<MarkdownProps>()
    .map(s => {
      if (!s.showRawText) {
        s.htmlText = s.text ? md(parser, s.text, s.absolutePathPrefix) : ''
        s.text = ''
      }
    })
}