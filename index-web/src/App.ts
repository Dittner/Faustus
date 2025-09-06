import { LayoutLayer } from "./global/Application"
import { GlobalContext } from "./global/GlobalContext"
import { MaterialIcon } from "./global/MaterialIcon"
import { theme, themeManager } from "./global/ThemeManager"
import { IconBtn } from "./index/ui/controls/Button"
import { FontFamily } from "./index/ui/controls/Font"
import { DemoView } from "./demo/ui/Demo"
import { IndexView } from "./index/ui/IndexView"
import { AnyUIComponent, div, h1, hstack, observer, p } from "flinker-dom"

export const globalContext = GlobalContext.init()

export function App() {
  const $module = globalContext.app.$location
    .pipe()
    .map(path => {
      const vv = path.split(/[/\#]/).filter(v => v)
      console.log('Get Module from values:', vv)
      return vv.length > 0 ? vv[0] : ''
    })
    .removeDuplicates()
    .fork()

  return div().children(() => {

    observer($module).onReceive(m => {
      console.log('Module has changed to:', m)
      let res: AnyUIComponent | undefined = undefined
      switch (m) {
        case 'demo': res = DemoView(); break
        case 'index': res = IndexView(); break
        case '': res = IndexView(); break
        default: res = PageNotFound()
      }

      res?.observe(themeManager.$theme, 'affectsProps', 'affectsChildrenProps')
        .react(s => {
          s.width = '100%'
          s.minHeight = '100vh'
        })

      return res
    })

    ErrorMsgView()
  })
}

const PageNotFound = () => {
  return h1().react(s => {
    s.text = 'Page not found'
    s.textAlign = 'center'
    s.paddingTop = window.innerHeight / 2 - 50 + 'px'
  })
}

const ErrorMsgView = () => {
  console.log('new ErrorMsgView')

  const app = globalContext.app

  return observer(app.$errorMsg)
    .onReceive(msg => {
      return msg.length > 0 &&
        hstack()
          .react(s => {
            s.halign = 'stretch'
            s.valign = 'center'
            s.position = 'fixed'
            s.width = '100%'
            s.bottom = '0'
            s.minHeight = '50px'
            s.bgColor = theme().red + '88'
            s.paddingHorizontal = '20px'
            s.layer = LayoutLayer.ERR_MSG
          }).children(() => {

            p()
              .react(s => {
                s.fontFamily = FontFamily.MONO
                s.width = '100%'
                s.textAlign = 'center'
                s.text = app.$errorMsg.value
                s.textColor = '#ffFFff'
                s.paddingLeft = '50px'
              })

            IconBtn()
              .react(s => {
                s.icon = MaterialIcon.close
                s.popUp = 'Close'
                s.iconSize = '25px'
                s.textColor = '#ffFFffaa'
              })
              .whenHovered(s => {
                s.textColor = '#ffFFff'
              })
              .onClick(() => app.$errorMsg.value = '')
          })
    })
}