import { RXObservableValue } from "flinker"
import { btn, ButtonProps, link, span, TextProps } from "flinker-dom"
import { MaterialIcon } from "../icons/MaterialIcon"
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
      s.className = 'md-icon'
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
      $sharedState.value.text && span()
        .observe($sharedState)
        .react(s => {
          const ss = $sharedState.value
          s.text = ss.text
          s.textColor = 'inherit'
          s.fontSize = 'inherit'
          s.fontFamily = 'inherit'
        })
    })
}

/*
*
* Btn
*
**/

export const RedBtn = () => {
  return IconBtn()
    .react(s => {
      s.fontFamily = FontFamily.APP
      s.fontSize = theme().defMenuFontSize
      s.iconSize = theme().defFontSize
      s.minHeight = '25px'
      s.gap = '2px'
      s.textColor = theme().red + 'cc'
      s.cornerRadius = '4px'
    })
    .whenHovered(s => {
      s.textColor = theme().red
    })
    .whenSelected(s => {
      s.textColor = theme().accent
      s.bgColor = theme().header
    })
}

export const Btn = () => {
  return IconBtn()
    .react(s => {
      s.fontFamily = FontFamily.APP
      s.fontSize = theme().defMenuFontSize
      s.iconSize = theme().defFontSize
      s.minHeight = '35px'
      s.gap = '2px'
      s.textColor = theme().text50
      s.cornerRadius = '4px'
    })
    .whenHovered(s => {
      s.textColor = theme().text
    })
    .whenSelected(s => {
      s.textColor = theme().accent
    })
}

/*
*
* Link
*
**/

export const LinkBtn = () => {
  return btn()
    .react(s => {
      s.wrap = false
      s.fontFamily = FontFamily.MONO
      s.fontSize = theme().defMenuFontSize
      s.textColor = theme().link + 'cc'
      s.minHeight = '35px'
      s.bgColor = theme().transparent
    })
    .whenHovered(s => {
      s.textColor = theme().link
    })
    .whenSelected(s => {
      s.textColor = theme().appBg
      s.bgColor = theme().link + 'cc'
    })
}

export const Link = () => {
  return link()
    .react(s => {
      s.wrap = false
      s.fontFamily = FontFamily.MONO
      s.fontSize = theme().defMenuFontSize
      s.textColor = theme().link
      s.bgColor = theme().transparent
    })
    .whenHovered(s => {
      s.textDecoration = 'underline'
    })
    .whenSelected(s => {
      s.textColor = theme().appBg
      s.bgColor = theme().link
    })
}