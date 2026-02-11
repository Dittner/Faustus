import { RXObservableValue } from 'flinker'
import { globalContext } from '../App'
import { ServerConnection } from './mode/connect/ServerConnection'
import { OperatingMode } from './mode/OperatingMode'
import { FileReader } from './mode/read/FileReader'
import { FileExplorer } from './mode/explore/FileExplorer'
import { FileSearcher } from './mode/search/FileSearch'
import { log } from '../app/Logger'

export interface Message {
  readonly level?: 'warning' | 'error' | 'info'
  readonly text: string
}

export class IndexContext {
  readonly $mode: RXObservableValue<OperatingMode>

  //readonly $selectedFileChapter = new RXObservableValue('')
  readonly $msg = new RXObservableValue<Message | undefined>(undefined)

  readonly connection: ServerConnection
  readonly explorer: FileExplorer
  readonly reader: FileReader
  readonly searcher: FileSearcher
  static self: IndexContext

  static init() {
    if (IndexContext.self === undefined) {
      IndexContext.self = new IndexContext()
    }
    return IndexContext.self
  }

  private constructor() {
    log('new IndexContext')

    this.connection = new ServerConnection(this)
    this.$mode = new RXObservableValue(this.connection)
    this.explorer = new FileExplorer(this)
    this.reader = new FileReader(this)
    this.searcher = new FileSearcher(this)
    this.connection.activate()

    document.addEventListener('keydown', this.onKeyDown.bind(this))
  }

  private onKeyDown(e: KeyboardEvent): void {
    if (document.activeElement?.tagName !== 'INPUT')
      this.$mode.value.onKeyDown(e)
  }

  navigate(to: string) {
    globalContext.app.navigate(to)
  }
}

