import { DetTutorServer } from "../backend/DerTutorServer"
import { IndexServer } from "../backend/IndexServer"
import { Application } from "./Application"
import { generateUID } from "./Utils"

export class GlobalContext {
  readonly uid = generateUID()
  readonly app: Application
  readonly indexServer: IndexServer
  readonly derTutorServer: DetTutorServer

  static self: GlobalContext

  static init() {
    if (GlobalContext.self === undefined) {
      GlobalContext.self = new GlobalContext()
    }
    return GlobalContext.self
  }

  private constructor() {
    this.app = new Application()
    this.indexServer = new IndexServer()
    this.derTutorServer = new DetTutorServer()
  }
}