import { RestApi } from "../index/infrastructure/backend/RestApi"
import { Application } from "./Application"
import { generateUID } from "./Utils"

export class GlobalContext {
  readonly uid = generateUID()
  readonly app: Application
  readonly restApi:RestApi

  static self: GlobalContext

  static init() {
    if (GlobalContext.self === undefined) {
      GlobalContext.self = new GlobalContext()
    }
    return GlobalContext.self
  }

  private constructor() {
    this.app = new Application()
    this.restApi = new RestApi()
  }
}