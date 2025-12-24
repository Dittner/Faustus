import { RXObservableValue } from "flinker"
import { UrlKeys } from "../../app/URLNavigator"
import { DerTutorContext } from "../../DerTutorContext"

export class Interactor<State> {
  readonly ctx: DerTutorContext
  readonly $state = new RXObservableValue<State>({} as State)
  prevState: State = {} as State

  constructor(ctx: DerTutorContext) {
    this.ctx = ctx
  }

  private unsubscribeColl: (() => void)[] = []
  dispose(): void {
    this.unsubscribeColl.forEach(f => f())
    this.unsubscribeColl.length = 0
  }

  private isLoading = false
  private reloadCycleDepth = 0
  private newKeys: UrlKeys | undefined

  async run(keys: UrlKeys) {
    if (this.isLoading) {
      console.log('Got keys when loading')
      this.newKeys = keys
      return
    }

    const state: State = {} as State

    try {
      this.newKeys = undefined
      this.isLoading = true

      await this.load(state, keys)

      this.prevState = state
      this.isLoading = false

      if (this.newKeys) {
        this.reloadCycleDepth++
        if (this.reloadCycleDepth > 10) this.ctx.$msg.value = { text: 'Infinite loop of reloading pages', level: 'warning' }
        else this.run(this.newKeys)
      }
      else {
        this.reloadCycleDepth = 0
        this.$state.value = state
      }

    } catch (e: any) {
      console.log('Error:', e)
      this.errorDidCatch(e, state)
      this.$state.value = {} as State
    } finally {
      this.reloadCycleDepth = 0
    }
  }

  async load(state: State, keys: UrlKeys) { }

  protected errorDidCatch(e: any, state: State) {
    this.ctx.$msg.value = { level: 'error', text: e.message }
  }

  clearCache() {
    this.prevState = {} as State
  }
}
