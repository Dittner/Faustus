import { RXObservableValue } from "flinker"
import { btn, ButtonProps, span, StackHAlign, StackVAlign, TextProps } from "flinker-dom"
import { MaterialIcon } from "../MaterialIcon"
import { theme } from "../theme/ThemeManager"
import { FontFamily } from "./Font"

/*
*
* icon: span
*
**/

export interface IconProps extends TextProps {
  value?: MaterialIcon
}

export const Icon = <P extends IconProps>() => {
  return span<P>()
    .react(s => {
      s.value = MaterialIcon.question_mark
      s.className = 'material_icon'
      s.textSelectable = false
    })
    .map(s => s.text = s.value)
}


/*
*
* IconBtn
*
**/

export interface IconBtnProps extends ButtonProps {
  icon?: MaterialIcon
  iconSize?: string
  revert?: boolean
  halign?: StackHAlign
  valign?: StackVAlign
}

export const IconBtn = () => {
  const $sharedState = new RXObservableValue<IconBtnProps>({})
  return btn<IconBtnProps>()
    .propsDidChange(props => $sharedState.value = props)
    .react(s => {
      s.fontFamily = FontFamily.APP
      s.display = 'flex'
      s.flexDirection = 'row'
      s.alignItems = 'center'
      s.justifyContent = 'center'
      s.gap = '5px'
      s.wrap = false
      s.boxSizing = 'border-box'
    })
    .map(s => {
      s.flexDirection = s.revert ? 'row-reverse' : 'row'
      s.justifyContent = s.halign === 'left' ? 'flex-start' : s.halign === 'right' ? 'flex-end' : 'center'
      s.alignItems = s.valign === 'top' ? 'flex-start' : s.valign === 'bottom' ? 'flex-end' : 'center'
    })
    .children(() => {

      //icon
      $sharedState.value.icon && Icon()
        .observe($sharedState)
        .react(s => {
          const ss = $sharedState.value
          if (ss.icon) s.value = ss.icon
          if (ss.iconSize) s.fontSize = ss.iconSize
          s.textColor = 'inherit'
        })

      //text
      span()
        .observe($sharedState)
        .react(s => {
          const ss = $sharedState.value
          s.text = ss.text
          s.textColor = 'inherit'
          s.fontSize = ss.fontSize ?? 'inherit'
          s.fontFamily = 'inherit'
          s.overflow = 'hidden'
          s.textOverflow = 'ellipsis'
          s.visible = s.text !== '' && s.text !== undefined
        })
    })
}


/*
*
* RedBtn
*
**/

export const RedBtn = () => {
  return IconBtn()
    .react(s => {
      s.fontFamily = FontFamily.APP
      s.fontSize = '0.8rem'
      s.paddingBottom = '1px'
      s.paddingHorizontal = '5px'
      s.minHeight = '25px'
      s.gap = '2px'
      s.textColor = theme().red
      s.cornerRadius = '4px'
    })
    .whenHovered(s => {
      s.textColor = theme().isLight ? theme().red + 'cc' : theme().white
    })
    .whenSelected(s => {
      s.textColor = '#ffFFff'
      s.bgColor = theme().red
    })
}