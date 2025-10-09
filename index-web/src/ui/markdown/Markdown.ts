import { div, TextProps } from "flinker-dom"
import { md } from "./MarkdownParser"

interface MarkdownProps extends TextProps {
  apiUrl?: string
  showRawText?: boolean
}

export const Markdown = () => {
  return div<MarkdownProps>()
    .map(s => {
      // s.text = s.text ? md(s.text, s.apiUrl) : ''
      if (!s.showRawText) {
        s.htmlText = s.text ? md(s.text, s.apiUrl) : ''
        s.text = ''
      }
    })
}