import { div, TextProps } from "flinker-dom";

import { md, MDGrammar, MDLineGrammarRule, MDMultilineGrammarRule, MDParser } from "flinker-markdown";
import { BashCodeHighlighter } from "./BashHighlighter";
import { UniversalCodeHighlighter } from "./UniversalCodeHighlighter";
import { theme } from "../ThemeManager";

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


// remark of user
const userRemark = new MDLineGrammarRule()
userRemark.matcher = [/^! (.*)$/, '<p class="md-user-remark">$1</p>']
grammar.globalRule.childrenInlineRules.push(userRemark)
noteParagraph.childrenInlineRules = grammar.globalRule.childrenInlineRules
noteParagraph.preProccessing = grammar.defLinePreproccessing

grammar.globalRule.childrenLineRules.unshift(noteParagraph, userRemark)
grammar.quoteMultiline.childrenLineRules.unshift(noteParagraph, userRemark)
grammar.ol.childrenLineRules.unshift(noteParagraph, userRemark)
grammar.ul.childrenLineRules.unshift(noteParagraph, userRemark)
grammar.div.childrenLineRules.unshift(noteParagraph, userRemark)

// noteMultiline
const noteMultiline = new MDMultilineGrammarRule()
noteMultiline.startMatcher = [/^\*\* *$/, '<div class="md-note">']
noteMultiline.endMatcher = [/^\*\* *$/, '</div>']
noteMultiline.childrenInlineRules = grammar.globalRule.childrenInlineRules
noteMultiline.childrenLineRules = grammar.div.childrenLineRules
noteMultiline.childrenMultilineRules = grammar.div.childrenMultilineRules
grammar.globalRule.childrenMultilineRules.unshift(noteMultiline)

// transParagraph
const transParagraph = new MDLineGrammarRule()
transParagraph.matcher = [/^~ (.*)$/, '<p class="md-trans">$1</p>']
transParagraph.childrenInlineRules = grammar.globalRule.childrenInlineRules
transParagraph.preProccessing = grammar.defLinePreproccessing

grammar.globalRule.childrenLineRules.unshift(transParagraph)
grammar.quoteMultiline.childrenLineRules.unshift(transParagraph)
grammar.ol.childrenLineRules.unshift(transParagraph)
grammar.ul.childrenLineRules.unshift(transParagraph)
grammar.div.childrenLineRules.unshift(transParagraph)

// transMultiline
const transMultiline = new MDMultilineGrammarRule()
transMultiline.startMatcher = [/^~~ *$/, '<div class="md-trans">']
transMultiline.endMatcher = [/^~~ *$/, '</div>']
transMultiline.childrenInlineRules = grammar.globalRule.childrenInlineRules
transMultiline.childrenLineRules = grammar.div.childrenLineRules
transMultiline.childrenMultilineRules = grammar.div.childrenMultilineRules
grammar.globalRule.childrenMultilineRules.unshift(transMultiline)

// twoColumLayoutParagraph
const leftColumnParagraph = new MDMultilineGrammarRule()
leftColumnParagraph.startMatcher = [/^\[1\] *$/, '<div class="md-left">']
leftColumnParagraph.endMatcher = [/^\[\] *$/, '</div>']
leftColumnParagraph.childrenInlineRules = grammar.globalRule.childrenInlineRules
leftColumnParagraph.childrenLineRules = grammar.div.childrenLineRules
leftColumnParagraph.childrenMultilineRules = grammar.div.childrenMultilineRules
grammar.globalRule.childrenMultilineRules.unshift(leftColumnParagraph)

const twoColumnLayout = new MDMultilineGrammarRule()
const columnDivider = new MDLineGrammarRule()
columnDivider.matcher = [/^~~ *$/, '</td><td>']
columnDivider.childrenInlineRules = grammar.globalRule.childrenInlineRules
columnDivider.preProccessing = grammar.defLinePreproccessing

const tblRowRule = new MDLineGrammarRule()
tblRowRule.matcher = [/^\n$/, '</td></tr><tr><td>']

twoColumnLayout.startMatcher = [/^```two *$/, '<table class="twoColumnLayout"><tr><td>']
twoColumnLayout.endMatcher = [/^``` *$/, '</td></tr></table>']
twoColumnLayout.childrenInlineRules = grammar.globalRule.childrenInlineRules
twoColumnLayout.childrenLineRules = [columnDivider, tblRowRule, ...grammar.globalRule.childrenLineRules]
twoColumnLayout.childrenMultilineRules = grammar.div.childrenMultilineRules
grammar.globalRule.childrenMultilineRules.unshift(twoColumnLayout)

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