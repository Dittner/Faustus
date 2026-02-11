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

// noteParagraph
const noteParagraph = new MDLineGrammarRule()
noteParagraph.matcher = [/^\* (.*)$/, '<p class="md-note">$1</p>']
noteParagraph.childrenInlineRules = grammar.globalRule.childrenInlineRules
noteParagraph.preProccessing = grammar.defLinePreproccessing

grammar.globalRule.childrenLineRules.unshift(noteParagraph)
grammar.quoteMultiline.childrenLineRules.unshift(noteParagraph)
grammar.ol.childrenLineRules.unshift(noteParagraph)
grammar.ul.childrenLineRules.unshift(noteParagraph)
grammar.div.childrenLineRules.unshift(noteParagraph)

// noteMultiline
const noteMultiline = new MDMultilineGrammarRule()
noteMultiline.startMatcher = [/^\*\* *$/, '<div class="md-note">']
noteMultiline.endMatcher = [/^\*\* *$/, '</div>']
noteMultiline.childrenInlineRules = grammar.globalRule.childrenInlineRules
noteMultiline.childrenLineRules = grammar.div.childrenLineRules
noteMultiline.childrenMultilineRules = grammar.div.childrenMultilineRules
grammar.globalRule.childrenMultilineRules.unshift(noteMultiline)

// ruParagraph
const ruParagraph = new MDLineGrammarRule()
ruParagraph.matcher = [/^~ (.*)$/, '<p class="md-ru">$1</p>']
ruParagraph.childrenInlineRules = grammar.globalRule.childrenInlineRules
ruParagraph.preProccessing = grammar.defLinePreproccessing

grammar.globalRule.childrenLineRules.unshift(ruParagraph)
grammar.quoteMultiline.childrenLineRules.unshift(ruParagraph)
grammar.ol.childrenLineRules.unshift(ruParagraph)
grammar.ul.childrenLineRules.unshift(ruParagraph)
grammar.div.childrenLineRules.unshift(ruParagraph)

// ruMultiline
const ruMultiline = new MDMultilineGrammarRule()
ruMultiline.startMatcher = [/^~~ *$/, '<div class="md-ru">']
ruMultiline.endMatcher = [/^~~ *$/, '</div>']
ruMultiline.childrenInlineRules = grammar.globalRule.childrenInlineRules
ruMultiline.childrenLineRules = grammar.div.childrenLineRules
ruMultiline.childrenMultilineRules = grammar.div.childrenMultilineRules
grammar.globalRule.childrenMultilineRules.unshift(ruMultiline)


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