// import { div, p, spacer, vstack } from "flinker-dom"
// import { IndexContext } from "../../../IndexContext"
// import { RedBtn } from "../../../controls/Button"
// import { theme } from "../../../theme/ThemeManager"
// import { FontFamily } from "../../../controls/Font"
// import { TextInput } from "../../../controls/Input"

// export const FileTextReplacer = () => {
//   const editor = IndexContext.self.reader
//   return vstack()
//     .react(s => {
//       s.width = '100%'
//       s.height = '100%'
//       s.halign = 'left'
//       s.valign = 'top'
//       s.gap = '15px'
//       s.padding = '40px'
//     }).children(() => {

//       TextInput(editor.$replaceSubstring)
//         .react(s => {
//           s.title = 'Text substring (RegExp):'
//           s.maxWidth = '400px'
//         })

//       TextInput(editor.$replaceWith)
//         .react(s => {
//           s.title = 'Replace with (RegExp):'
//           s.maxWidth = '400px'
//         })

//       RedBtn()
//         .react(s => {
//           s.text = 'Replace'
//           s.paddingVertical = '10px'
//           s.cornerRadius = '5px'
//         })
//         .onClick(() => editor.replaceWith())

//       spacer().react(s => s.height = '50px')

//       div()
//         .react(s => {
//           s.fontSize = theme().defFontSize
//           s.fontFamily = FontFamily.APP
//           s.textColor = theme().text
//         })
//         .children(() => {
//           p().react(s => s.text = 'E.g.')
//           p().react(s => s.text = 'Substring: (colo)(r)')
//           p().react(s => s.text = 'Replace with: $1u$2')
//           p().react(s => s.text = 'Result: colour')
//         })
//     })
// }
