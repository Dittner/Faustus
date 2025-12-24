import { p } from "flinker-dom"
import { theme } from "../theme/ThemeManager"
import { FontFamily } from "./Font"

export const Title = (value: string) => {
  return p().react(s => {
    s.textColor = theme().text
    s.fontFamily = FontFamily.APP
    s.fontSize = theme().defMenuFontSize
    s.text = value
    s.fontWeight = 'bold'
  })
}