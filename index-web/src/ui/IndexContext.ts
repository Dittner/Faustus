import { RXObservableValue } from 'flinker'
import { globalContext } from '../App'
import { ServerConnection } from './mode/connect/ServerConnection'
import { OperatingMode } from './mode/OperatingMode'
import { FileReader } from './mode/read/FileReader'
import { FileExplorer } from './mode/explore/FileExplorer'
import { FileSearcher } from './mode/search/FileSearch'
import { log } from '../app/Logger'
import { KeyValueStore } from '../app/KeyValueStore'
import { RXStack } from '../app/Utils'
import { RecentOpenedFilesManager } from './mode/RecentOpenedFilesManager'
import { ActionController } from './mode/Action'

export interface Message {
  readonly level?: 'warning' | 'error' | 'info'
  readonly text: string
}

export class IndexContext {
  readonly $mode: RXObservableValue<OperatingMode>
  readonly $actionControllerStack = new RXStack<ActionController>()
  readonly $activeActionController = new RXObservableValue<ActionController | undefined>(undefined)
  readonly $msg = new RXObservableValue<Message | undefined>(undefined)

  readonly localStore: KeyValueStore
  readonly connection: ServerConnection
  readonly explorer: FileExplorer
  readonly reader: FileReader
  readonly searcher: FileSearcher
  readonly recentOpenedFilesManager: RecentOpenedFilesManager
  static self: IndexContext

  static init() {
    if (IndexContext.self === undefined) {
      IndexContext.self = new IndexContext()
    }
    return IndexContext.self
  }

  private constructor() {
    log('new IndexContext')

    this.localStore = new KeyValueStore('IndexLocalStore')
    this.recentOpenedFilesManager = new RecentOpenedFilesManager(this)
    this.connection = new ServerConnection(this)
    this.$mode = new RXObservableValue(this.connection)
    this.explorer = new FileExplorer(this)
    this.reader = new FileReader(this)
    this.searcher = new FileSearcher(this)
    this.connection.activate()

    this.$actionControllerStack.pipe()
      .onReceive(stack => {
        this.$activeActionController.value = stack.readLast()
      })
      .subscribe()

    document.addEventListener('keydown', this.onKeyDown.bind(this))
  }

  private onKeyDown(e: KeyboardEvent): void {
    if (document.activeElement?.tagName === 'INPUT') return
    this.$actionControllerStack.readLast()?.onKeyDown(e)
  }

  navigate(to: string) {
    globalContext.app.navigate(to)
  }
}
