import { DertutorServer } from "../backend/DertutorServer"
import { Application } from "./Application"
import { URLNavigator } from "./URLNavigator"
import { generateUID } from "./Utils"

export class GlobalContext {
  readonly uid = generateUID()
  readonly app: Application
  readonly server: DertutorServer
  readonly navigator: URLNavigator

  static self: GlobalContext

  static init() {
    if (GlobalContext.self === undefined) {
      GlobalContext.self = new GlobalContext()
    }
    return GlobalContext.self
  }

  private constructor() {
    this.app = new Application()
    this.navigator = new URLNavigator(this.app)
    this.server = new DertutorServer()
  }
}