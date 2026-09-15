import { RXObservableValue } from "flinker"
import { DetTutorServer } from "../backend/DerTutorServer"
import { IndexServer } from "../backend/IndexServer"
import { Application } from "./Application"
import { generateUID, RXStack } from "./Utils"
import { OperatingMode } from "../ui/mode/OperatingMode"
import { ActionController } from "../ui/mode/Action"
import { KeyValueStore } from "./KeyValueStore"
import { ServerConnection } from "../ui/mode/connect/ServerConnection"
import { FileExplorer } from "../ui/mode/explore/FileExplorer"
import { FileSearcher } from "../ui/mode/search/FileSearch"
import { RecentOpenedFilesManager } from "../ui/mode/RecentOpenedFilesManager"
import { FileReader } from "../ui/mode/read/FileReader"
import { log } from "./Logger"

export interface Message {
  readonly level?: 'warning' | 'error' | 'info'
  readonly text: string
}


export class GlobalContext {
  readonly uid = generateUID()
  readonly app: Application
  readonly indexServer: IndexServer
  readonly derTutorServer: DetTutorServer

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

  static self: GlobalContext

  static init() {
    if (GlobalContext.self === undefined) {
      GlobalContext.self = new GlobalContext()
    }
    return GlobalContext.self
  }

  private constructor() {
    log('GlobalContext is initialized')
    this.app = new Application()
    this.indexServer = new IndexServer()
    this.derTutorServer = new DetTutorServer()
    
    this.localStore = new KeyValueStore('IndexLocalStore')
    this.recentOpenedFilesManager = new RecentOpenedFilesManager(this.localStore)
    this.connection = new ServerConnection()
    this.$mode = new RXObservableValue(this.connection)
    this.explorer = new FileExplorer()
    this.reader = new FileReader()
    this.searcher = new FileSearcher()

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
    this.app.navigate(to)
  }
}




