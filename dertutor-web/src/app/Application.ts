import { RXObservableValue } from 'flinker'

export enum LayoutLayer {
  MINUS = '-1',
  ZERO = '0',
  ONE = '1',
  HEADER = '10',
  DOC_LIST = '20',
  POPUP = '30',
  MODAL = '40',
  ERR_MSG = '50',
}

export enum AppSize {
  XS = 'XS',
  S = 'S',
  M = 'M',
  L = 'L'
}

export interface BrowserLocation {
  path: string
  queries: string
}

export type UpdateUrlMode = 'push' | 'replace'

export class Application {
  readonly $size = new RXObservableValue<AppSize>(AppSize.L)
  readonly $location: RXObservableValue<BrowserLocation>
  readonly $pathName = new RXObservableValue('')
  readonly $scrollY = new RXObservableValue(0)
  readonly $err = new RXObservableValue('')

  readonly isMobileDevice: boolean

  constructor() {
    this.isMobileDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0)
    this.$location = new RXObservableValue({ path: document.location.pathname, queries: document.location.search })

    console.log('isMobileDevice: ' + this.isMobileDevice)
    console.log('localStorage, theme: ' + window.localStorage.getItem('theme'))
    window.addEventListener('resize', this.updateSize.bind(this))
    window.addEventListener('scroll', () => this.$scrollY.value = window.scrollY, false);
    this.watchHistoryEvents()
    this.updateLocation()
  }

  navigate(to: string, mode: UpdateUrlMode) {
    mode === 'push' ? window.history.pushState('', '', to) : window.history.replaceState('', '', to)
  }

  private updateSize(): void {
    const evaluatedSize = this.evaluateAppSize()
    if (this.$size.value !== evaluatedSize) {
      this.$size.value = evaluatedSize
    }
  }

  private evaluateAppSize(): AppSize {
    if (window.innerWidth > 1500) return AppSize.L
    if (window.innerWidth > 1200) return AppSize.M
    if (window.innerWidth > 767) return AppSize.S
    return AppSize.XS
  }

  private watchHistoryEvents() {
    const { pushState, replaceState } = window.history

    window.history.pushState = function (...args) {
      pushState.apply(window.history, args)
      window.dispatchEvent(new Event('pushState'))
      console.log('!!!! cur location:', document.location.pathname)
    }

    window.history.replaceState = function (...args) {
      replaceState.apply(window.history, args)
      window.dispatchEvent(new Event('replaceState'))
      console.log('!!!! cur location:', document.location.pathname)
    }

    window.addEventListener('popstate', () => { this.updateLocation() })
    window.addEventListener('replaceState', () => { this.updateLocation() })
    window.addEventListener('pushState', () => { this.updateLocation() })
  }

  private updateLocation() {
    this.$pathName.value = document.location.hash ? document.location.pathname + '#' + document.location.hash : document.location.pathname
    this.$location.value = { path: document.location.pathname, queries: document.location.search }
  }

  async copyTextToClipboard(value: string) {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(value);
      } else {
        console.warn('Clipboard API or writeText is not available in this browser.');
        // Fallback for older browsers if necessary (e.g., using document.execCommand('copy'))
        // This fallback is more complex and often requires creating a temporary element.
      }
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  }
}
