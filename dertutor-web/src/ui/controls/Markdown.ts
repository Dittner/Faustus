import { div, TextProps } from "flinker-dom"
import { md, MDGrammar, MDParser } from "flinker-markdown"

interface MarkdownProps extends TextProps {
  absolutePathPrefix?: string
  mark?: string
  mode: 'md' | 'rawText' | 'rawHtml'
}

const parser = new MDParser(new MDGrammar())
export const Markdown = () => {
  return div<MarkdownProps>()
    .map(s => {
      if (s.mode === 'md') {
        const value = s.text ? md(parser, s.text, s.absolutePathPrefix) : ''
        s.htmlText = s.mark ? value.replaceAll(s.mark, `<mark>${s.mark}</mark>`) : value
        s.text = ''
      } else if (s.mode === 'rawHtml') {
        const value = s.text ? md(parser, s.text, s.absolutePathPrefix) : ''
        s.text = s.mark ? value.replaceAll(s.mark, `<mark>${s.mark}</mark>`) : value
      }
    })
}