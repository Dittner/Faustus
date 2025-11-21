import { div, TextProps } from "flinker-dom"
import { md, MDGrammar, MDParser } from "flinker-markdown"

interface MarkdownProps extends TextProps {
  absolutePathPrefix?: string
  showRawText?: boolean
}

const parser = new MDParser(new MDGrammar())
export const Markdown = () => {
  return div<MarkdownProps>()
    .map(s => {
      if (!s.showRawText) {
        s.htmlText = s.text ? md(parser, s.text, s.absolutePathPrefix) : ''
        s.text = ''
      }
    })
}