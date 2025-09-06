import { div, TextProps } from "flinker-dom"
import { md } from "./MarkdownParser"

interface MarkdownProps extends TextProps {
  apiUrl?: string
}

export const Markdown = () => {
  return div<MarkdownProps>()
    .map(s => {
      // s.text = s.text ? md(s.text, s.apiUrl) : ''
      s.htmlText = s.text ? md(s.text, s.apiUrl) : ''
      s.text = ''
    })
}