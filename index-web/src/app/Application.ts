import { RXObservableValue } from 'flinker'
import { log } from './Logger'

export interface Layout {
  isMobile: boolean
  navBarHeight: number
  statusBarHeight: number
  contentWidth: number
  menuWidth: number
}


export class Application {
  readonly $layout: RXObservableValue<Layout>
  readonly $windowWidth: RXObservableValue<number>
  readonly $location = new RXObservableValue('')
  readonly $scrollY = new RXObservableValue(0)

  readonly isMobileDevice: boolean

  constructor() {
    this.isMobileDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0)
    this.$windowWidth = new RXObservableValue(window.innerWidth)
    this.$layout = new RXObservableValue(this.getLayout())

    log('isMobileDevice: ' + this.isMobileDevice)
    log('localStorage, theme: ' + window.localStorage.getItem('theme'))
    window.addEventListener('resize', () => { this.$windowWidth.value = window.innerWidth })
    window.addEventListener('scroll', () => this.$scrollY.value = window.scrollY, false);
    this.watchHistoryEvents()
    this.updateLocation()
  }

  private getLayout(): Layout {
    const windowWidth = window.innerWidth - 20
    const contentWidth = this.isMobileDevice ? windowWidth : Math.min(950, windowWidth)
    const menuWidth = this.isMobileDevice ? 0 : Math.min(450, windowWidth - contentWidth)

    return {
      isMobile: this.isMobileDevice,
      navBarHeight: 50,
      statusBarHeight: 30,
      contentWidth,
      menuWidth
    }
  }

  navigate(to: string) {
    //log('Application:navigate:', to)
    window.history.pushState('', '', to);
  }

  private watchHistoryEvents() {
    const {pushState, replaceState} = window.history

    window.history.pushState = function(...args) {
      pushState.apply(window.history, args)
      window.dispatchEvent(new Event('pushState'))
      log('!!!! cur location:', document.location.pathname)
    }

    window.history.replaceState = function(...args) {
      replaceState.apply(window.history, args)
      window.dispatchEvent(new Event('replaceState'))
      log('!!!! cur location:', document.location.pathname)
    }

    window.addEventListener('popstate', () => { this.updateLocation() })
    window.addEventListener('replaceState', () => { this.updateLocation() })
    window.addEventListener('pushState', () => { this.updateLocation() })
  }

  private updateLocation() {
    this.$location.value = document.location.hash ? document.location.pathname + '#' + document.location.hash : document.location.pathname
  }
}
