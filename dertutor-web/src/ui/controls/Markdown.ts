import { div, TextProps } from "flinker-dom"
import { md, MDGrammar, MDParser } from "flinker-markdown"

interface MarkdownProps extends TextProps {
  absolutePathPrefix?: string
  mode: 'md' | 'rawText' | 'rawHtml'
}

const parser = new MDParser(new MDGrammar())
export const Markdown = () => {
  return div<MarkdownProps>()
    .map(s => {
      if (s.mode === 'md') {
        s.htmlText = s.text ? md(parser, s.text, s.absolutePathPrefix) : ''
        s.text = ''
      } else if (s.mode === 'rawHtml') {
        s.text = s.text ? md(parser, s.text, s.absolutePathPrefix) : ''
      }
    })
}