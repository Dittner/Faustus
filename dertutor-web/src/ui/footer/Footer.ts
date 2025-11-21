import { hstack, p, span, vlist, vstack } from "flinker-dom"
import { Action } from "../actions/Action"
import { FontFamily } from "../controls/Font"
import { DertutorContext } from "../DertutorContext"
import { theme } from "../theme/ThemeManager"

export const Footer = () => {
  return vstack()
    .react(s => {
      s.gap = '0'
    })
    .children(() => {

      ActionsHelpView()
      StatusBar().children(() => {

        StatusBarModeName()
          .react(s => {
            s.text = 'Explore'
          })

        span()
          .react(s => {
            s.text = ''
            s.textColor = theme().statusFg
            s.width = '100%'
          })

        MessangerView()
      })
    })
}


export const ActionsHelpView = () => {
  const ctx = DertutorContext.self
  const total = ctx.actionsManager.actionsList.actions.length
  const col1 = ctx.actionsManager.actionsList.actions.slice(0, Math.ceil(total / 2))
  const col2 = ctx.actionsManager.actionsList.actions.slice(Math.ceil(total / 2))
  return hstack()
    .observe(ctx.actionsManager.$showActions)
    .react(s => {
      s.visible = ctx.actionsManager.$showActions.value
      s.fontFamily = FontFamily.MONO
      s.fontSize = '18px'
      s.width = '100%'
      s.gap = '0'
      s.paddingVertical = '20px'
      s.borderColor = theme().statusFg
      s.bgColor = theme().statusBg + '88'
      s.blur = '10px'
    }).children(() => {
      vlist<Action>()
        .items(() => col1)
        .itemHash(a => a.cmd)
        .itemRenderer(ActionInfoView)
        .react(s => {
          s.width = '50%'
          s.gap = '0'
        })

      vlist<Action>()
        .items(() => col2)
        .itemHash(a => a.cmd)
        .itemRenderer(ActionInfoView)
        .react(s => {
          s.width = '50%'
          s.gap = '0'
        })
    })
}

const ActionInfoView = (a: Action) => {
  return p()
    .react(s => {
      s.width = '100%'
      s.fontSize = '18px'
    }).children(() => {
      span().react(s => {
        s.display = 'inline-block'
        s.text = a.cmd
        s.textColor = theme().red
        s.paddingHorizontal = '20px'
        s.paddingVertical = '5px'
        s.width = '100px'
        s.whiteSpace = 'nowrap'
        s.textAlign = 'right'
      })

      span()
        .react(s => {
          s.text = a.desc
          s.textColor = theme().statusFg
          s.width = '100%'
          //s.whiteSpace = 'pre'
          s.paddingHorizontal = '20px'
          s.paddingVertical = '5px'
        })
    })
}


const StatusBar = () => {
  return hstack()
    .react(s => {
      s.fontFamily = FontFamily.MONO
      s.fontSize = theme().defMenuFontSize
      s.gap = '10px'
      s.width = '100%'
      s.height = theme().statusBarHeight + 'px'
      s.valign = 'center'
      s.bgColor = theme().statusBg + '88'
      s.blur = '5px'
    })
}

const StatusBarModeName = () => {
  return span()
    .react(s => {
      s.fontFamily = 'inherit'
      s.fontSize = 'inherit'
      s.paddingHorizontal = '20px'
      s.lineHeight = theme().statusBarHeight + 'px'
      s.height = theme().statusBarHeight + 'px'
      s.bgColor = theme().statusFg
      s.textColor = theme().statusBg
      s.whiteSpace = 'nowrap'
    })
}

const MessangerView = () => {
  const ctx = DertutorContext.self
  return p()
    .observe(ctx.$msg)
    .react(s => {
      const msg = ctx.$msg.value
      s.visible = msg !== undefined
      s.fontFamily = FontFamily.MONO
      s.fontSize = '18px'
      s.text = msg?.text ?? ''
      //s.bgColor = theme().appBg
      s.paddingHorizontal = '2px'
      s.whiteSpace = 'nowrap'

      if (msg?.level === 'error')
        s.textColor = theme().red
      else if (msg?.level === 'warning')
        s.textColor = theme().warn
      else
        s.textColor = theme().id === 'light' ? theme().black : theme().white
    })
}