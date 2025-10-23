import { AnyUIComponent, div, h1, observer } from "flinker-dom"
import { GlobalContext } from "./app/GlobalContext"
import { IndexView } from "./ui/IndexView"
import { themeManager } from "./ui/theme/ThemeManager"

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
        //case 'demo': res = DemoView(); break
        //case 'index': res = IndexView(); break
        case '': res = IndexView(); break
        default: res = IndexView()
        //default: res = PageNotFound()
      }

      res?.observe(themeManager.$theme, 'affectsProps', 'affectsChildrenProps')
        .react(s => {
          s.width = '100%'
          s.minHeight = '100vh'
        })

      return res
    })
  })
}

const PageNotFound = () => {
  return h1().react(s => {
    s.text = 'Page not found'
    s.textAlign = 'center'
    s.paddingTop = window.innerHeight / 2 - 50 + 'px'
  })
}
